import {
  playBoardControlAreas,
  playBoardFlows,
  playBoardPlanes,
  playBoardScreens,
  playBoardStatuses,
  playBoardWorkItems,
} from "./registries";
import type {
  PlayBoardControlArea,
  PlayBoardControlAreaId,
  PlayBoardFlow,
  PlayBoardPlaneId,
  PlayBoardScreen,
  PlayBoardScreenKey,
  PlayBoardStatusId,
  PlayBoardWave,
  PlayBoardWorkItem,
  PlayBoardWorkStatus,
} from "./types";

export function screenKey(screen: Pick<PlayBoardScreen, "plane" | "slug">): PlayBoardScreenKey {
  return `${screen.plane}/${screen.slug}`;
}

export function getScreenByKey(key: string): PlayBoardScreen | undefined {
  return playBoardScreens.find((screen) => screenKey(screen) === key);
}

export function getScreen(plane: string, slug: string): PlayBoardScreen | undefined {
  return playBoardScreens.find((screen) => screen.plane === plane && screen.slug === slug);
}

export function getPlane(id: string) {
  return playBoardPlanes.find((plane) => plane.id === id);
}

export function getFlow(id: string): PlayBoardFlow | undefined {
  return playBoardFlows.find((flow) => flow.id === id);
}

export function getControlArea(id: string): PlayBoardControlArea | undefined {
  return playBoardControlAreas.find((area) => area.id === id);
}

export function getWorkItem(id: string): PlayBoardWorkItem | undefined {
  return playBoardWorkItems.find((item) => item.id === id);
}

export function getStatus(id: PlayBoardStatusId) {
  return playBoardStatuses.find((status) => status.id === id);
}

export function screensForPlane(plane: PlayBoardPlaneId) {
  return playBoardScreens.filter((screen) => screen.plane === plane);
}

export function screensForFlow(flow: PlayBoardFlow) {
  return flow.screens.map((key) => getScreenByKey(key)).filter((screen): screen is PlayBoardScreen => Boolean(screen));
}

export function screensForControlArea(area: PlayBoardControlAreaId) {
  return playBoardScreens.filter((screen) => Object.hasOwn(screen.engineering.controlAreaNotes, area));
}

export function workItemsForScreen(screen: PlayBoardScreen) {
  const ids = new Set(screen.workItems);
  return playBoardWorkItems.filter((item) => ids.has(item.id));
}

export function countScreensByStatus() {
  return playBoardStatuses.map((status) => ({
    status,
    count: playBoardScreens.filter((screen) => screen.status === status.id).length,
  }));
}

export function countWorkItemsByStatus() {
  const statuses: PlayBoardWorkStatus[] = ["not_started", "in_review", "done"];

  return statuses.map((status) => ({
    status,
    count: playBoardWorkItems.filter((item) => item.status === status).length,
  }));
}

export function coverageByControlArea() {
  return playBoardControlAreas.map((area) => ({
    area,
    screens: screensForControlArea(area.id),
    covered: screensForControlArea(area.id).length,
  }));
}

export function matrixRows() {
  return playBoardScreens.map((screen) => ({
    screen,
    key: screenKey(screen),
    workItems: workItemsForScreen(screen),
    controlAreaNotes: playBoardControlAreas.map((area) => ({
      area,
      note: screen.engineering.controlAreaNotes[area.id] ?? null,
    })),
  }));
}

export function deriveWaves(): PlayBoardWave[] {
  const itemById = new Map<string, PlayBoardWorkItem>(playBoardWorkItems.map((item) => [item.id, item]));
  const levelById = new Map<string, number>();
  const visiting = new Set<string>();

  function levelFor(item: PlayBoardWorkItem): number {
    if (item.status === "done") return -1;
    const cached = levelById.get(item.id);
    if (cached !== undefined) return cached;

    if (visiting.has(item.id)) {
      throw new Error(`PlayBoard work item cycle detected at ${item.id}`);
    }

    visiting.add(item.id);
    const incompleteDependencyLevels = item.dependsOn
      .map((id) => itemById.get(id))
      .filter((dependency): dependency is NonNullable<typeof dependency> => dependency !== undefined)
      .map((dependency) => levelFor(dependency))
      .filter((level) => level >= 0);
    visiting.delete(item.id);

    const level = item.status === "in_review" ? 0 : Math.max(-1, ...incompleteDependencyLevels) + 1;
    levelById.set(item.id, level);

    return level;
  }

  const buckets = new Map<number, PlayBoardWorkItem[]>();

  for (const item of playBoardWorkItems) {
    const level = levelFor(item);
    if (level < 0) continue;
    buckets.set(level, [...(buckets.get(level) ?? []), item]);
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([level, items], index) => ({
      level,
      title: `Wave ${index + 1}`,
      workItems: items,
      blockedBy: Array.from(new Set(items.flatMap((item) => item.dependsOn))).filter((id) => {
        const dependency = itemById.get(id);
        return dependency && dependency.status !== "done";
      }),
    }));
}

export function statusRank(status: PlayBoardStatusId) {
  return getStatus(status)?.rank ?? 0;
}

