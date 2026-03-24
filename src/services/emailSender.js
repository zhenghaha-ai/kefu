const nodemailer = require('nodemailer')

function createTransport(emailConfig) {
  return nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpSSL,
    auth: {
      user: emailConfig.account,
      pass: emailConfig.authCode
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 120000
  })
}

async function send({ email, to, toName, subject, content }) {
  const transporter = createTransport(email)
  await transporter.sendMail({
    from: `"AutoReply" <${email.account}>`,
    to: toName ? `"${toName}" <${to}>` : to,
    subject,
    text: content
  })
}

async function sendWithRetry({ email, to, toName, subject, content, retryCount = 3, retryInterval = 5 }) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      await send({ email, to, toName, subject, content })
      return { success: true }
    } catch (err) {
      console.warn(`[SMTP] 第${attempt}次发送失败: ${err.message}`)
      if (attempt < retryCount) {
        await new Promise(r => setTimeout(r, retryInterval * 1000))
      } else {
        return { success: false, error: err.message }
      }
    }
  }
  return { success: false, error: '超过最大重试次数' }
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
