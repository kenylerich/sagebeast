#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'

const acceptance = 'docs/decisions/0003-catalog-accepted.md'
const allowed = new Set([
  '.git',
  '.github',
  '.gitignore',
  '.gitattributes',
  'docs',
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'SAFETY.md',
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
])

if (fs.existsSync(acceptance)) {
  process.stdout.write('需求目录已有接受记录，编码门禁打开。\n')
  process.exit(0)
}

const unexpected = fs.readdirSync('.').filter((name) => !allowed.has(name))
if (unexpected.length === 0) {
  process.stdout.write('编码门禁关闭：仓库仍只有文档和需求管理配置。\n')
  process.exit(0)
}

process.stderr.write(
  [
    '编码门禁未打开。缺少 docs/decisions/0003-catalog-accepted.md。',
    `不允许的顶层路径：${unexpected.join(', ')}`,
    '在需求目录被明确接受前，只允许文档、决策记录和 .github 流程配置。',
  ].join('\n') + '\n',
)
process.exit(1)
