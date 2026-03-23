const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.join(__dirname, '../../data/config.json')

function read() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function write(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function update(section, values) {
  const config = read()
  config[section] = { ...config[section], ...values }
  write(config)
  return config
}

module.exports = { read, write, update }
