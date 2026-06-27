export type PlayBoardPlaneId = "b2c" | "b2b" | "ops" | "system";

export type PlayBoardStatusId = "planned" | "partial" | "implemented" | "verified";

export type PlayBoardWorkStatus = "not_started" | "in_review" | "done";

export type PlayBoardDesignSpecType = "service" | "content" | "operations" | "system-state";

export type PlayBoardControlAreaId =
  | "data-accuracy"
  | "finance-policy"
  | "security-access"
  | "preview-deploy"
  | "performance"
  | "observability"
  | "ux-safety";

export type PlayBoardScreenKey = `${PlayBoardPlaneId}/${string}`;

export type PlayBoardEngineering = {
  authGate: string;
  clientActions: string[];
  serverActions: string[];
  dataReads: string[];
  dataWrites: string[];
  telemetryEvents: string[];
  exceptionStates: string[];
  controlAreaNotes: Partial<Record<PlayBoardControlAreaId, string>>;
};

export type PlayBoardScreen = {
  plane: PlayBoardPlaneId;
  slug: string;
  title: string;
  route: string;
  designSpecType: PlayBoardDesignSpecType;
  flowNote: string;
  status: PlayBoardStatusId;
  statusNote?: string;
  workItems: string[];
  requirementRefs: string[];
  implLocation?: string;
  demoStrategy: "real-route" | "mock";
  engineering: PlayBoardEngineering;
};

export type PlayBoardPlane = {
  id: PlayBoardPlaneId;
  title: string;
  description: string;
};

export type PlayBoardStatus = {
  id: PlayBoardStatusId;
  label: string;
  rank: number;
  description: string;
};

export type PlayBoardWorkItem = {
  id: string;
  title: string;
  phase: string;
  status: PlayBoardWorkStatus;
  externalRefs?: string[];
  dependsOn: string[];
  screens: PlayBoardScreenKey[];
  doc: string;
};

export type PlayBoardControlArea = {
  id: PlayBoardControlAreaId;
  title: string;
  goal: string;
  summary: string;
  policies: Array<{ statement: string; detail: string }>;
  decisions: Array<{ name: string; value: string }>;
  standards: Array<{ title: string; path: string }>;
  workItems: string[];
  gaps: string[];
};

export type PlayBoardFlow = {
  id: string;
  plane: PlayBoardPlaneId;
  title: string;
  description: string;
  kind: "sequence" | "case-set";
  screens: PlayBoardScreenKey[];
};

export type PlayBoardWave = {
  level: number;
  title: string;
  workItems: PlayBoardWorkItem[];
  blockedBy: string[];
};

