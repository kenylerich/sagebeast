#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const catalog = JSON.parse(fs.readFileSync(new URL('../labels.json', import.meta.url), 'utf8'))
const retire = process.argv.includes('--retire')
const repository = process.env.GITHUB_REPOSITORY || 'kenylerich/sagebeast'

async function github(pathname, { method = 'GET', body } = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN 或 GH_TOKEN 未设置')
  const response = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sagebeast-label-sync',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`${method} ${pathname} 失败：${response.status} ${await response.text()}`)
  if (response.status === 204) return null
  return response.json()
}

async function upsert(label) {
  const existing = await github(`/repos/${repository}/labels/${encodeURIComponent(label.name)}`)
  if (!existing) {
    await github(`/repos/${repository}/labels`, { method: 'POST', body: label })
    process.stdout.write(`created ${label.name}\n`)
    return
  }
  if (existing.color !== label.color || existing.description !== label.description) {
    await github(`/repos/${repository}/labels/${encodeURIComponent(label.name)}`, {
      method: 'PATCH',
      body: label,
    })
    process.stdout.write(`updated ${label.name}\n`)
    return
  }
  process.stdout.write(`kept ${label.name}\n`)
}

async function removeRetired(name) {
  const existing = await github(`/repos/${repository}/labels/${encodeURIComponent(name)}`)
  if (!existing) return
  await github(`/repos/${repository}/labels/${encodeURIComponent(name)}`, { method: 'DELETE' })
  process.stdout.write(`retired ${name}\n`)
}

async function main() {
  for (const label of catalog.labels) await upsert(label)
  if (!retire) return
  for (const name of catalog.retired) await removeRetired(name)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
