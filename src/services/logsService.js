const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const LOGS_PATH = path.join(__dirname, '../../data/logs.json')

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(LOGS_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function append(entry) {
  const logs = readAll()
  logs.unshift({
    id: uuidv4(),
    processedAt: new Date().toISOString(),
    ...entry
  })
  // 最多保留 1000 条
  fs.writeFileSync(LOGS_PATH, JSON.stringify(logs.slice(0, 1000), null, 2), 'utf-8')
}

function clear() {
  fs.writeFileSync(LOGS_PATH, '[]', 'utf-8')
}

function getPage(page = 1, pageSize = 20) {
  const logs = readAll()
  const total = logs.length
  const start = (page - 1) * pageSize
  return {
    total,
    page,
    pageSize,
    data: logs.slice(start, start + pageSize)
  }
}

module.exports = { append, clear, getPage, readAll }
