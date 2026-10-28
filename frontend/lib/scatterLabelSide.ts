export type LabelSide = "left" | "right";

export type LabelSideAnchor = {
  id: string;
  stageIndex: number;
  x: number;
  y: number;
  name: string;
};

/** Visual neighbors: same stage, close in Y (억) and X (stage units). */
export const LABEL_COLLIDE_Y_EOK = 0.15;
export const LABEL_COLLIDE_X = 0.35;

export function preferredLabelSide(stageIndex: number): LabelSide {
  return stageIndex <= 2 ? "left" : "right";
}

function find(parent: number[], index: number): number {
  if (parent[index] !== index) parent[index] = find(parent, parent[index]);
  return parent[index];
}

/**
 * Only dots that sit next to each other split left/right.
 * A wide Y-only chain (사당12 + 상도21 + 중화6) is not one cluster.
 */
export function assignLabelSides(
  points: LabelSideAnchor[],
  yGap = LABEL_COLLIDE_Y_EOK,
  xGap = LABEL_COLLIDE_X,
): Map<string, LabelSide> {
  const sideById = new Map<string, LabelSide>();
  const byStage = new Map<number, LabelSideAnchor[]>();

  for (const point of points) {
    byStage.set(point.stageIndex, [...(byStage.get(point.stageIndex) ?? []), point]);
  }

  for (const group of byStage.values()) {
    const parent = group.map((_, index) => index);

    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const dy = Math.abs(group[i].y - group[j].y);
        const dx = Math.abs(group[i].x - group[j].x);
        if (dy < yGap && dx < xGap) {
          parent[find(parent, j)] = find(parent, i);
        }
      }
    }

    const clusters = new Map<number, LabelSideAnchor[]>();
    group.forEach((point, index) => {
      const root = find(parent, index);
      clusters.set(root, [...(clusters.get(root) ?? []), point]);
    });

    for (const cluster of clusters.values()) {
      if (cluster.length === 1) {
        sideById.set(cluster[0].id, preferredLabelSide(cluster[0].stageIndex));
        continue;
      }

      const sortedX = [...cluster].sort(
        (left, right) => left.x - right.x || left.name.localeCompare(right.name, "ko"),
      );
      sortedX.forEach((point, index) => {
        if (index === 0) sideById.set(point.id, "left");
        else if (index === sortedX.length - 1) sideById.set(point.id, "right");
        else sideById.set(point.id, index % 2 === 0 ? "left" : "right");
      });
    }
  }

  return sideById;
}
