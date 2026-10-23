/** Pure Issue and pull-request checks. No network and no GitHub writes. */

import config from './config.json' with { type: 'json' }

export const ISSUE_TYPES = new Set(['Feature', 'Bug', 'Task'])
export const PRIORITIES = ['p0', 'p1', 'p2', 'p3']
export const PR_KINDS = new Set([
  'kind/feature',
  'kind/bug-fix',
  'kind/doc',
  'kind/testing',
  'kind/cleanup',
  'kind/dependency',
])
export const LEGACY_LABELS = new Set([
  'kind/bug',
  'kind/documentation',
  'feature',
  'bug-fix',
  'doc',
  'cleanup',
  'testing',
  'dependencies',
  'bug',
  'enhancement',
  'documentation',
])
export const STATUS_BY_LABEL = {
  'status/inbox': 'Inbox',
  'status/backlog': 'Backlog',
  'status/ready': 'Ready',
  'status/in-progress': 'In progress',
  'status/in-review': 'In review',
  'status/done': 'Done',
  'status/no-action': 'No action',
}
export const LABEL_BY_STATUS = Object.fromEntries(
  Object.entries(STATUS_BY_LABEL).map(([label, status]) => [status, label]),
)

const ACTIVE_STATUSES = config.statuses.filter((status) => status !== 'Done' && status !== 'No action')
const TERMINAL_STATUSES = new Set(['Done', 'No action'])
const IMPLEMENTATION_ACTIONS = new Set(['opened', 'edited', 'reopened'])

/**
 * @param {{isDraft: boolean, authorType: string}} input
 * @returns {boolean}
 */
export function requiresPullRequestPolicy({ isDraft, authorType }) {
  if (isDraft) return false
  if (authorType === 'Bot' || authorType === 'App') return false
  return true
}

/**
 * @param {string} eventName
 * @param {{action?: string, changes?: {body?: unknown}, review?: {state?: string}}} event
 * @returns {'implementation'|'review-requested'|'changes-requested'|null}
 */
export function lifecycleCommand(eventName, event) {
  if (eventName === 'pull_request') {
    if (event.action === 'edited' && !event.changes?.body) return null
    if (event.action === 'review_requested') return 'review-requested'
    return IMPLEMENTATION_ACTIONS.has(event.action) ? 'implementation' : null
  }
  if (
    eventName === 'pull_request_review' &&
    event.action === 'submitted' &&
    event.review?.state?.toLowerCase() === 'changes_requested'
  ) {
    return 'changes-requested'
  }
  return null
}

/**
 * Forward-only status move. changes-requested may step back from In review.
 * Terminal statuses are never moved by pull-request events.
 * @param {string|null} currentStatus
 * @param {'implementation'|'review-requested'|'changes-requested'} command
 * @returns {string|null}
 */
export function nextStatus(currentStatus, command) {
  const current = currentStatus ?? 'Inbox'
  if (TERMINAL_STATUSES.has(current)) return null
  let target
  if (command === 'review-requested') target = 'In review'
  else if (command === 'implementation' || command === 'changes-requested') target = 'In progress'
  else throw new Error(`未知 lifecycle command：${command}`)
  if (command === 'changes-requested' && current === 'In review') return target
  const currentIndex = ACTIVE_STATUSES.indexOf(current)
  const targetIndex = ACTIVE_STATUSES.indexOf(target)
  return currentIndex >= 0 && currentIndex < targetIndex ? target : null
}

/**
 * @param {string[]} labels
 * @returns {{status: string|null, label: string|null, error: string|null}}
 */
export function readStatus(labels) {
  const found = labels.filter((label) => label.startsWith('status/'))
  if (found.length > 1) return { status: null, label: null, error: `Issue 有多个 status/*：${found.join(', ')}` }
  if (found.length === 0) return { status: null, label: null, error: null }
  const status = STATUS_BY_LABEL[found[0]]
  if (!status) return { status: null, label: found[0], error: `未知 status/*：${found[0]}` }
  return { status, label: found[0], error: null }
}

/**
 * @param {string} label
 * @returns {boolean}
 */
export function isInvalidIssueLabel(label) {
  return label.startsWith('kind/') || LEGACY_LABELS.has(label)
}

/**
 * Drop comments, fenced blocks, and inline code before reference parsing.
 * @param {string} body
 * @returns {string}
 */
