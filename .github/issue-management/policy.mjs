#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import config from './config.json' with { type: 'json' }
import {
  lifecycleCommand,
  parseReferences,
  planIssueEvent,
  planPullRequestStatus,
  PRIORITIES,
  requiresPullRequestPolicy,
  validatePullRequest,
} from './rules.mjs'

function readEvent() {
  if (!process.env.GITHUB_EVENT_PATH) throw new Error('GITHUB_EVENT_PATH 未设置')
  return JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
}

function repository() {
  return process.env.GITHUB_REPOSITORY || config.repository
}

async function github(pathname, { method = 'GET', body } = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN 未设置')
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sagebeast-issue-management',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 404) return null
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`${method} ${pathname} 失败：${response.status} ${detail}`)
  }
  if (response.status === 204) return null
  return response.json()
}

function pullRequestFrom(event) {
  return event.pull_request
}

async function resolveIssues(numbers) {
  const issues = new Map()
  const repo = repository()
  for (const number of numbers) {
    const payload = await github(`/repos/${repo}/issues/${number}`)
    if (!payload || payload.pull_request) continue
    const names = (payload.labels ?? []).map((label) => label.name)
    const priorities = names.filter((name) => PRIORITIES.includes(name))
    issues.set(number, {
      priority: priorities.length === 1 ? priorities[0] : null,
      priorityCount: priorities.length,
    })
  }
  return issues
}

async function applyLabelPlan(number, plan) {
  const repo = repository()
  for (const label of plan.remove) {
    await github(`/repos/${repo}/issues/${number}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' })
  }
  if (plan.add.length > 0) {
    await github(`/repos/${repo}/issues/${number}/labels`, { method: 'POST', body: { labels: plan.add } })
  }
  if (plan.comment) {
    await github(`/repos/${repo}/issues/${number}/comments`, { method: 'POST', body: { body: plan.comment } })
  }
}

async function runPullRequestCheck(event) {
  const pull = pullRequestFrom(event)
  if (!pull) throw new Error('事件中没有 pull_request')
  const input = {
    isDraft: Boolean(pull.draft),
    authorType: pull.user?.type ?? '',
    labels: (pull.labels ?? []).map((label) => label.name),
    references: parseReferences({ body: pull.body ?? '', repository: repository() }),
    issues: new Map(),
  }
  if (!requiresPullRequestPolicy(input)) {
    process.stdout.write('PR 不在强制范围内，跳过 Issue 策略。\n')
    return
  }
  input.issues = await resolveIssues(input.references.all)
  const errors = validatePullRequest(input)
  if (errors.length === 0) {
    process.stdout.write('Issue 策略通过。\n')
    return
  }
  for (const error of errors) process.stdout.write(`::error::${error}\n`)
  throw new Error(errors.join('\n'))
}

async function runLifecycle(eventName, event) {
  if (eventName === 'issues') {
    const issue = event.issue
    const plan = planIssueEvent({
      action: event.action,
      labels: (issue.labels ?? []).map((label) => label.name),
      stateReason: issue.state_reason ?? null,
    })
    await applyLabelPlan(issue.number, plan)
    return
  }
  const command = lifecycleCommand(eventName, event)
  if (!command) {
    process.stdout.write('事件不需要生命周期处理。\n')
    return
  }
  const references = parseReferences({
    body: event.pull_request?.body ?? '',
    repository: repository(),
  })
  if (references.resolving.length === 0) {
    process.stdout.write('没有解决型 Issue 引用。\n')
    return
  }
  const repo = repository()
  for (const number of references.resolving) {
    const payload = await github(`/repos/${repo}/issues/${number}`)
    if (!payload || payload.pull_request) continue
    const labels = (payload.labels ?? []).map((label) => label.name)
    const plan = planPullRequestStatus(labels, command)
    await applyLabelPlan(number, plan)
  }
}

async function main(argv) {
  const [command] = argv
  if (command === 'pr') await runPullRequestCheck(readEvent())
  else if (command === 'lifecycle') await runLifecycle(process.env.GITHUB_EVENT_NAME, readEvent())
  else throw new Error('用法：policy.mjs pr|lifecycle')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
