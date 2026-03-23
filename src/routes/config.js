const express = require('express')
const router = express.Router()
const configService = require('../services/configService')
const { ImapFlow } = require('imapflow')
const aiService = require('../services/aiService')

// 获取全量配置（隐藏敏感字段明文，但前端需要展示）
router.get('/', (req, res) => {
  const config = configService.read()
  res.json({ success: true, data: config })
})

// 保存邮箱配置
router.post('/email', (req, res) => {
  try {
    const config = configService.update('email', req.body)
    res.json({ success: true, data: config.email })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// 测试IMAP邮箱连接
router.post('/email/test', async (req, res) => {
  const { account, authCode, imapHost, imapPort, imapSSL } = req.body
  if (!account || !authCode || !imapHost) {
    return res.json({ success: false, message: '请填写邮箱账号、授权码和IMAP服务器地址' })
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort || 993,
    secure: imapSSL !== false,
    auth: { user: account, pass: authCode },
    logger: false
  })

  try {
    await client.connect()
    await client.logout()
    res.json({ success: true, message: 'IMAP连接成功' })
  } catch (err) {
    res.json({ success: false, message: `连接失败: ${err.message}` })
  }
})

// 保存AI配置
router.post('/ai', (req, res) => {
  try {
    const config = configService.update('ai', req.body)
    res.json({ success: true, data: config.ai })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// 测试AI接口
router.post('/ai/test', async (req, res) => {
  const { baseUrl, model } = req.body
  try {
    const result = await aiService.testConnection({ baseUrl, model })
    res.json({ success: true, message: `AI接口连接成功，响应: ${result}` })
  } catch (err) {
    res.json({ success: false, message: `连接失败: ${err.message}` })
  }
})

// 保存回复规则
router.post('/rules', (req, res) => {
  try {
    const config = configService.update('rules', req.body)
    res.json({ success: true, data: config.rules })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

// 保存运行参数
router.post('/run', (req, res) => {
  try {
    const config = configService.update('run', req.body)
    res.json({ success: true, data: config.run })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
})

module.exports = router
