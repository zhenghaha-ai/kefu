const nodemailer = require('nodemailer')

function createTransport(emailConfig, { port, secure } = {}) {
  return nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: port ?? emailConfig.smtpPort,
    secure: secure ?? emailConfig.smtpSSL,
    auth: {
      user: emailConfig.account,
      pass: emailConfig.authCode
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 120000
  })
}

// 降级策略：用户配置 → 587 STARTTLS → 465 SSL
function getFallbackConfigs(emailConfig) {
  const primary = { port: emailConfig.smtpPort, secure: emailConfig.smtpSSL }
  const fallbacks = []
  // 如果主端口不是 587，加 587 STARTTLS 降级
  if (emailConfig.smtpPort !== 587) {
    fallbacks.push({ port: 587, secure: false })
  }
  // 如果主端口不是 465，加 465 SSL 降级
  if (emailConfig.smtpPort !== 465) {
    fallbacks.push({ port: 465, secure: true })
  }
  return [primary, ...fallbacks]
}

async function send({ email, to, toName, subject, content, portOverride }) {
  const transporter = createTransport(email, portOverride || {})
  await transporter.sendMail({
    from: `"AutoReply" <${email.account}>`,
    to: toName ? `"${toName}" <${to}>` : to,
    subject,
    text: content
  })
}

async function sendWithRetry({ email, to, toName, subject, content, retryCount = 3, retryInterval = 5 }) {
  const configs = getFallbackConfigs(email)

  for (const portOverride of configs) {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        await send({ email, to, toName, subject, content, portOverride })
        if (portOverride.port !== email.smtpPort) {
          console.log(`[SMTP] 通过降级端口 ${portOverride.port} 发送成功`)
        }
        return { success: true }
      } catch (err) {
        console.warn(`[SMTP] 端口${portOverride.port} 第${attempt}次失败: ${err.message}`)
        if (attempt < retryCount) {
          await new Promise(r => setTimeout(r, retryInterval * 1000))
        }
      }
    }
    // 当前端口所有重试都失败，切换下一个
    if (portOverride !== configs[configs.length - 1]) {
      console.log(`[SMTP] 端口${portOverride.port}全部失败，尝试降级...`)
    }
  }
  return { success: false, error: '所有端口均发送失败' }
}

async function testConnection(emailConfig) {
  const client = new (require('imapflow').ImapFlow)({
    host: emailConfig.imapHost,
    port: emailConfig.imapPort,
    secure: emailConfig.imapSSL,
    auth: {
      user: emailConfig.account,
      pass: emailConfig.authCode
    },
    logger: false
  })
  await client.connect()
  await client.logout()
}

module.exports = { send, sendWithRetry, testConnection }
