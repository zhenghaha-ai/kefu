const { ImapFlow } = require('imapflow')
const { simpleParser } = require('mailparser')
const configService = require('./configService')
const aiService = require('./aiService')
const emailSender = require('./emailSender')
const logsService = require('./logsService')

// 自动化/无回复地址关键词，命中则跳过
const AUTO_SENDER_PATTERNS = [
  'no-reply', 'noreply', 'do-not-reply', 'donotreply',
  'mailer-daemon', 'postmaster', 'bounce', 'auto-reply',
  'notifications@', 'notification@', 'newsletter@', 'alerts@', 'system@'
]

function isAutoSender(address) {
  return AUTO_SENDER_PATTERNS.some(p => address.toLowerCase().includes(p))
}

// 已处理邮件 UID 集合（防重复）
const processedUids = new Set()
// 同一发件人首次回复记录
const repliedSenders = new Map()
// 服务启动时记录的最高 UID 基线，只处理大于它的新邮件
let baselineUid = 0
let initialized = false

function reset() {
  baselineUid = 0
  initialized = false
  processedUids.clear()
  repliedSenders.clear()
}

async function pollEmails() {
  const config = configService.read()
  const email = config.email || {}
  const ai = config.ai || {}
  const rules = config.rules || {}
  const run = config.run || {}

  if (!email.account || !email.authCode || !email.imapHost) {
    console.warn('[IMAP] 邮箱配置不完整，跳过本次轮询')
    return
  }

  const client = new ImapFlow({
    host: email.imapHost,
    port: email.imapPort,
    secure: email.imapSSL,
    auth: { user: email.account, pass: email.authCode },
    logger: false
  })

  try {
    await client.connect()
    await client.mailboxOpen('INBOX')

    // 必须加 { uid: true }，返回的才是稳定的 UID，否则返回序列号
    const unseenUids = await client.search({ seen: false }, { uid: true })

    if (!initialized) {
      // 首次轮询：仅记录基线，不回复任何邮件
      baselineUid = unseenUids.length > 0 ? Math.max(...unseenUids) : 0
      initialized = true
      console.log(`[IMAP] 初始化完成，跳过 ${unseenUids.length} 封历史未读邮件（基线UID: ${baselineUid}）`)
      await client.logout()
      return
    }

    // 只处理 UID 大于基线的新邮件
    const newUids = unseenUids.filter(uid => uid > baselineUid && !processedUids.has(uid))
    if (newUids.length === 0) {
      await client.logout()
      return
    }

    console.log(`[IMAP] 发现 ${newUids.length} 封新邮件`)

    for (const uid of newUids) {
      try {
        // fetchOne 第三个参数 { uid: true } 表示第一个参数是 UID
        const message = await client.fetchOne(uid, { source: true }, { uid: true })
        if (!message) continue

        const parsed = await simpleParser(message.source)
        const fromAddress = parsed.from?.value?.[0]?.address || ''
        const fromName = parsed.from?.value?.[0]?.name || fromAddress
        const subject = parsed.subject || '(无主题)'
        const textBody = parsed.text || parsed.html?.replace(/<[^>]+>/g, '') || ''

        // 空邮件跳过
        if (!fromAddress || !textBody.trim()) {
          await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
          processedUids.add(uid)
          continue
        }

        // 自动发件人过滤
        if (isAutoSender(fromAddress)) {
          await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
          processedUids.add(uid)
          console.log(`[过滤] 自动发件人跳过: ${fromAddress}`)
          continue
        }

        // 黑名单过滤
        const blacklist = run.blacklist || []
        if (blacklist.some(b => fromAddress.toLowerCase().includes(b.toLowerCase()))) {
          await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
          processedUids.add(uid)
          console.log(`[过滤] 黑名单跳过: ${fromAddress}`)
          continue
        }

        // 同一发件人仅回复首封
        if (run.duplicateSenderRule === 'first_only' && repliedSenders.has(fromAddress)) {
          processedUids.add(uid)
          console.log(`[跳过] 已回复过该发件人: ${fromAddress}`)
          continue
        }

        // 获取当前激活模板
        const templateId = rules.activeTemplate || 'default'
        const template = rules.templates?.[templateId] || {}

        console.log(`[AI] 生成回复: ${subject} (来自 ${fromAddress})`)
        const replyContent = await aiService.generateReply({
          from: fromAddress,
          fromName,
          subject,
          body: textBody.substring(0, 3000),
          guidelines: template.guidelines || '',
          restrictions: template.restrictions || '',
          ai: ai || {}
        })

        const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`
        const sendResult = await emailSender.sendWithRetry({
          email,
          to: fromAddress,
          toName: fromName,
          subject: replySubject,
          content: replyContent,
          retryCount: run.retryCount || 3,
          retryInterval: run.retryInterval || 5
        })

        // 标记已读，更新基线
        await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
        processedUids.add(uid)
        if (uid > baselineUid) baselineUid = uid
        if (run.duplicateSenderRule === 'first_only') {
          repliedSenders.set(fromAddress, Date.now())
        }

        logsService.append({
          from: fromAddress,
          subject,
          receivedAt: parsed.date?.toISOString() || new Date().toISOString(),
          replyContent,
          status: sendResult.success ? 'success' : 'failed',
          error: sendResult.error || ''
        })

        console.log(`[完成] 已回复: ${fromAddress} - ${subject}`)
      } catch (err) {
        console.error(`[错误] 处理邮件 uid=${uid} 失败:`, err.message)
      }
    }

    await client.logout()
  } catch (err) {
    console.error('[IMAP] 连接或操作失败:', err.message)
    try { await client.logout() } catch {}
  }
}

module.exports = { pollEmails, reset }
