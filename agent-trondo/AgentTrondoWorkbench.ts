import {
  buildAgentTrondoPlan,
  listAgentTrondoSpecialists,
  type AgentTrondoMode,
  type AgentTrondoPlan,
  type AgentTrondoRun,
  type AgentTrondoSpecialist,
} from "./core"
import { latestAgentTrondoRun } from "./storage"

const DEFAULT_MISSION = "Build a unified agent platform that can orchestrate planning, implementation, writing, data, repo, and system-building workflows from one control surface."

export type AgentTrondoWorkbenchSnapshot = {
  title: "AgentTrondo"
  description: string
  mission: string
  mode: AgentTrondoMode
  plan: AgentTrondoPlan
  specialists: AgentTrondoSpecialist[]
  latestRun: AgentTrondoRun | null
  panels: string[]
  approvalOptions: string[]
}

export const createAgentTrondoWorkbenchSnapshot = (
  mission = DEFAULT_MISSION,
  mode: AgentTrondoMode = "deep",
  storage?: Pick<Storage, "getItem">
): AgentTrondoWorkbenchSnapshot => ({
  title: "AgentTrondo",
  description: "Operating shell for tri-agent routing, approval state, long-plan execution, and artifact history.",
  mission,
  mode,
  plan: buildAgentTrondoPlan(mission, mode),
  specialists: listAgentTrondoSpecialists(),
  latestRun: storage ? latestAgentTrondoRun(storage) : null,
  panels: ["Router Panel", "Approval Console", "Run Ledger", "Delegation Monitor", "Artifact History"],
  approvalOptions: ["approve", "deny", "always", "autonomous approve", "add/remove", "cancel", "never"],
})

export default createAgentTrondoWorkbenchSnapshot
