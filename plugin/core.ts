export type AgentTrondoMode = "quick" | "deep" | "ultrawork"

export type AgentTrondoSpecialistId =
  | "openagent"
  | "opencoder"
  | "opencopywriter"
  | "opendataanalyst"
  | "openrepomanager"
  | "opensystembuilder"
  | "opentechnicalwriter"
  | "deepagent"
  | "ultraworker"

export type AgentTrondoSpecialist = {
  id: AgentTrondoSpecialistId
  label: string
  role: string
  focus: string
}

export type AgentTrondoTask = {
  id: string
  title: string
  owner: AgentTrondoSpecialistId
  outcome: string
}

export type AgentTrondoPhase = {
  id: string
  title: string
  purpose: string
  tasks: AgentTrondoTask[]
}

export type AgentTrondoPlan = {
  mission: string
  mode: AgentTrondoMode
  summary: string
  selectedSpecialists: AgentTrondoSpecialist[]
  phases: AgentTrondoPhase[]
  outputs: string[]
  reasoning: AgentTrondoReasoningProfile
}

export type AgentTrondoRunStatus = "draft" | "running" | "paused" | "completed"

export type AgentTrondoPhaseRunStatus = "pending" | "active" | "completed"

export type AgentTrondoArtifact = {
  id: string
  label: string
  kind: "plan" | "assignment" | "artifact" | "handoff"
  createdBy: AgentTrondoSpecialistId
}

export type AgentTrondoPhaseState = {
  phaseId: string
  status: AgentTrondoPhaseRunStatus
  completedTaskIds: string[]
  activeTaskId?: string
}

export type AgentTrondoRun = {
  runId: string
  status: AgentTrondoRunStatus
  currentPhaseId: string
  activeSpecialistIds: AgentTrondoSpecialistId[]
  phaseStates: AgentTrondoPhaseState[]
  artifacts: AgentTrondoArtifact[]
  notes: string[]
  createdAt: number
  updatedAt: number
}

export type AgentTrondoReasoningPhase = {
  id:
    | "phase_0_god_mode_activation"
    | "phase_1_problem_absorption"
    | "phase_2_multiverse_decomposition"
    | "phase_3_master_strategist"
    | "phase_4_creative_synthesis"
    | "phase_5_execution_ritual"
    | "phase_6_post_game_domination"
  title: string
  purpose: string
  outputs: string[]
}

export type AgentTrondoSolutionTimeline = {
  id: "minimal_viable_god" | "scalable_enterprise" | "future_proof_legendary"
  label: string
  profile: string
  strengths: string[]
}

export type AgentTrondoReasoningProfile = {
  vibe: "surgical_minimalism" | "architectural_masterpiece" | "chaotic_genius"
  inferredUserProfile: {
    skillLevel: "builder" | "advanced_builder" | "system_designer"
    taste: string
    wizardryTolerance: "low" | "medium" | "high"
  }
  hiddenIntent: string
  realConstraints: string[]
  timelines: AgentTrondoSolutionTimeline[]
  selectedTimelineId: AgentTrondoSolutionTimeline["id"]
  paradigms: string[]
  observability: string[]
  securityPosture: string[]
  futureRequests: string[]
  phases: AgentTrondoReasoningPhase[]
}

const SPECIALISTS: AgentTrondoSpecialist[] = [
  { id: "openagent", label: "OpenAgent", role: "orchestrator", focus: "mission intake, routing, phase control" },
  { id: "opencoder", label: "OpenCoder", role: "builder", focus: "implementation and refactoring" },
  { id: "opencopywriter", label: "OpenCopywriter", role: "writer", focus: "narrative, UX copy, prompts, messaging" },
  { id: "opendataanalyst", label: "OpenDataAnalyst", role: "data", focus: "schemas, transforms, quality signals" },
  { id: "openrepomanager", label: "OpenRepoManager", role: "repo", focus: "file topology, branch hygiene, artifact mapping" },
  { id: "opensystembuilder", label: "OpenSystemBuilder", role: "systems", focus: "architecture, services, flows, automation" },
  { id: "opentechnicalwriter", label: "OpenTechnicalWriter", role: "documentation", focus: "plans, docs, operator guides" },
  { id: "deepagent", label: "DeepAgent", role: "research", focus: "long-range synthesis and dependency reasoning" },
  { id: "ultraworker", label: "UltraWorker", role: "executor", focus: "extended implementation runs and completion pressure" },
]

