const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.join(__dirname, '../../data/config.json')
const CONFIG_DIR = path.dirname(CONFIG_PATH)

function ensureConfigFile() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, '{}', 'utf-8')
  }
}

function read() {
  ensureConfigFile()
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function write(data) {
  ensureConfigFile()
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function update(section, values) {
  const config = read()
  config[section] = { ...config[section], ...values }
  write(config)
  return config
}

module.exports = { read, write, update }
