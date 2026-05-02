import type { Part, Plugin } from "@opencode-ai/plugin"
import { readdir, readFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { homedir } from "node:os"

type AgentCard = {
  id: string
  name: string
  description: string
  path: string
  verifier?: boolean
}

type SkillCard = {
  id: string
  name: string
  description: string
  path: string
}

type Selection = {
  originalText: string
  routedText: string
  summary: string
}

type SessionState = {
  mode: "ask" | "always" | "autonomous"
  disabled: boolean
  pending?: Selection
}

type ApprovalDecision = "approve" | "deny" | "always" | "autonomous approve" | "add/remove" | "cancel" | "never"

type RouterOptions = {
  agentDirs?: string[]
  skillDirs?: string[]
  maxSkills?: number
  minSkillScore?: number
  announceNoSkills?: boolean
  requireApproval?: boolean
}

const VERIFIER_TERMS = [
  "review",
  "reviewer",
  "qa",
  "quality",
  "test",
  "tester",
  "audit",
  "auditor",
  "security",
  "reality",
  "compliance",
  "accessibility",
]

const GENERAL_VERIFIERS = [
  "code-reviewer",
  "test-results-analyzer",
  "model-qa-specialist",
  "reality-checker",
  "accessibility-auditor",
  "compliance-auditor",
  "security-engineer",
]

const DOMAIN_HINTS: Record<string, string[]> = {
  frontend: ["ui", "ux", "css", "react", "vue", "angular", "svelte", "frontend", "browser", "web page", "component", "layout", "animation"],
  backend: ["api", "server", "backend", "database", "db", "postgres", "mysql", "auth", "endpoint", "service", "microservice"],
  security: ["security", "vulnerability", "exploit", "auth", "permission", "secret", "token", "audit", "compliance"],
  testing: ["test", "qa", "verify", "validation", "playwright", "jest", "vitest", "unit", "e2e", "bug", "failure"],
  docs: ["docs", "documentation", "readme", "write", "copy", "article", "guide", "manual", "changelog"],
  data: ["data", "etl", "pipeline", "analytics", "csv", "warehouse", "report", "dashboard", "sql"],
  devops: ["deploy", "ci", "cd", "docker", "kubernetes", "infra", "cloud", "monitoring", "sre", "pipeline"],
  mobile: ["ios", "android", "mobile", "react native", "flutter", "app store"],
  game: ["game", "unity", "unreal", "godot", "roblox", "shader", "level"],
  product: ["product", "roadmap", "requirements", "prioritize", "mvp", "spec"],
  marketing: ["seo", "ads", "campaign", "marketing", "social", "content", "brand", "growth"],
}

const GENERIC_SKILL_TOKENS = new Set([
  "add", "all", "and", "api", "app", "ask", "build", "code", "create", "data",
  "file", "for", "from", "get", "help", "implement", "make", "need", "new", "now",
  "request", "task", "test", "that", "the", "this", "use", "using", "want", "with",
])

const SKILL_HINTS: Record<string, string[]> = {
  "browser-automation-agent": ["browser", "web ui", "click", "form", "screenshot", "playwright", "scrape", "automation", "navigate"],
  context7: ["library", "framework", "docs", "documentation", "api", "sdk", "package", "current", "examples"],
  "solana-dev": ["solana", "anchor", "wallet", "devnet", "token", "pda", "program", "rent"],
  "auth-login": ["google login", "google auth", "oauth", "authenticate", "login", "account"],
  "task-management": ["task", "todo", "plan", "feature", "milestone", "track", "subtask"],
  "code-review": ["review", "audit", "bug", "risk", "quality", "security"],
  "plan-review": ["plan", "review plan", "architecture", "approach", "proposal"],
  "plan-protocol": ["plan", "protocol", "workflow", "steps", "strategy"],
  "frontend-philosophy": ["frontend", "ui", "ux", "css", "design", "component"],
  "web-interface-guidelines-review": ["interface review", "ui review", "ux review", "accessibility", "design review"],
  "using-web-scraping": ["scrape", "crawler", "website", "extract", "html", "browser"],
  "web-search-api": ["search web", "web search", "find online", "current info", "research"],
  "pdf-manipulation": ["pdf", "merge pdf", "split pdf", "extract pdf"],
  "changelog-generator": ["changelog", "release notes", "git history"],
  "database-query-and-export": ["database", "sql", "database query", "query database"],
  "csv-data-summarizer": ["summarize csv", "csv summary", "analyze csv", "spreadsheet summary"],
  "json-and-csv-data-transformation": ["json", "csv", "transform", "convert"],
  "send-email-programmatically": ["email", "smtp", "send mail"],
  "using-telegram-bot": ["telegram", "bot"],
  "using-youtube-download": ["youtube", "video", "download"],
  "free-weather-data": ["weather", "forecast"],
  "free-translation-api": ["translate", "translation", "language"],
  "free-geocoding-and-maps": ["geocode", "map", "address", "location", "distance"],
  "city-distance": ["city distance", "distance between", "miles", "kilometers"],
  "age-file-encryption": ["encrypt", "decrypt", "age", "password", "secret file"],
  "generate-qr-code-natively": ["qr", "qr code"],
  "get-crypto-price": ["crypto price", "bitcoin price", "ethereum price"],
  "check-crypto-address-balance": ["crypto balance", "wallet balance", "bitcoin address"],
  "generate-asset-price-chart": ["price chart", "asset chart", "stock chart", "crypto chart"],
  "trading-indicators-from-price-data": ["rsi", "macd", "trading", "indicator"],
  "anonymous-file-upload": ["upload file", "file sharing", "anonymous upload"],
  "static-assets-hosting": ["host static", "static assets", "publish html", "website hosting"],
  presenton: ["presentation", "slides", "pptx", "deck"],
  humanizer: ["humanize", "rewrite", "tone", "ai text"],
  "news-aggregation": ["news", "rss", "headlines"],
  "ip-lookup": ["ip lookup", "ip address", "geolocation"],
}

function defaultAgentDirs(projectDirectory: string): string[] {
  const home = homedir()
  return [
    join(projectDirectory, ".opencode", "agent"),
    join(projectDirectory, ".opencode", "agents"),
    join(home, ".config", "opencode", "agent"),
    join(home, ".config", "opencode", ".opencode", "agents"),
  ]
}

function defaultSkillDirs(projectDirectory: string): string[] {
  const home = homedir()
  return [
    join(projectDirectory, ".opencode", "skills"),
    join(home, ".config", "opencode", "skills"),
    join(home, ".agents", "skills"),
    join(home, "open-skills", "skills"),
  ]
}

function normalizeDirs(dirs: string[] | undefined, defaults: string[]): string[] {
  const expanded = [...defaults, ...(dirs ?? [])]
    .map((dir) => dir.replace(/^~(?=$|\/)/, homedir()))
    .map((dir) => resolve(dir))

  return [...new Set(expanded)]
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  let entries: Awaited<ReturnType<typeof readdir>>

  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  await Promise.all(entries.map(async (entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkMarkdownFiles(path))
      return
    }
    if (entry.isFile() && entry.name.endsWith(".md")) files.push(path)
  }))

  return files
}

