const express = require('express')
const path = require('path')
const cors = require('cors')
const fs = require('fs')

const configRouter = require('./routes/config')
const controlRouter = require('./routes/control')
const logsRouter = require('./routes/logs')
const taskManager = require('./services/taskManager')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API 路由
app.use('/api/config', configRouter)
app.use('/api', controlRouter)
app.use('/api/logs', logsRouter)

// 状态接口
app.get('/api/status', (req, res) => {
  res.json(taskManager.getStatus())
})

// 托管前端构建产物
const distPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(distPath))

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (!fs.existsSync(indexPath)) {
    return res.status(503).send('Frontend assets are missing. Run `npm run build` before starting the server.')
  }
  res.sendFile(indexPath)
})

app.listen(PORT, () => {
  console.log(`[AutoMailReply] 服务已启动: http://localhost:${PORT}`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[错误] 端口 ${PORT} 已被占用，请关闭占用该端口的程序后重试`)
  } else {
    console.error('[错误] 服务启动失败:', err.message)
  }
  process.exit(1)
})

// 进程退出时清理
process.on('SIGINT', () => {
  taskManager.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  taskManager.stop()
  process.exit(0)
})
