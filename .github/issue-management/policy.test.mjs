import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isInvalidIssueLabel,
  lifecycleCommand,
  nextStatus,
  parseReferences,
  planIssueEvent,
  planPullRequestStatus,
  requiresPullRequestPolicy,
  validateIssue,
  validatePullRequest,
} from './rules.mjs'

const repository = 'kenylerich/sagebeast'

function reviewed(overrides = {}) {
  return {
    isDraft: false,
    authorType: 'User',
    labels: ['kind/doc', 'area/docs'],
    references: { all: [1], resolving: [1], related: [] },
    issues: new Map([[1, { priority: null, priorityCount: 0 }]]),
    ...overrides,
  }
}

test('draft and automated pull requests skip policy', () => {
  assert.equal(requiresPullRequestPolicy({ isDraft: true, authorType: 'User' }), false)
  assert.equal(requiresPullRequestPolicy({ isDraft: false, authorType: 'Bot' }), false)
  assert.equal(requiresPullRequestPolicy({ isDraft: false, authorType: 'App' }), false)
  assert.equal(requiresPullRequestPolicy({ isDraft: false, authorType: 'User' }), true)
  assert.deepEqual(validatePullRequest(reviewed({ isDraft: true, labels: [], references: { all: [], resolving: [], related: [] } })), [])
})

test('references ignore comments, fences, inline code, and other repositories', () => {
  const parsed = parseReferences({
    repository,
    body: [
      'Fixes #12',
      'Refs kenylerich/sagebeast#3',
      'Also https://github.com/kenylerich/sagebeast/issues/15',
      '<!-- Fixes #9 -->',
      '```',
      'Fixes #8',
      '```',
      'Ignore `#4` and other/repo#7.',
      'Closes: #2',
    ].join('\n'),
  })
  assert.deepEqual(parsed.resolving, [2, 12])
  assert.deepEqual(parsed.related, [3, 15])
  assert.deepEqual(parsed.all, [2, 3, 12, 15])
})

test('a closing keyword binds only the following reference', () => {
  const parsed = parseReferences({ repository, body: 'Fixes #1 and #2' })
  assert.deepEqual(parsed.resolving, [1])
  assert.deepEqual(parsed.related, [2])
})

test('human pull requests need one kind, one area, and one issue', () => {
  const missing = validatePullRequest(reviewed({
    labels: [],
    references: { all: [], resolving: [], related: [] },
    issues: new Map(),
  }))
  assert.ok(missing.includes('PR 正文必须引用至少一个同仓库 Issue；PR 编号不算 Issue 引用'))
  assert.ok(missing.includes('PR 必须恰好有一个允许的 kind/*，当前为 0'))
  assert.ok(missing.includes('PR 必须至少有一个 area/*'))
  assert.deepEqual(validatePullRequest(reviewed()), [])
})

test('pull requests reject legacy, source, unknown kind, and extra priority labels', () => {
  const errors = validatePullRequest(reviewed({
    labels: ['kind/feature', 'kind/doc', 'kind/experimental', 'documentation', 'source/maintainer', 'p0', 'p1', 'area/docs'],
  }))
  assert.ok(errors.some((error) => error.includes('恰好有一个允许的 kind/*')))
  assert.ok(errors.some((error) => error.includes('kind/experimental')))
  assert.ok(errors.some((error) => error.includes('documentation')))
  assert.ok(errors.some((error) => error.includes('source/*')))
  assert.ok(errors.some((error) => error.includes('最多有一个 p0–p3')))
})

test('resolving pull-request priority follows the highest issue priority', () => {
  const issues = new Map([
    [2, { priority: 'p2', priorityCount: 1 }],
    [3, { priority: 'p0', priorityCount: 1 }],
  ])
  const references = { all: [2, 3], resolving: [2, 3], related: [] }
  assert.ok(validatePullRequest(reviewed({ labels: ['kind/feature', 'area/agent'], references, issues })).includes('PR Priority 应为 p0'))
  assert.deepEqual(
    validatePullRequest(reviewed({ labels: ['kind/feature', 'area/agent', 'p0'], references, issues })),
    [],
  )
  assert.ok(
    validatePullRequest(reviewed({
      labels: ['kind/feature', 'area/agent', 'p1'],
      references,
      issues,
    })).includes('PR Priority 应为 p0'),
  )
})