const byId = (id: AgentTrondoSpecialistId): AgentTrondoSpecialist => {
  const specialist = SPECIALISTS.find((candidate) => candidate.id === id)
  if (!specialist) throw new Error(`Unknown AgentTrondo specialist: ${id}`)
  return specialist
}

const normalizeMission = (mission: string): string => mission.trim().replace(/\s+/g, " ")

const inferVibe = (mission: string, mode: AgentTrondoMode): AgentTrondoReasoningProfile["vibe"] => {
  const text = mission.toLowerCase()
  if (text.includes("one selection") || text.includes("unified") || mode === "quick") return "surgical_minimalism"
  if (text.includes("does it all") || text.includes("ultra") || mode === "ultrawork") return "architectural_masterpiece"
  return "chaotic_genius"
}

const buildReasoningPhases = (): AgentTrondoReasoningPhase[] => [
  {
    id: "phase_0_god_mode_activation",
    title: "God Mode Activation",
    purpose: "Scan for hidden intent, skill signal, aesthetic preference, and scale before planning starts.",
    outputs: ["vibe-selection", "skill-signal", "scope-pressure-estimate"],
  },
  {
    id: "phase_1_problem_absorption",
    title: "Omniscient Problem Absorption",
    purpose: "Model the real life/business problem behind the direct request and separate actual constraints from stated ones.",
    outputs: ["hidden-intent-brief", "real-constraints", "cross-domain-analogies"],
  },
  {
    id: "phase_2_multiverse_decomposition",
    title: "Multiverse Decomposition",
    purpose: "Generate minimal, scalable, and future-proof solution timelines before selecting the active path.",
    outputs: ["timeline-options", "failure-cascade-map", "evolution-path"],
  },
  {
    id: "phase_3_master_strategist",
    title: "Master Strategist Layer",
    purpose: "Pick paradigms, estimate trade-offs, and bake in observability, debuggability, and security posture.",
    outputs: ["paradigm-mix", "trade-off-summary", "observability-plan", "security-posture"],
  },
  {
    id: "phase_4_creative_synthesis",
    title: "Creative Destruction & Synthesis",
    purpose: "Generate multiple implementations, reject weak ones, and fuse the strongest parts into the selected design.",
    outputs: ["candidate-approaches", "rejected-paths", "fused-architecture"],
  },
  {
    id: "phase_5_execution_ritual",
    title: "Execution Ritual",
    purpose: "Translate reasoning into code, tests, benchmarks, docs, and extension points.",
    outputs: ["implementation-plan", "test-plan", "operator-docs", "escape-hatches"],
  },
  {
    id: "phase_6_post_game_domination",
    title: "Post-Game Domination",
    purpose: "Anticipate the next logical requests and seed future growth inside the current solution.",
    outputs: ["next-request-map", "future-hooks", "expansion-advice"],
  },
]

const buildSolutionTimelines = (): AgentTrondoSolutionTimeline[] => [
  {
    id: "minimal_viable_god",
    label: "Minimal Viable God Solution",
    profile: "Fast, clean, deceptively simple implementation that solves the immediate problem with minimal moving parts.",
    strengths: ["fast delivery", "low onboarding cost", "small surface area"],
  },
  {
    id: "scalable_enterprise",
    label: "Scalable Enterprise Version",
    profile: "Structured system with strong separations, observability, delegation control, and maintainable growth paths.",
    strengths: ["team-friendly", "observable", "modular evolution"],
  },
  {
    id: "future_proof_legendary",
    label: "Future-Proof Legendary Version",
    profile: "Long-horizon architecture that anticipates multi-surface expansion, persistent execution, and specialist composability.",
    strengths: ["high extensibility", "strategic leverage", "deep automation potential"],
  },
]

