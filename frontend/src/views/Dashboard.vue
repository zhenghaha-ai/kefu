<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const status = ref({ status: 'stopped', emailConfigured: false, aiConfigured: false })
const logs = ref([])
const loading = ref(false)
const message = ref({ text: '', type: '' })
let timer = null

async function fetchStatus() {
  try {
    const res = await fetch('/api/status')
    status.value = await res.json()
  } catch {}
}

async function fetchRecentLogs() {
  try {
    const res = await fetch('/api/logs?page=1&pageSize=5')
    const data = await res.json()
    logs.value = data.data || []
  } catch {}
}

async function handleToggle() {
  loading.value = true
  message.value = { text: '', type: '' }
  const action = status.value.status === 'running' ? 'stop' : 'start'
  try {
    const res = await fetch(`/api/control/${action}`, { method: 'POST' })
    const data = await res.json()
    message.value = { text: data.message, type: data.success ? 'success' : 'error' }
    await fetchStatus()
  } catch (err) {
    message.value = { text: '操作失败: ' + err.message, type: 'error' }
  } finally {
    loading.value = false
  }
}

const statusInfo = {
  running: { label: '运行中', color: '#10b981', bg: '#d1fae5', icon: '✅' },
  stopped: { label: '已停止', color: '#6b7280', bg: '#f3f4f6', icon: '⏸️' },
  error: { label: '运行异常', color: '#ef4444', bg: '#fee2e2', icon: '⚠️' }
}

function getStatusInfo() {
  return statusInfo[status.value.status] || statusInfo.stopped
}

onMounted(() => {
  fetchStatus()
  fetchRecentLogs()
  timer = setInterval(() => {
    fetchStatus()
    fetchRecentLogs()
  }, 5000)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">运行状态</div>
      <div class="page-desc">监控自动回复服务状态，查看实时运行情况</div>
    </div>

    <!-- 状态卡片区 -->
    <div class="status-grid">
      <!-- 服务状态 -->
      <div class="stat-card service-card">
        <div class="stat-icon" :style="{ background: getStatusInfo().bg, color: getStatusInfo().color }">
          {{ getStatusInfo().icon }}
        </div>
        <div class="stat-info">
          <div class="stat-label">服务状态</div>
          <div class="stat-value" :style="{ color: getStatusInfo().color }">{{ getStatusInfo().label }}</div>
          <div v-if="status.lastError" class="stat-error">{{ status.lastError }}</div>
        </div>
        <button
          class="btn toggle-btn"
          :class="status.status === 'running' ? 'btn-danger' : 'btn-primary'"
          @click="handleToggle"
          :disabled="loading"
        >
          {{ loading ? '处理中...' : status.status === 'running' ? '⏹ 停止服务' : '▶ 启动服务' }}
        </button>
      </div>

      <!-- 邮箱状态 -->
      <div class="stat-card">
        <div class="stat-icon" :style="{ background: status.emailConfigured ? '#d1fae5' : '#fef3c7', color: status.emailConfigured ? '#059669' : '#d97706' }">
          📧
        </div>
        <div class="stat-info">
          <div class="stat-label">邮箱配置</div>
          <div class="stat-value" :style="{ color: status.emailConfigured ? '#059669' : '#d97706' }">
            {{ status.emailConfigured ? '已配置' : '未配置' }}
          </div>
        </div>
        <router-link to="/email" class="btn btn-secondary stat-action">去配置</router-link>
      </div>
    </div>

    <div v-if="message.text" class="alert" :class="`alert-${message.type}`">
      {{ message.text }}
    </div>

    <!-- 启动时间 -->
    <div v-if="status.startedAt" class="card">
      <div class="card-title">运行信息</div>
      <div class="info-row">
        <span class="info-label">启动时间</span>
        <span class="info-value">{{ new Date(status.startedAt).toLocaleString('zh-CN') }}</span>
      </div>
    </div>

    <!-- 最近日志 -->
    <div class="card">
      <div class="card-title-row">
        <div class="card-title" style="margin-bottom:0;border-bottom:none;">最近回复记录</div>
        <router-link to="/logs" class="btn btn-secondary btn-sm">查看全部</router-link>
      </div>
      <div v-if="logs.length === 0" class="empty-tip">暂无回复记录</div>
      <div v-else class="log-list">
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-status" :class="log.status">
            {{ log.status === 'success' ? '✓' : '✗' }}
          </div>
          <div class="log-main">
            <div class="log-subject">{{ log.subject }}</div>
            <div class="log-from">{{ log.from }}</div>
          </div>
          <div class="log-time">{{ new Date(log.processedAt).toLocaleString('zh-CN') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.stat-action {
  font-size: 12px;
  padding: 6px 12px;
}

.toggle-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.btn-sm {
  font-size: 12px;
  padding: 5px 10px;
}

.info-row {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
  min-width: 80px;
}

.info-value {
  color: #111827;
}

.empty-tip {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.log-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.log-status.success {
  background: #d1fae5;
  color: #059669;
}

.log-status.failed {
  background: #fee2e2;
  color: #dc2626;
}

.log-main {
  flex: 1;
  min-width: 0;
}

.log-subject {
  font-size: 14px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-from {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>
