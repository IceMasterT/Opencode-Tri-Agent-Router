import {
  buildAgentTrondoPlan,
  completeAgentTrondoTask,
  createAgentTrondoRun,
  listAgentTrondoSpecialists,
  pauseAgentTrondoRun,
  recordAgentTrondoArtifact,
  startAgentTrondoRun,
} from "./core"
import {
  latestAgentTrondoRun,
  parseAgentTrondoRuns,
  removeAgentTrondoRun,
  upsertAgentTrondoRun,
  writeAgentTrondoRuns,
} from "./storage"

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
}

const createStorage = () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

export const runAgentTrondoAssertions = () => {
  const specialists = listAgentTrondoSpecialists()
  assert(specialists.some((specialist) => specialist.id === "openagent"), "OpenAgent should be registered")
  assert(specialists.some((specialist) => specialist.id === "ultraworker"), "UltraWorker should be registered")

  const deepPlan = buildAgentTrondoPlan("Build a unified agent platform", "deep")
  assert(deepPlan.mode === "deep", "deep plan should keep its mode")
  assert(deepPlan.selectedSpecialists.some((specialist) => specialist.id === "deepagent"), "deep plan should select DeepAgent")
  assert(deepPlan.phases.some((phase) => phase.id === "research"), "deep plan should include research")
  assert(deepPlan.phases.some((phase) => phase.id === "execution"), "deep plan should include execution")
  assert(deepPlan.reasoning.phases.length === 7, "deep plan should include seven reasoning phases")
  assert(deepPlan.reasoning.selectedTimelineId === "scalable_enterprise", "deep plan should select scalable timeline")

  const ultrawork = buildAgentTrondoPlan("Run the whole platform", "ultrawork")
  const quick = buildAgentTrondoPlan("Run the whole platform", "quick")
  assert(ultrawork.phases.some((phase) => phase.id === "ultrawork"), "ultrawork mode should add ultrawork phase")
  assert(!quick.phases.some((phase) => phase.id === "ultrawork"), "quick mode should not add ultrawork phase")
  assert(ultrawork.reasoning.selectedTimelineId === "future_proof_legendary", "ultrawork should select future-proof timeline")

  const oneSelection = buildAgentTrondoPlan("One unified selection for all agent workflows", "quick")
  assert(oneSelection.reasoning.vibe === "surgical_minimalism", "one-selection mission should infer surgical minimalism")
  assert(oneSelection.reasoning.selectedTimelineId === "minimal_viable_god", "quick plan should select minimal timeline")
  assert(oneSelection.reasoning.hiddenIntent.includes("one trusted control surface"), "hidden intent should mention one trusted control surface")

  const run = createAgentTrondoRun(deepPlan)
  assert(run.status === "draft", "new run should start as draft")
  assert(run.currentPhaseId === deepPlan.phases[0]?.id, "new run should point at first phase")

  const started = startAgentTrondoRun(run)
  assert(started.status === "running", "started run should be running")

  const paused = pauseAgentTrondoRun(started, "Checkpoint hold")
  assert(paused.status === "paused", "paused run should be paused")
  assert(paused.notes[paused.notes.length - 1] === "Checkpoint hold", "pause note should be recorded")

  const withArtifact = recordAgentTrondoArtifact(paused, {
    id: "artifact-test",
    label: "Test Artifact",
    kind: "artifact",
    createdBy: "openagent",
  })
  assert(withArtifact.artifacts[withArtifact.artifacts.length - 1]?.label === "Test Artifact", "artifact should be recorded")

  const quickRun = startAgentTrondoRun(createAgentTrondoRun(quick))
  const intake = quick.phases[0]
  const firstTask = intake?.tasks[0]
  const secondTask = intake?.tasks[1]
  assert(intake && firstTask && secondTask, "quick plan should include intake tasks")

  const afterFirst = completeAgentTrondoTask(quick, quickRun, intake.id, firstTask.id)
  const intakeState = afterFirst.phaseStates.find((phaseState) => phaseState.phaseId === intake.id)
  assert(intakeState?.completedTaskIds.includes(firstTask.id), "first task should be completed")
  assert(intakeState?.status === "active", "intake should remain active after first task")

  const afterSecond = completeAgentTrondoTask(quick, afterFirst, intake.id, secondTask.id)
  const planningState = afterSecond.phaseStates.find((phaseState) => phaseState.phaseId === quick.phases[1]?.id)
  assert(afterSecond.currentPhaseId === quick.phases[1]?.id, "run should advance to next phase")
  assert(planningState?.status === "active", "next phase should become active")

  const storage = createStorage()
  const storedQuickRun = { ...createAgentTrondoRun(quick), updatedAt: 100 }
  const storedDeepRun = { ...createAgentTrondoRun(deepPlan), updatedAt: 200 }
  upsertAgentTrondoRun(storedQuickRun, storage)
  const runs = upsertAgentTrondoRun(storedDeepRun, storage)
  assert(runs[0]?.runId === storedDeepRun.runId, "runs should sort newest first")
  assert(latestAgentTrondoRun(storage)?.runId === storedDeepRun.runId, "latest run should be newest")

  writeAgentTrondoRuns([storedQuickRun], storage)
  assert(removeAgentTrondoRun(storedQuickRun.runId, storage).length === 0, "remove should delete stored run")
  assert(parseAgentTrondoRuns("not-json").length === 0, "invalid storage should parse safely")

  let emptyMissionFailed = false
  try {
    buildAgentTrondoPlan("   ", "quick")
  } catch (error) {
    emptyMissionFailed = error instanceof Error && error.message.includes("mission cannot be empty")
  }
  assert(emptyMissionFailed, "empty missions should be rejected")
}