async function walkSkillFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  let entries: Awaited<ReturnType<typeof readdir>>

  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  await Promise.all(entries.map(async (entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkSkillFiles(path))
      return
    }
    if (entry.isFile() && entry.name === "SKILL.md") files.push(path)
  }))

  return files
}

async function loadAgents(agentDirs: string[]): Promise<AgentCard[]> {
  const agentsByPath = new Map<string, AgentCard>()
  const files = (await Promise.all(agentDirs.map(walkMarkdownFiles))).flat()

  await Promise.all(files.map(async (path) => {
    const content = await readFile(path, "utf8")
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
    const name = frontmatter?.[1].match(/^name:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? basename(path, ".md")
    const description = frontmatter?.[1].match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? ""
    const id = basename(path, ".md")
    const searchable = `${id} ${name} ${description}`.toLowerCase()

    agentsByPath.set(path, {
      id,
      name,
      description,
      path,
      verifier: VERIFIER_TERMS.some((term) => searchable.includes(term)),
    })
  }))

  return [...agentsByPath.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function loadSkills(skillDirs: string[]): Promise<SkillCard[]> {
  const skillsById = new Map<string, SkillCard>()
  const files = (await Promise.all(skillDirs.map(walkSkillFiles))).flat()

  await Promise.all(files.map(async (path) => {
    const content = await readFile(path, "utf8")
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
    const id = basename(resolve(path, ".."))
    const name = frontmatter?.[1].match(/^name:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? id
    const description = frontmatter?.[1].match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim() ?? ""
    if (!skillsById.has(id)) skillsById.set(id, { id, name, description, path })
  }))

  return [...skillsById.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function scoreText(searchable: string, request: string, tokens: string[]): number {
  let score = 0

  for (const token of tokens) {
    if (searchable.includes(token)) score += token.length > 5 ? 4 : 2
  }

  for (const hints of Object.values(DOMAIN_HINTS)) {
    const requestHits = hints.filter((hint) => request.includes(hint)).length
    if (requestHits === 0) continue
    const targetHits = hints.filter((hint) => searchable.includes(hint)).length
    score += requestHits * targetHits * 5
  }

  return score
}

function scoreAgent(agent: AgentCard, request: string, tokens: string[]): number {
  const haystack = `${agent.id} ${agent.name} ${agent.description}`.toLowerCase()
  let score = scoreText(haystack, request, tokens)

  if (haystack.includes("orchestrator")) score += 3
  if (haystack.includes("senior") || haystack.includes("architect")) score += 2
  return score
}

function scoreSkill(skill: SkillCard, request: string, tokens: string[]): number {
  const haystack = `${skill.id} ${skill.name} ${skill.description}`.toLowerCase()
  const hints = SKILL_HINTS[skill.id] ?? []
  let score = 0

  for (const hint of hints) {
    if (request.includes(hint)) score += 30
  }

  if (skill.id === "context7" && /\b(next|react|vue|angular|svelte|express|fastify|supabase|firebase|stripe|openai|sdk|package|library|framework)\b/.test(request)) score += 30
  if (skill.id === "task-management" && /\b(feature|project|multi-step|subtasks?|milestone|task list|todo)\b/.test(request)) score += 24

  const metadataTokens = tokens.filter((token) => !GENERIC_SKILL_TOKENS.has(token))
  for (const token of metadataTokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 4 : 2
  }

  if (hints.length > 0 && score < 30) return 0
  return score
}

function chooseThree(agents: AgentCard[], requestText: string): [AgentCard, AgentCard, AgentCard] | undefined {
  const request = requestText.toLowerCase()
  const tokens = tokenize(requestText)
  if (agents.length < 3) return undefined

  const ranked = agents
    .map((agent) => ({ agent, score: scoreAgent(agent, request, tokens) }))
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name))

  const primary = ranked[0]?.agent
  const secondary = ranked.find((entry) => entry.agent.id !== primary?.id)?.agent
  const verifierRanked = agents
    .filter((agent) => agent.id !== primary?.id && agent.id !== secondary?.id)
    .map((agent) => {
      const base = scoreAgent(agent, request, tokens)
      const genericVerifierBonus = GENERAL_VERIFIERS.includes(agent.id) ? 40 : 0
      const verifierBonus = agent.verifier ? 20 : 0
      const unrelatedPenalty = !agent.verifier && !GENERAL_VERIFIERS.includes(agent.id) ? 100 : 0
      return { agent, score: base + genericVerifierBonus + verifierBonus - unrelatedPenalty }
    })
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name))

  const tertiary = verifierRanked[0]?.agent ?? ranked.find((entry) => entry.agent.id !== primary?.id && entry.agent.id !== secondary?.id)?.agent

  if (!primary || !secondary || !tertiary) return undefined
  return [primary, secondary, tertiary]
}

function chooseSkills(skills: SkillCard[], requestText: string, minSkillScore: number, maxSkills: number): SkillCard[] {
  const request = requestText.toLowerCase()
  const tokens = tokenize(requestText)
  const ranked = skills
    .map((skill) => ({ skill, score: scoreSkill(skill, request, tokens) }))
    .filter((entry) => entry.score >= minSkillScore)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))

  return ranked.slice(0, maxSkills).map((entry) => entry.skill)
}