const buildReasoningProfile = (mission: string, mode: AgentTrondoMode): AgentTrondoReasoningProfile => {
  const timelines = buildSolutionTimelines()
  const vibe = inferVibe(mission, mode)
  const selectedTimelineId = mode === "quick"
    ? "minimal_viable_god"
    : mode === "deep"
      ? "scalable_enterprise"
      : "future_proof_legendary"

  return {
    vibe,
    inferredUserProfile: {
      skillLevel: "system_designer",
      taste: "wants a unified control surface with aggressive leverage and low-friction execution",
      wizardryTolerance: "high",
    },
    hiddenIntent: "Collapse many specialist workflows into one trusted control surface so complex work feels like one deliberate command rather than many disconnected tools.",
    realConstraints: [
      "Need one visible entry point instead of many fragmented agent surfaces.",
      "Must preserve future growth without forcing a rewrite when more roles are added.",
      "Needs observability and operator trust so orchestration does not become opaque magic.",
    ],
    timelines,
    selectedTimelineId,
    paradigms: ["functional-core", "orchestrated-specialists", "progressive-enhancement-ui"],
    observability: [
      "phase-by-phase execution ledger",
      "specialist assignment map",
      "artifact and handoff summary",
    ],
    securityPosture: [
      "explicit mission normalization at the boundary",
      "bounded specialist registry instead of free-form hidden roles",
      "clear output contracts for future executor integration",
    ],
    futureRequests: [
      "Add live execution state and resumable runs",
      "Persist plans and artifacts across sessions",
      "Connect AgentTrondo to repo, docs, and chapter-expansion workflows",
      "Add delegated specialist execution from the workbench",
    ],
    phases: buildReasoningPhases(),
  }
}

const pickModeSummary = (mode: AgentTrondoMode): string => {
  switch (mode) {
    case "quick":
      return "Fast orchestration for one contained objective with minimal delegation."
    case "deep":
      return "Structured multi-phase delivery with specialist handoffs and validation gates."
    case "ultrawork":
      return "Long-horizon execution with stacked planning, active specialists, and persistent completion tracking."
  }
}

const buildSelectedSpecialists = (mode: AgentTrondoMode): AgentTrondoSpecialist[] => {
  const specialistIds: AgentTrondoSpecialistId[] = mode === "quick"
    ? ["openagent", "opencoder", "opentechnicalwriter"]
    : mode === "deep"
      ? ["openagent", "opensystembuilder", "opencoder", "opendataanalyst", "opentechnicalwriter", "deepagent"]
      : ["openagent", "opensystembuilder", "opencoder", "opencopywriter", "opendataanalyst", "openrepomanager", "opentechnicalwriter", "deepagent", "ultraworker"]
  return specialistIds.map(byId)
}

