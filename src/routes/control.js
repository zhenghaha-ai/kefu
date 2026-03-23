const express = require('express')
const router = express.Router()
const taskManager = require('../services/taskManager')

// 启动服务
router.post('/control/start', (req, res) => {
  const result = taskManager.start()
  res.json(result)
})

// 停止服务
router.post('/control/stop', (req, res) => {
  const result = taskManager.stop()
  res.json(result)
})

module.exports = router
