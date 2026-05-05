#!/usr/bin/env node

/**
 * AgentTrondo Uninstall Script
 * 
 * Removes AgentTrondo agent from the OpenCode agent directories.
 * Run this from the tri-agent-router package root:
 *   npm run uninstall
 *   # or
 *   node scripts/uninstall.js
 */

import { readdir, rm, access } from "node:fs/promises"
import { join, resolve } from "node:path"
import { homedir } from "node:os"

const AGENT_TRONDO_FILE = "AgentTrondo.md"

const agentDirs = [
  join(process.cwd(), "agent-trondo"),
  join(homedir(), ".config", "opencode", "agent"),
  join(homedir(), ".config", "opencode", ".opencode", "agents"),
]

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function findAndRemoveAgentTrondo() {
  let removedCount = 0
  const removedPaths = []

  for (const dir of agentDirs) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isFile() && entry.name === AGENT_TRONDO_FILE) {
          const filePath = join(dir, entry.name)
          await rm(filePath, { force: true })
          removedCount++
          removedPaths.push(filePath)
          console.log(`Removed: ${filePath}`)
        }
        
        if (entry.isDirectory() && entry.name === "agent-trondo") {
          const dirPath = join(dir, entry.name)
          await rm(dirPath, { recursive: true, force: true })
          removedCount++
          removedPaths.push(dirPath)
          console.log(`Removed directory: ${dirPath}`)
        }
      }
    } catch (err) {
      // Directory doesn't exist or can't be read - skip
      continue
    }
  }

  return { removedCount, removedPaths }
}

async function main() {
  console.log("=".repeat(60))
  console.log("AgentTrondo Uninstall")
  console.log("=".repeat(60))
  console.log()

  // Check if package is installed
  const packagePath = join(process.cwd(), "package.json")
  if (!(await fileExists(packagePath))) {
    console.error("Error: This script must be run from the tri-agent-router package directory.")
    process.exit(1)
  }

  console.log("Searching for AgentTrondo in agent directories...")
  console.log(`Search paths: ${agentDirs.join(", ")}`)
  console.log()

  const { removedCount, removedPaths } = await findAndRemoveAgentTrondo()

  console.log()
  if (removedCount > 0) {
    console.log(`✅ Successfully removed ${removedCount} item(s):`)
    removedPaths.forEach(p => console.log(`   - ${p}`))
  } else {
    console.log("ℹ️  No AgentTrondo files found in agent directories.")
  }

  console.log()
  console.log("Uninstall complete!")
  console.log()
  console.log("Note: If AgentTrondo was installed globally, you may need to:")
  console.log("  1. Remove the package: npm uninstall opencode-tri-agent-router")
  console.log("  2. Clear OpenCode's agent cache (if applicable)")
  console.log("=".repeat(60))
}

main().catch((err) => {
  console.error("Uninstall failed:", err.message)
  process.exit(1)
})