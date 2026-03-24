const emailListener = require('./emailListener')
const configService = require('./configService')

let intervalId = null
let status = 'stopped'
let lastError = ''
let startedAt = null
let isPolling = false  // 防止并发轮询

function getStatus() {
  const config = configService.read()
  return {
    status,
    lastError,
    startedAt,
    emailConfigured: !!(config.email?.account && config.email?.imapHost),
    aiConfigured: true
  }
}

function start() {
  if (intervalId) return { success: false, message: '服务已在运行中' }

  const config = configService.read()
  if (!config.email?.account || !config.email?.authCode || !config.email?.imapHost) {
    return { success: false, message: '邮箱配置不完整，请先完成邮箱绑定' }
  }

  // 重置基线，确保只处理启动后的新邮件
  emailListener.reset()

  const pollingInterval = (config.run?.pollingInterval || 30) * 1000

  // 立即执行一次
  runPoll()

  intervalId = setInterval(runPoll, pollingInterval)
  status = 'running'
  lastError = ''
  startedAt = new Date().toISOString()
  console.log(`[TaskManager] 服务已启动，轮询间隔: ${config.run?.pollingInterval || 30}秒`)
  return { success: true, message: '服务已启动' }
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  status = 'stopped'
  startedAt = null
  isPolling = false
  console.log('[TaskManager] 服务已停止')
  return { success: true, message: '服务已停止' }
}

async function runPoll() {
  if (isPolling) return
  isPolling = true
  try {
    await emailListener.pollEmails()
    if (status === 'error') {
      status = 'running'
      lastError = ''
    }
  } catch (err) {
    status = 'error'
    lastError = err.message
    console.error('[TaskManager] 轮询出错:', err.message)
  } finally {
    isPolling = false
  }
}

module.exports = { start, stop, getStatus }