const buildPhases = (mode: AgentTrondoMode): AgentTrondoPhase[] => {
  const base: AgentTrondoPhase[] = [
    {
      id: "intake",
      title: "Mission Intake",
      purpose: "Turn the user request into a bounded, executable mission.",
      tasks: [
        { id: "intake-1", title: "Normalize mission brief", owner: "openagent", outcome: "Clear mission statement" },
        { id: "intake-2", title: "Map constraints and standards", owner: "openrepomanager", outcome: "Execution boundaries" },
      ],
    },
    {
      id: "planning",
      title: "Long-Plan Builder",
      purpose: "Generate a phased plan with execution tracks, dependencies, and checkpoints.",
      tasks: [
        { id: "planning-1", title: "Build phase map", owner: "opensystembuilder", outcome: "Phase and dependency graph" },
        { id: "planning-2", title: "Draft operator-facing plan", owner: "opentechnicalwriter", outcome: "Readable delivery plan" },
      ],
    },
    {
      id: "execution",
      title: "Execution Orchestration",
      purpose: "Assign specialists to implementation, content, data, and repo tracks.",
      tasks: [
        { id: "execution-1", title: "Route builder tasks", owner: "opencoder", outcome: "Implementation path" },
        { id: "execution-2", title: "Route data tasks", owner: "opendataanalyst", outcome: "Data and schema path" },
        { id: "execution-3", title: "Route writing tasks", owner: "opencopywriter", outcome: "Narrative and UX copy path" },
      ],
    },
    {
      id: "validation",
      title: "Validation and Handoff",
      purpose: "Review results, preserve outputs, and prepare the next run.",
      tasks: [
        { id: "validation-1", title: "Assemble output ledger", owner: "openrepomanager", outcome: "Artifacts and changed surfaces" },
        { id: "validation-2", title: "Write technical handoff", owner: "opentechnicalwriter", outcome: "Reusable continuation brief" },
      ],
    },
  ]

  if (mode !== "quick") {
    base.splice(2, 0, {
      id: "research",
      title: "Deep Context Synthesis",
      purpose: "Unify code, content, data, and system findings before execution diverges.",
      tasks: [
        { id: "research-1", title: "Cross-surface dependency analysis", owner: "deepagent", outcome: "Risk and dependency map" },
        { id: "research-2", title: "State and continuity review", owner: "opendataanalyst", outcome: "State contract inventory" },
      ],
    })
  }

  if (mode === "ultrawork") {
    base.splice(base.length - 1, 0, {
      id: "ultrawork",
      title: "Extended Execution Loop",
      purpose: "Run stacked specialist passes until the mission reaches a meaningful completion gate.",
      tasks: [
        { id: "ultrawork-1", title: "Drive long-run implementation sprint", owner: "ultraworker", outcome: "Accumulated execution progress" },
        { id: "ultrawork-2", title: "Re-plan after each major checkpoint", owner: "openagent", outcome: "Updated continuation path" },
      ],
    })
  }

  return base
}

export const listAgentTrondoSpecialists = (): AgentTrondoSpecialist[] => SPECIALISTS

const createRunId = (mission: string): string => {
  const slug = mission.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "mission"
  return `run-${slug}`
}

