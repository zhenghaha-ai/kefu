<script setup>
import { ref, onMounted } from 'vue'
import { emailPresets } from '@/data/emailPresets.js'

// 域名 → 预设的映射
const domainMap = {
  'qq.com': 'QQ邮箱',
  'foxmail.com': 'QQ邮箱',
  '163.com': '163邮箱',
  '126.com': '126邮箱',
  'gmail.com': 'Gmail',
  'googlemail.com': 'Gmail',
  'outlook.com': 'Outlook/Hotmail',
  'hotmail.com': 'Outlook/Hotmail',
  'live.com': 'Outlook/Hotmail',
  'exmail.qq.com': '企业邮箱(腾讯)',
  'mxhichina.com': '阿里企业邮箱'
}

const form = ref({
  account: '',
  authCode: '',
  imapHost: '',
  imapPort: 993,
  imapSSL: true,
  smtpHost: '',
  smtpPort: 465,
  smtpSSL: true
})

const saving = ref(false)
const testing = ref(false)
const message = ref({ text: '', type: '' })
const selectedPreset = ref('')
const autoDetected = ref('')

function applyPreset(presetName) {
  const preset = emailPresets.find(p => p.name === presetName)
  if (preset) {
    form.value.imapHost = preset.imapHost
    form.value.imapPort = preset.imapPort
    form.value.imapSSL = preset.imapSSL
    form.value.smtpHost = preset.smtpHost
    form.value.smtpPort = preset.smtpPort
    form.value.smtpSSL = preset.smtpSSL
    selectedPreset.value = presetName
  }
}

function handlePresetChange() {
  applyPreset(selectedPreset.value)
  autoDetected.value = ''
}

function handleAccountInput() {
  const domain = form.value.account.split('@')[1]?.toLowerCase()
  if (!domain) return
  const presetName = domainMap[domain]
  if (presetName && !form.value.imapHost) {
    applyPreset(presetName)
    autoDetected.value = presetName
  }
}

async function handleSave() {
  saving.value = true
  message.value = { text: '', type: '' }
  try {
    const res = await fetch('/api/config/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    message.value = { text: data.success ? '配置已保存' : data.message, type: data.success ? 'success' : 'error' }
  } catch (err) {
    message.value = { text: '保存失败: ' + err.message, type: 'error' }
  } finally {
    saving.value = false
  }
}

async function handleTest() {
  testing.value = true
  message.value = { text: '', type: '' }
  try {
    const res = await fetch('/api/config/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    message.value = { text: data.message, type: data.success ? 'success' : 'error' }
  } catch (err) {
    message.value = { text: '测试失败: ' + err.message, type: 'error' }
  } finally {
    testing.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/config')
    const data = await res.json()
    if (data.data?.email) {
      Object.assign(form.value, data.data.email)
    }
  } catch {}
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">邮箱配置</div>
      <div class="page-desc">绑定用于接收和发送邮件的邮箱账号</div>
    </div>

    <div class="card">
      <div class="card-title">快速选择邮箱服务商</div>
      <div class="preset-grid">
        <button
          v-for="preset in emailPresets"
          :key="preset.name"
          class="preset-btn"
          :class="{ active: selectedPreset === preset.name }"
          @click="selectedPreset = preset.name; handlePresetChange()"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">账号信息</div>
      <div class="form-row">
        <div class="form-item">
          <label>邮箱账号 *</label>
          <input v-model="form.account" type="email" placeholder="example@qq.com" @input="handleAccountInput" />
          <div v-if="autoDetected" class="auto-tip">✓ 已自动识别为 {{ autoDetected }}，服务器地址已填入</div>
        </div>
        <div class="form-item">
          <label>授权码 *</label>
          <input v-model="form.authCode" type="password" placeholder="邮箱授权码（非登录密码）" />
        </div>
      </div>
      <div class="tip">
        💡 授权码非登录密码，需在邮箱设置中开启IMAP并生成授权码
      </div>
    </div>

    <div class="card">
      <div class="card-title">IMAP收件服务器（收信）</div>
      <div class="form-row">
        <div class="form-item">
          <label>服务器地址 *</label>
          <input v-model="form.imapHost" type="text" placeholder="imap.qq.com" />
        </div>
        <div class="form-item">
          <label>端口号</label>
          <input v-model.number="form.imapPort" type="number" placeholder="993" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>SSL加密</label>
          <select v-model="form.imapSSL">
            <option :value="true">启用（推荐）</option>
            <option :value="false">禁用</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">SMTP发件服务器（发信）</div>
      <div class="form-row">
        <div class="form-item">
          <label>服务器地址 *</label>
          <input v-model="form.smtpHost" type="text" placeholder="smtp.qq.com" />
        </div>
        <div class="form-item">
          <label>端口号</label>
          <input v-model.number="form.smtpPort" type="number" placeholder="465" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>SSL加密</label>
          <select v-model="form.smtpSSL">
            <option :value="true">启用（推荐）</option>
            <option :value="false">禁用</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="message.text" class="alert" :class="`alert-${message.type}`">
      {{ message.text }}
    </div>

    <div class="btn-actions">
      <button class="btn btn-primary" @click="handleSave" :disabled="saving">
        {{ saving ? '保存中...' : '💾 保存配置' }}
      </button>
      <button class="btn btn-success" @click="handleTest" :disabled="testing">
        {{ testing ? '测试中...' : '🔌 测试连接' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auto-tip {
  font-size: 12px;
  color: #059669;
  margin-top: 4px;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover,
.preset-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 6px;
  border: 1px solid #fde68a;
}
</style>
