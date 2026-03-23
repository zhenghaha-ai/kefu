<script setup>
import { ref, onMounted } from 'vue'

const logs = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const clearing = ref(false)
const message = ref({ text: '', type: '' })
const expandedId = ref(null)

async function fetchLogs() {
  loading.value = true
  try {
    const res = await fetch(`/api/logs?page=${page.value}&pageSize=${pageSize}`)
    const data = await res.json()
    logs.value = data.data || []
    total.value = data.total || 0
  } catch {}
  loading.value = false
}

async function handleClear() {
  if (!confirm('确认清空所有回复日志？此操作不可恢复。')) return
  clearing.value = true
  try {
    await fetch('/api/logs', { method: 'DELETE' })
    message.value = { text: '日志已清空', type: 'success' }
    logs.value = []
    total.value = 0
    page.value = 1
  } catch (err) {
    message.value = { text: '清空失败: ' + err.message, type: 'error' }
  }
  clearing.value = false
}

function handlePageChange(p) {
  page.value = p
  fetchLogs()
}

function handleToggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

const totalPages = () => Math.ceil(total.value / pageSize)

onMounted(fetchLogs)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">回复日志</div>
      <div class="page-desc">查看所有邮件处理记录，共 {{ total }} 条</div>
    </div>

    <div class="toolbar">
      <button class="btn btn-secondary" @click="fetchLogs" :disabled="loading">
        {{ loading ? '加载中...' : '🔄 刷新' }}
      </button>
      <button class="btn btn-danger" @click="handleClear" :disabled="clearing || total === 0">
        {{ clearing ? '清空中...' : '🗑 清空日志' }}
      </button>
    </div>

    <div v-if="message.text" class="alert" :class="`alert-${message.type}`" style="margin-bottom:16px;">
      {{ message.text }}
    </div>

    <div class="card" style="padding:0;overflow:hidden;">
      <div v-if="logs.length === 0" class="empty-tip">
        {{ loading ? '加载中...' : '暂无回复日志' }}
      </div>
      <div v-else>
        <div class="log-table-header">
          <span class="col-status">状态</span>
          <span class="col-from">发件人</span>
          <span class="col-subject">邮件主题</span>
          <span class="col-time">处理时间</span>
          <span class="col-action">操作</span>
        </div>
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-row"
          :class="{ expanded: expandedId === log.id }"
        >
          <div class="log-main-row" @click="handleToggleExpand(log.id)">
            <span class="col-status">
              <span class="status-badge" :class="log.status">
                {{ log.status === 'success' ? '成功' : '失败' }}
              </span>
            </span>
            <span class="col-from">{{ log.from }}</span>
            <span class="col-subject">{{ log.subject }}</span>
            <span class="col-time">{{ new Date(log.processedAt).toLocaleString('zh-CN') }}</span>
            <span class="col-action">
              <span class="expand-icon">{{ expandedId === log.id ? '▲' : '▼' }}</span>
            </span>
          </div>
          <div v-if="expandedId === log.id" class="log-detail">
            <div v-if="log.error" class="detail-error">
              <strong>错误信息：</strong>{{ log.error }}
            </div>
            <div class="detail-label">AI回复内容：</div>
            <div class="detail-content">{{ log.replyContent || '（无内容）' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages() > 1" class="pagination">
      <button class="page-btn" :disabled="page === 1" @click="handlePageChange(page - 1)">上一页</button>
      <span class="page-info">第 {{ page }} / {{ totalPages() }} 页</span>
      <button class="page-btn" :disabled="page >= totalPages()" @click="handlePageChange(page + 1)">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.empty-tip {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 48px 0;
}

.log-table-header {
  display: grid;
  grid-template-columns: 70px 200px 1fr 160px 60px;
  gap: 12px;
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.log-row {
  border-bottom: 1px solid #f3f4f6;
}

.log-main-row {
  display: grid;
  grid-template-columns: 70px 200px 1fr 160px 60px;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s;
  align-items: center;
}

.log-main-row:hover {
  background: #f9fafb;
}

.log-row.expanded .log-main-row {
  background: #fafaff;
}

.col-status,
.col-from,
.col-subject,
.col-time,
.col-action {
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.success {
  background: #d1fae5;
  color: #059669;
}

.status-badge.failed {
  background: #fee2e2;
  color: #dc2626;
}

.expand-icon {
  color: #9ca3af;
  font-size: 11px;
}

.log-detail {
  padding: 12px 20px 16px;
  background: #fafaff;
  border-top: 1px solid #e0e7ff;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.detail-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 10px 14px;
}

.detail-error {
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #6b7280;
}
</style>