function routingDirective(primary: AgentCard, secondary: AgentCard, tertiary: AgentCard): string {
  return [
    "<tri-agent-routing>",
    "For this request, use exactly three agents and keep their responsibilities distinct.",
    `Primary agent: ${primary.name} (${primary.id}) - owns the main answer or implementation.`,
    `Secondary agent: ${secondary.name} (${secondary.id}) - supplies complementary domain expertise and catches blind spots.`,
    `Tertiary agent: ${tertiary.name} (${tertiary.id}) - verifies quality, risk, tests, or completeness before final response.`,
    "Begin the response by informing the user which primary, secondary, and tertiary agents were selected, then execute the request. Delegate to the selected agents when the runtime supports agent/subagent invocation; otherwise simulate the same role split explicitly in your reasoning and final checks.",
    "If the user explicitly names agents, prefer those names while preserving primary/secondary/tertiary roles.",
    "</tri-agent-routing>",
    "",
  ].join("\n")
}

function skillDirective(skills: SkillCard[], announceNoSkills: boolean): string {
  if (skills.length === 0) {
    if (!announceNoSkills) return ""
    return [
      "<skill-application>",
      "No installed skill strongly matches this request. Proceed normally after applying the selected agents.",
      "</skill-application>",
      "",
    ].join("\n")
  }

  return [
    "<skill-application>",
    "After applying the primary, secondary, and tertiary agents, apply every listed skill that pertains to this request before execution.",
    "Inform the user which skills were selected to augment the agents. Read each listed SKILL.md and follow its workflow when its conditions match the user request. Do not apply unrelated skills.",
    ...skills.map((skill) => `Skill: ${skill.name} (${skill.id}) - ${skill.path} - ${skill.description}`),
    "</skill-application>",
    "",
  ].join("\n")
}

