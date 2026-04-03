<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const serviceStatus = ref('stopped')
let statusTimer = null

const navItems = [
  { path: '/dashboard', icon: '📊', label: '运行状态' },
  { path: '/email', icon: '📧', label: '邮箱配置' },
  { path: '/rules', icon: '📝', label: '回复规则' },
  { path: '/run', icon: '⚙️', label: '运行参数' },
  { path: '/logs', icon: '📋', label: '回复日志' }
]

async function fetchStatus() {
  try {
    const res = await fetch('/api/status')
    const data = await res.json()
    serviceStatus.value = data.status
  } catch {}
}

onMounted(() => {
  fetchStatus()
  statusTimer = setInterval(fetchStatus, 5000)
})

onUnmounted(() => {
  clearInterval(statusTimer)
})
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo-icon">📧</span>
        <div class="logo-text">
          <div class="logo-title">邮件AI助手</div>
          <div class="logo-sub">自动回复系统</div>
        </div>
      </div>

      <nav class="nav-menu">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="status-badge" :class="serviceStatus">
          <span class="status-dot"></span>
          <span>{{ serviceStatus === 'running' ? '运行中' : serviceStatus === 'error' ? '异常' : '已停止' }}</span>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
      <footer class="app-footer">
        <p>亚声威格 © AI 创新 2026</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sidebar {
  width: 220px;
  background: #1a1f2e;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.logo-icon {
  font-size: 28px;
}

.logo-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.logo-sub {
  color: rgba(255,255,255,0.45);
  font-size: 11px;
  margin-top: 2px;
}

.nav-menu {
  flex: 1;
  padding: 12px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.9);
}

.nav-item.active {
  background: rgba(99,102,241,0.2);
  color: #818cf8;
  border-right: 3px solid #6366f1;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-label {
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.status-badge.running .status-dot {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  animation: pulse 2s infinite;
}

.status-badge.running {
  color: #10b981;
}

.status-badge.error .status-dot {
  background: #ef4444;
}

.status-badge.error {
  color: #ef4444;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.app-footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
}

.app-footer p {
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 3px;
  color: rgba(107, 114, 128, 0.2);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>

<style>
body {
  margin: 0;
  padding: 0;
}

.page {
  padding: 32px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
}

.page-desc {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item.full {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

input[type="text"],
input[type="password"],
input[type="number"],
input[type="email"],
select,
textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-primary:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.btn-danger:hover {
  background: #fecaca;
}

.btn-success {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #6ee7b7;
}

.btn-success:hover {
  background: #a7f3d0;
}

.btn-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.alert {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.alert-info {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}
</style>