export function visibleMarkdown(body) {
  const lines = body.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)
  const kept = []
  let fence = null
  for (const line of lines) {
    const marker = line.match(/^\s*([`~]{3,})/)
    if (marker) {
      const char = marker[1][0]
      if (fence === null) fence = char
      else if (char === fence) fence = null
      continue
    }
    if (fence === null) kept.push(line)
  }
  return kept.join('\n').replace(/`[^`]*`/g, ' ')
}

/**
 * @param {{body: string, repository: string}} input
 * @returns {{all: number[], resolving: number[], related: number[]}}
 */
export function parseReferences({ body, repository }) {
  const source = visibleMarkdown(body ?? '')
  const expected = repository.toLowerCase()
  const all = new Set()
  const resolving = new Set()
  const reference =
    /(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#|#)(\d+)|https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/issues\/(\d+)/gi
  const closing =
    /\b(?:close(?:s|d)?|fix(?:es|ed)?|resolve(?:s|d)?)\s*:?\s+(?:(?:([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)#|#)(\d+)|https:\/\/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/issues\/(\d+))/gi

  for (const match of source.matchAll(reference)) {
    const explicit = (match[1] ?? match[3] ?? '').toLowerCase()
    const number = Number(match[2] ?? match[4])
    if (!explicit || explicit === expected) all.add(number)
  }
  for (const match of source.matchAll(closing)) {
    const explicit = (match[1] ?? match[3] ?? '').toLowerCase()
    const number = Number(match[2] ?? match[4])
    if (!explicit || explicit === expected) {
      all.add(number)
      resolving.add(number)
    }
  }
  return {
    all: [...all].sort((left, right) => left - right),
    resolving: [...resolving].sort((left, right) => left - right),
    related: [...all].filter((number) => !resolving.has(number)).sort((left, right) => left - right),
  }
}

/**
 * @param {{isDraft: boolean, authorType: string, labels: string[], references: {all: number[], resolving: number[]}, issues: Map<number, {priority: string|null, priorityCount: number}>}} input
 * @returns {string[]}
 */
export function validatePullRequest(input) {
  if (!requiresPullRequestPolicy(input)) return []
  const errors = []
  const kinds = input.labels.filter((label) => PR_KINDS.has(label))
  const unknownKinds = input.labels.filter(
    (label) => label.startsWith('kind/') && !PR_KINDS.has(label) && !LEGACY_LABELS.has(label),
  )
  const legacyLabels = input.labels.filter((label) => LEGACY_LABELS.has(label))
  const sourceLabels = input.labels.filter((label) => label.startsWith('source/'))
  const priorities = input.labels.filter((label) => PRIORITIES.includes(label))
  const areas = input.labels.filter((label) => label.startsWith('area/'))

  if (input.references.all.length === 0) {
    errors.push('PR 正文必须引用至少一个同仓库 Issue；PR 编号不算 Issue 引用')
  }
  if (kinds.length !== 1) errors.push(`PR 必须恰好有一个允许的 kind/*，当前为 ${kinds.length}`)
  if (unknownKinds.length > 0) errors.push(`PR 含不支持的 kind/*：${unknownKinds.join(', ')}`)
  if (legacyLabels.length > 0) errors.push(`PR 含旧版或默认标签：${legacyLabels.join(', ')}`)
  if (sourceLabels.length > 0) errors.push(`source/* 仅用于 Issue：${sourceLabels.join(', ')}`)
  if (priorities.length > 1) errors.push(`PR 最多有一个 p0–p3，当前为 ${priorities.length}`)
  if (areas.length === 0) errors.push('PR 必须至少有一个 area/*')
  for (const number of input.references.all) {
    if (!input.issues.has(number)) errors.push(`#${number} 不是同仓库 Issue`)
  }

  const resolving = input.references.resolving
    .map((number) => [number, input.issues.get(number)])
    .filter((entry) => entry[1])
  for (const [number, issue] of resolving) {
    if (issue.priorityCount > 1) errors.push(`被解决 Issue #${number} 有多个 Priority 标签`)
  }
  const issuePriorities = resolving
    .map(([, issue]) => issue.priority)
    .filter((priority) => PRIORITIES.includes(priority))
  if (priorities.length === 0 && issuePriorities.length > 0) {
    errors.push(`PR Priority 应为 ${highestPriority(issuePriorities)}`)
  } else if (priorities.length === 1 && issuePriorities.length !== resolving.length) {
    errors.push('有 Priority 的解决型 PR 要求每个被解决 Issue 都设置 Priority')
  } else if (priorities.length === 1 && issuePriorities.length > 0) {
    const highest = highestPriority(issuePriorities)
    if (priorities[0] !== highest) errors.push(`PR Priority 应为 ${highest}`)
  }
  return errors
}

/**
 * @param {{labels: string[], type: string|null, state: string, stateReason: string|null}} issue
 * @returns {string[]}
 */
export function validateIssue(issue) {
  const errors = []
  const invalidLabels = issue.labels.filter(isInvalidIssueLabel)
  if (invalidLabels.length > 0) errors.push(`Issue 不得使用 PR kind 或旧版标签：${invalidLabels.join(', ')}`)
  if (!ISSUE_TYPES.has(issue.type ?? '')) errors.push('Type 必须是 Feature、Bug 或 Task')
  const status = readStatus(issue.labels)
  if (status.error) errors.push(status.error)
  const priorities = issue.labels.filter((label) => PRIORITIES.includes(label))
  if (priorities.length > 1) errors.push(`Issue 最多有一个 p0–p3，当前为 ${priorities.length}`)
  if (status.status === 'Done' && (issue.state !== 'closed' || issue.stateReason !== 'completed')) {
    errors.push('status/done 必须对应 Completed 关闭原因')
  }
  if (status.status === 'No action' && (issue.state !== 'closed' || issue.stateReason !== 'not_planned')) {
    errors.push('status/no-action 必须对应 Not planned 关闭原因')
  }
  if (status.status && !TERMINAL_STATUSES.has(status.status) && issue.state !== 'open') {
    errors.push(`${status.status} 必须对应开放 Issue`)
  }
  if (config.projectEnabled) errors.push('projectEnabled 已打开，但 Project 客户端尚未实现')
  return errors
}

/**
 * @param {string[]} labels
 * @param {'implementation'|'review-requested'|'changes-requested'} command
 * @returns {{add: string[], remove: string[], comment: string|null}}
 */
export function planPullRequestStatus(labels, command) {
  const status = readStatus(labels)
  if (status.error) return { add: [], remove: [], comment: status.error }
  const target = nextStatus(status.status, command)
  if (!target) return { add: [], remove: [], comment: null }
  const targetLabel = LABEL_BY_STATUS[target]
  return {
    add: status.label === targetLabel ? [] : [targetLabel],
    remove: Object.keys(STATUS_BY_LABEL).filter((label) => label !== targetLabel && labels.includes(label)),
    comment: null,
  }
}

/**
 * @param {{action: string, labels: string[], stateReason?: string|null}} issue
 * @returns {{add: string[], remove: string[], comment: string|null}}
 */
export function planIssueEvent(issue) {
  const invalid = issue.labels.filter(isInvalidIssueLabel)
  const remove = [...invalid]
  let add = []
  let comment = null
  if (issue.action === 'opened' && !issue.labels.some((label) => label.startsWith('status/'))) {
    add = ['status/inbox']
  }
  if (issue.action === 'closed' && issue.stateReason === 'completed') {
    add = ['status/done']
    remove.push(...issue.labels.filter((label) => label.startsWith('status/') && label !== 'status/done'))
  }
  if (issue.action === 'closed' && issue.stateReason === 'not_planned') {
    add = ['status/no-action']
    remove.push(...issue.labels.filter((label) => label.startsWith('status/') && label !== 'status/no-action'))
  }
  if (issue.action === 'reopened') {
    add = ['status/ready']
    remove.push(...issue.labels.filter((label) => label.startsWith('status/') && label !== 'status/ready'))
    comment = 'Issue 已重新打开，状态回到 status/ready。'
  }
  const status = readStatus(issue.labels.filter((label) => !remove.includes(label)).concat(add))
  if (status.error) comment = status.error
  return { add: unique(add), remove: unique(remove), comment }
}

function highestPriority(priorities) {
  return [...priorities].sort((left, right) => PRIORITIES.indexOf(left) - PRIORITIES.indexOf(right))[0]
}

function unique(values) {
  return [...new Set(values)]
}
