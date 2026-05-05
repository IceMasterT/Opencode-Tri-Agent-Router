import type { AgentTrondoRun } from "./core"

export const AGENT_TRONDO_RUNS_STORAGE_KEY = "agenttrondo:runs"

const ensureNewestFirst = (runs: AgentTrondoRun[]): AgentTrondoRun[] => {
  return [...runs].sort((left, right) => right.updatedAt - left.updatedAt)
}

export const parseAgentTrondoRuns = (raw: string | null): AgentTrondoRun[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return ensureNewestFirst(parsed.filter((candidate): candidate is AgentTrondoRun => {
      return Boolean(candidate) && typeof candidate === "object" && "runId" in candidate && "updatedAt" in candidate
    }))
  } catch {
    return []
  }
}

export const readAgentTrondoRuns = (storage: Pick<Storage, "getItem"> = localStorage): AgentTrondoRun[] => {
  return parseAgentTrondoRuns(storage.getItem(AGENT_TRONDO_RUNS_STORAGE_KEY))
}

export const writeAgentTrondoRuns = (
  runs: AgentTrondoRun[],
  storage: Pick<Storage, "setItem"> = localStorage
): AgentTrondoRun[] => {
  const ordered = ensureNewestFirst(runs)
  storage.setItem(AGENT_TRONDO_RUNS_STORAGE_KEY, JSON.stringify(ordered))
  return ordered
}

export const upsertAgentTrondoRun = (
  run: AgentTrondoRun,
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage
): AgentTrondoRun[] => {
  const existing = readAgentTrondoRuns(storage)
  const nextRuns = [...existing.filter((candidate) => candidate.runId !== run.runId), run]
  return writeAgentTrondoRuns(nextRuns, storage)
}

export const removeAgentTrondoRun = (
  runId: string,
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage
): AgentTrondoRun[] => {
  const existing = readAgentTrondoRuns(storage)
  return writeAgentTrondoRuns(existing.filter((candidate) => candidate.runId !== runId), storage)
}

export const latestAgentTrondoRun = (storage: Pick<Storage, "getItem"> = localStorage): AgentTrondoRun | null => {
  return readAgentTrondoRuns(storage)[0] ?? null
}