function selectionSummary(primary: AgentCard, secondary: AgentCard, tertiary: AgentCard, skills: SkillCard[]): string {
  const skillList = skills.length > 0 ? skills.map((skill) => `${skill.name} (${skill.id})`).join(", ") : "None"
  return [
    `Primary: ${primary.name} (${primary.id})`,
    `Secondary: ${secondary.name} (${secondary.id})`,
    `Tertiary: ${tertiary.name} (${tertiary.id})`,
    `Skills: ${skillList}`,
  ].join("\n")
}

function createSelection(primary: AgentCard, secondary: AgentCard, tertiary: AgentCard, skills: SkillCard[], originalText: string, announceNoSkills: boolean): Selection {
  return {
    originalText,
    routedText: `${routingDirective(primary, secondary, tertiary)}${skillDirective(skills, announceNoSkills)}${originalText}`,
    summary: selectionSummary(primary, secondary, tertiary, skills),
  }
}

function approvalPrompt(selection: Selection): string {
  return [
    "<tri-agent-approval-required>",
    "The tri-agent router selected the following agents and skills for this request:",
    selection.summary,
    "",
    "Before doing the work, inform the user of this selection and ask them to choose exactly one option:",
    "[approve] - approve this selection for the current request only, until the next prompt.",
    "[deny] - deny this selection and ask whether the user wants to manually enter agents/skills or draft a new selection.",
    "[always] - Will 'Always' accept this session.",
    "[global autonomous approval granted] - Global Antonomous Approval Granted, will Autonomously Accept the Selection in all Sessions from now on without prompting for approval.",
    "[add/remove] - let the user add or remove agents/skills, then present a revised selection for approval.",
    "[cancel] - cancel agents and skills for this request and continue the work without them.",
    "[never] - disable tri-agent routing for the rest of this session and continue without agents/skills.",
    "",
    "Do not execute the original request until the user chooses an option. The original request is held by the router for the next reply.",
    "</tri-agent-approval-required>",
  ].join("\n")
}

function approvalAppliedPrefix(decision: "approve" | "always" | "autonomous approve"): string {
  const scope = decision === "approve"
    ? "current request"
    : decision === "always"
      ? "current session"
      : "all sessions from now on"
  return [
    "<tri-agent-approval-applied>",
    `Tri-agent routing was approved for the ${scope}. Inform the user of the selected agents and skills, then continue with the work.`,
    "</tri-agent-approval-applied>",
    "",
  ].join("\n")
}

function denialPrompt(selection: Selection): string {
  return [
    "<tri-agent-selection-denied>",
    "The user denied the proposed tri-agent/skill selection.",
    "Denied selection:",
    selection.summary,
    "",
    "Ask the user whether they want to manually enter agents/skills or have the router draft a new selection. Do not execute the original request yet.",
    "Original request:",
    selection.originalText,
    "</tri-agent-selection-denied>",
  ].join("\n")
}

function addRemovePrompt(selection: Selection, userEdit?: string): string {
  return [
    "<tri-agent-add-remove>",
    "The user chose add/remove for the proposed tri-agent/skill selection.",
    "Current selection:",
    selection.summary,
    userEdit ? `Requested modification: ${userEdit}` : "Ask the user which agents or skills to add/remove. Accept exact names or natural language preferences.",
    "After collecting modifications, present a revised primary/secondary/tertiary agent list and matching skills with the same approval options. Do not execute the original request until approved.",
    "Original request:",
    selection.originalText,
    "</tri-agent-add-remove>",
  ].join("\n")
}

