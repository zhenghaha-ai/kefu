const express = require('express')
const router = express.Router()
const logsService = require('../services/logsService')

// 获取日志（分页）
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 20
  res.json({ success: true, ...logsService.getPage(page, pageSize) })
})

// 清空日志
router.delete('/', (req, res) => {
  logsService.clear()
  res.json({ success: true, message: '日志已清空' })
})

module.exports = router
