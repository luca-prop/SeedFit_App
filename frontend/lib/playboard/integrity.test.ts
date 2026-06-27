import { existsSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

import { playBoardControlAreas, playBoardFlows, playBoardPlanes, playBoardScreens, playBoardWorkItems } from "./registries";
import { screenKey } from "./derive";
import type { PlayBoardControlAreaId, PlayBoardScreen, PlayBoardWorkItem } from "./types";

const repoRoot = path.resolve(process.cwd(), "..");
const screens: readonly PlayBoardScreen[] = playBoardScreens;
const workItems: readonly PlayBoardWorkItem[] = playBoardWorkItems;
const screenKeys = new Set(screens.map((screen) => screenKey(screen)));
const workItemIds = new Set(workItems.map((item) => item.id));
const planeIds = new Set(playBoardPlanes.map((plane) => plane.id));
const controlAreaIds = new Set(playBoardControlAreas.map((area) => area.id));
const systemScreenSlugs = new Set(screens.filter((screen) => screen.plane === "system").map((screen) => screen.slug));

function assertNoDuplicate(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  assert.deepEqual(Array.from(new Set(duplicates)), [], `${label} has duplicate ids`);
}

function assertAcyclicWorkItems() {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string, trail: string[]) {
    if (visited.has(id)) return;
    assert(!visiting.has(id), `WorkItem DAG cycle: ${[...trail, id].join(" -> ")}`);

    const item = workItems.find((candidate) => candidate.id === id);
    assert(item, `Missing work item ${id}`);

    visiting.add(id);
    for (const dependencyId of item.dependsOn) {
      visit(dependencyId, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const item of playBoardWorkItems) {
    visit(item.id, []);
  }
}

assertNoDuplicate(playBoardScreens.map((screen) => screenKey(screen)), "screens");
assertNoDuplicate(playBoardWorkItems.map((item) => item.id), "workItems");
assertNoDuplicate(playBoardControlAreas.map((area) => area.id), "controlAreas");
assertNoDuplicate(playBoardFlows.map((flow) => flow.id), "flows");

for (const screen of screens) {
  assert(planeIds.has(screen.plane), `Screen ${screenKey(screen)} references unknown plane ${screen.plane}`);

  for (const workItemId of screen.workItems) {
    assert(workItemIds.has(workItemId), `Screen ${screenKey(screen)} references missing work item ${workItemId}`);
  }

  for (const exceptionState of screen.engineering.exceptionStates) {
    assert(systemScreenSlugs.has(exceptionState), `Screen ${screenKey(screen)} references invalid exception state ${exceptionState}`);
  }

  for (const controlAreaId of Object.keys(screen.engineering.controlAreaNotes) as PlayBoardControlAreaId[]) {
    assert(controlAreaIds.has(controlAreaId), `Screen ${screenKey(screen)} uses unknown control area ${controlAreaId}`);
  }

  if (screen.status === "implemented" || screen.status === "verified") {
    assert(screen.implLocation, `Screen ${screenKey(screen)} is ${screen.status} but has no implLocation`);
  }
}

for (const item of workItems) {
  for (const dependencyId of item.dependsOn) {
    assert(workItemIds.has(dependencyId), `Work item ${item.id} depends on missing ${dependencyId}`);
  }

  for (const relatedScreen of item.screens) {
    assert(screenKeys.has(relatedScreen), `Work item ${item.id} references missing screen ${relatedScreen}`);
  }
}

assertAcyclicWorkItems();

for (const flow of playBoardFlows) {
  assert(planeIds.has(flow.plane), `Flow ${flow.id} references unknown plane ${flow.plane}`);

  for (const relatedScreen of flow.screens) {
    const screen = screens.find((candidate) => screenKey(candidate) === relatedScreen);
    assert(screen, `Flow ${flow.id} references missing screen ${relatedScreen}`);
    assert.equal(screen.plane, flow.plane, `Flow ${flow.id} includes screen ${relatedScreen} from another plane`);
  }
}

for (const area of playBoardControlAreas) {
  for (const itemId of area.workItems) {
    assert(workItemIds.has(itemId), `Control area ${area.id} references missing work item ${itemId}`);
  }

  for (const standard of area.standards) {
    const fullPath = path.join(repoRoot, standard.path);
    assert(existsSync(fullPath), `Control area ${area.id} standard path does not exist: ${standard.path}`);
  }
}

console.log("PlayBoard integrity checks passed.");