function parseApprovalDecision(text: string): ApprovalDecision | undefined {
  const normalized = text.trim().toLowerCase().replace(/^\[|\]$/g, "")
  if (normalized === "approve") return "approve"
  if (normalized === "deny") return "deny"
  if (normalized === "always") return "always"
  if (normalized === "global autonomous approval granted" || normalized === "global antonomous approval granted" || normalized === "autonomous approve" || normalized === "autonomous" || normalized === "auto approve") return "autonomous approve"
  if (normalized === "add/remove" || normalized === "add remove" || normalized === "add" || normalized === "remove") return "add/remove"
  if (normalized === "cancel") return "cancel"
  if (normalized === "never") return "never"
  return undefined
}

export const TriAgentRouter: Plugin = async ({ directory }, options?: RouterOptions) => {
  const agentDirs = normalizeDirs(options?.agentDirs, defaultAgentDirs(directory))
  const skillDirs = normalizeDirs(options?.skillDirs, defaultSkillDirs(directory))
  const maxSkills = options?.maxSkills ?? 8
  const minSkillScore = options?.minSkillScore ?? 16
  const announceNoSkills = options?.announceNoSkills ?? false
  const requireApproval = options?.requireApproval ?? true

  let cachedAgents: AgentCard[] | undefined
  let cachedSkills: SkillCard[] | undefined
  let globalAutonomousApproval = false
  const sessionStates = new Map<string, SessionState>()

  function stateFor(sessionID: string): SessionState {
    const existing = sessionStates.get(sessionID)
    if (existing) return existing
    const created: SessionState = { mode: "ask", disabled: false }
    sessionStates.set(sessionID, created)
    return created
  }

  return {
    async "chat.message"(input, output) {
      const textPart = output.parts.find((part): part is Part & { type: "text"; text: string } => part.type === "text")
      if (!textPart || textPart.text.includes("<tri-agent-routing>") || textPart.text.includes("<tri-agent-approval-required>")) return

      const sessionID = input.sessionID ?? "global"
      const state = stateFor(sessionID)
      const decision = parseApprovalDecision(textPart.text)

      if (state.pending) {
        if (decision === "approve") {
          const pending = state.pending
          state.pending = undefined
          textPart.text = `${approvalAppliedPrefix("approve")}${pending.routedText}`
          return
        }

        if (decision === "always" || decision === "autonomous approve") {
          const pending = state.pending
          if (decision === "always") {
            state.mode = "always"
          } else {
            state.mode = "autonomous"
            globalAutonomousApproval = true
          }
          state.pending = undefined
          textPart.text = `${approvalAppliedPrefix(decision)}${pending.routedText}`
          return
        }

        if (decision === "deny") {
          textPart.text = denialPrompt(state.pending)
          return
        }

        if (decision === "add/remove") {
          textPart.text = addRemovePrompt(state.pending)
          return
        }

        if (decision === "cancel") {
          const pending = state.pending
          state.pending = undefined
          textPart.text = pending.originalText
          return
        }

        if (decision === "never") {
          const pending = state.pending
          state.pending = undefined
          state.disabled = true
          textPart.text = pending.originalText
          return
        }

        textPart.text = addRemovePrompt(state.pending, textPart.text)
        return
      }

      if (decision === "never") {
        state.disabled = true
        return
      }

      if (state.disabled) return

      cachedAgents ??= await loadAgents(agentDirs)
      cachedSkills ??= await loadSkills(skillDirs)

      const trio = chooseThree(cachedAgents, textPart.text)
      if (!trio) return

      const matchingSkills = chooseSkills(cachedSkills, textPart.text, minSkillScore, maxSkills)
      const selection = createSelection(...trio, matchingSkills, textPart.text, announceNoSkills)

      if (!requireApproval || globalAutonomousApproval || state.mode === "always" || state.mode === "autonomous") {
        textPart.text = selection.routedText
        return
      }

      state.pending = selection
      textPart.text = approvalPrompt(selection)
    },

    async "experimental.chat.system.transform"(_input, output) {
      output.system.push([
        "Tri-agent router is active.",
        "Every user request must be handled with a primary agent, secondary agent, and tertiary agent selected for the request domain.",
        "Primary owns execution, secondary provides complementary specialization, tertiary performs verification/risk review.",
        "After selecting agents, apply all installed skills that pertain to the request. Read and follow each matching SKILL.md before execution.",
        "If the router asks for approval, wait for one of: approve, deny, always, global autonomous approval granted, add/remove, cancel, never.",
      ].join("\n"))
    },
  }
}

export default TriAgentRouter