export const createAgentTrondoRun = (plan: AgentTrondoPlan): AgentTrondoRun => {
  const firstPhase = plan.phases[0]
  if (!firstPhase) throw new Error("AgentTrondo plan must contain at least one phase")

  return {
    runId: createRunId(plan.mission),
    status: "draft",
    currentPhaseId: firstPhase.id,
    activeSpecialistIds: plan.selectedSpecialists.map((specialist) => specialist.id),
    phaseStates: plan.phases.map((phase, index) => ({
      phaseId: phase.id,
      status: index === 0 ? "active" : "pending",
      completedTaskIds: [],
      activeTaskId: phase.tasks[0]?.id,
    })),
    artifacts: [
      { id: "artifact-execution-plan", label: "Execution Plan", kind: "plan", createdBy: "openagent" },
      { id: "artifact-specialist-assignment-map", label: "Specialist Assignment Map", kind: "assignment", createdBy: "opensystembuilder" },
    ],
    notes: ["Run initialized from AgentTrondo plan."],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

const getPhaseState = (run: AgentTrondoRun, phaseId: string): AgentTrondoPhaseState => {
  const phaseState = run.phaseStates.find((candidate) => candidate.phaseId === phaseId)
  if (!phaseState) throw new Error(`Unknown AgentTrondo phase state: ${phaseId}`)
  return phaseState
}

const getPlanPhase = (plan: AgentTrondoPlan, phaseId: string): AgentTrondoPhase => {
  const phase = plan.phases.find((candidate) => candidate.id === phaseId)
  if (!phase) throw new Error(`Unknown AgentTrondo plan phase: ${phaseId}`)
  return phase
}

const nextPendingPhase = (run: AgentTrondoRun): AgentTrondoPhaseState | undefined => {
  return run.phaseStates.find((phaseState) => phaseState.status === "pending")
}

export const startAgentTrondoRun = (run: AgentTrondoRun): AgentTrondoRun => ({
  ...run,
  status: run.status === "completed" ? "completed" : "running",
  notes: [...run.notes, "Run started."],
  updatedAt: Date.now(),
})

export const pauseAgentTrondoRun = (run: AgentTrondoRun, note = "Run paused."): AgentTrondoRun => ({
  ...run,
  status: run.status === "completed" ? "completed" : "paused",
  notes: [...run.notes, note],
  updatedAt: Date.now(),
})

export const recordAgentTrondoArtifact = (
  run: AgentTrondoRun,
  artifact: AgentTrondoArtifact
): AgentTrondoRun => ({
  ...run,
  artifacts: [...run.artifacts, artifact],
  notes: [...run.notes, `Artifact recorded: ${artifact.label}`],
  updatedAt: Date.now(),
})

export const completeAgentTrondoTask = (
  plan: AgentTrondoPlan,
  run: AgentTrondoRun,
  phaseId: string,
  taskId: string
): AgentTrondoRun => {
  const phase = getPlanPhase(plan, phaseId)
  const phaseState = getPhaseState(run, phaseId)
  const task = phase.tasks.find((candidate) => candidate.id === taskId)
  if (!task) throw new Error(`Unknown AgentTrondo task: ${taskId}`)
  if (phaseState.completedTaskIds.includes(taskId)) return run

  const completedTaskIds = [...phaseState.completedTaskIds, taskId]
  const remaining = phase.tasks.filter((candidate) => !completedTaskIds.includes(candidate.id))
  const phaseCompleted = remaining.length === 0

  const pendingPhaseId = nextPendingPhase(run)?.phaseId

  const updatedPhaseStates: AgentTrondoPhaseState[] = run.phaseStates.map((candidate) => {
    if (candidate.phaseId !== phaseId) return candidate
    return {
      ...candidate,
      status: (phaseCompleted ? "completed" : "active") as AgentTrondoPhaseRunStatus,
      completedTaskIds,
      activeTaskId: phaseCompleted ? undefined : remaining[0]?.id,
    }
  }).map((candidate) => {
    if (!phaseCompleted) return candidate
    if (candidate.phaseId !== pendingPhaseId) return candidate
    return {
      ...candidate,
      status: "active" as AgentTrondoPhaseRunStatus,
    }
  })

  const nextPhase = phaseCompleted ? updatedPhaseStates.find((candidate) => candidate.status === "active") : updatedPhaseStates.find((candidate) => candidate.phaseId === phaseId)
  const allCompleted = updatedPhaseStates.every((candidate) => candidate.status === "completed")

  return {
    ...run,
    status: allCompleted ? "completed" : run.status === "paused" ? "paused" : "running",
    currentPhaseId: nextPhase?.phaseId ?? run.currentPhaseId,
    phaseStates: updatedPhaseStates,
    notes: [...run.notes, `Completed task ${taskId}.`],
    updatedAt: Date.now(),
  }
}

export const buildAgentTrondoPlan = (mission: string, mode: AgentTrondoMode): AgentTrondoPlan => {
  const normalizedMission = normalizeMission(mission)
  if (!normalizedMission) throw new Error("AgentTrondo mission cannot be empty")

  return {
    mission: normalizedMission,
    mode,
    summary: `${pickModeSummary(mode)} Mission: ${normalizedMission}`,
    selectedSpecialists: buildSelectedSpecialists(mode),
    phases: buildPhases(mode),
    outputs: [
      "execution-plan",
      "specialist-assignment-map",
      "artifact-ledger",
      "handoff-brief",
    ],
    reasoning: buildReasoningProfile(normalizedMission, mode),
  }
}