test('informational references do not force priority matching', () => {
  assert.deepEqual(
    validatePullRequest(reviewed({
      labels: ['kind/doc', 'area/docs'],
      references: { all: [4], resolving: [], related: [4] },
      issues: new Map([[4, { priority: 'p0', priorityCount: 1 }]]),
    })),
    [],
  )
})

test('a pull-request number does not satisfy the issue requirement', () => {
  const errors = validatePullRequest(reviewed({
    references: { all: [9], resolving: [9], related: [] },
    issues: new Map(),
  }))
  assert.ok(errors.includes('#9 不是同仓库 Issue'))
})

test('status advances only forward, except changes requested', () => {
  assert.equal(nextStatus(null, 'implementation'), 'In progress')
  assert.equal(nextStatus('Ready', 'review-requested'), 'In review')
  assert.equal(nextStatus('In review', 'implementation'), null)
  assert.equal(nextStatus('In review', 'changes-requested'), 'In progress')
  assert.equal(nextStatus('Done', 'implementation'), null)
  assert.equal(nextStatus('No action', 'review-requested'), null)
})

test('lifecycle commands follow pull-request events', () => {
  assert.equal(lifecycleCommand('pull_request', { action: 'opened' }), 'implementation')
  assert.equal(lifecycleCommand('pull_request', { action: 'edited', changes: {} }), null)
  assert.equal(lifecycleCommand('pull_request', { action: 'edited', changes: { body: {} } }), 'implementation')
  assert.equal(lifecycleCommand('pull_request', { action: 'review_requested' }), 'review-requested')
  assert.equal(
    lifecycleCommand('pull_request_review', { action: 'submitted', review: { state: 'changes_requested' } }),
    'changes-requested',
  )
  assert.equal(lifecycleCommand('pull_request_review', { action: 'submitted', review: { state: 'approved' } }), null)
})

test('label plans replace status labels without moving backward', () => {
  assert.deepEqual(planPullRequestStatus(['status/ready', 'area/docs'], 'implementation'), {
    add: ['status/in-progress'],
    remove: ['status/ready'],
    comment: null,
  })
  assert.deepEqual(planPullRequestStatus(['status/in-review'], 'implementation'), {
    add: [],
    remove: [],
    comment: null,
  })
  assert.deepEqual(planPullRequestStatus(['status/inbox', 'status/ready'], 'implementation').comment, 'Issue 有多个 status/*：status/inbox, status/ready')
})

test('issue events repair kind labels and terminal status', () => {
  assert.equal(isInvalidIssueLabel('kind/doc'), true)
  assert.equal(isInvalidIssueLabel('documentation'), true)
  assert.equal(isInvalidIssueLabel('area/docs'), false)
  assert.deepEqual(planIssueEvent({ action: 'opened', labels: [] }), {
    add: ['status/inbox'],
    remove: [],
    comment: null,
  })
  assert.deepEqual(planIssueEvent({ action: 'closed', stateReason: 'completed', labels: ['status/in-progress', 'kind/doc'] }), {
    add: ['status/done'],
    remove: ['kind/doc', 'status/in-progress'],
    comment: null,
  })
  const reopened = planIssueEvent({ action: 'reopened', labels: ['status/done'] })
  assert.deepEqual(reopened.add, ['status/ready'])
  assert.deepEqual(reopened.remove, ['status/done'])
})

test('issue metadata rejects missing type and inconsistent terminal status', () => {
  assert.ok(validateIssue({ labels: ['area/docs'], type: null, state: 'open', stateReason: null }).includes('Type 必须是 Feature、Bug 或 Task'))
  assert.ok(
    validateIssue({
      labels: ['status/done'],
      type: 'Task',
      state: 'open',
      stateReason: null,
    }).includes('status/done 必须对应 Completed 关闭原因'),
  )
  assert.deepEqual(
    validateIssue({ labels: ['status/ready', 'p1', 'area/process'], type: 'Task', state: 'open', stateReason: null }),
    [],
  )
})
