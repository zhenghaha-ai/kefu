<script setup>
import { ref, onMounted } from 'vue'

const form = ref({
  pollingInterval: 30,
  retryCount: 3,
  retryInterval: 5,
  blacklist: [],
  whitelist: [],
  duplicateSenderRule: 'each'
})

const saving = ref(false)
const message = ref({ text: '', type: '' })
const blackInput = ref('')
const whiteInput = ref('')

function handleAddBlack() {
  const email = blackInput.value.trim()
  if (email && !form.value.blacklist.includes(email)) {
    form.value.blacklist.push(email)
  }
  blackInput.value = ''
}

function handleRemoveBlack(email) {
  form.value.blacklist = form.value.blacklist.filter(e => e !== email)
}

function handleAddWhite() {
  const email = whiteInput.value.trim()
  if (email && !form.value.whitelist.includes(email)) {
    form.value.whitelist.push(email)
  }
  whiteInput.value = ''
}

function handleRemoveWhite(email) {
  form.value.whitelist = form.value.whitelist.filter(e => e !== email)
}

async function handleSave() {
  saving.value = true
  message.value = { text: '', type: '' }
  try {
    const res = await fetch('/api/config/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json()
    message.value = { text: data.success ? '参数已保存' : data.message, type: data.success ? 'success' : 'error' }
  } catch (err) {
    message.value = { text: '保存失败: ' + err.message, type: 'error' }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/config')
    const data = await res.json()
    if (data.data?.run) {
      Object.assign(form.value, data.data.run)
    }
  } catch {}
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">运行参数</div>
      <div class="page-desc">设置邮件轮询频率、重试策略、黑白名单等运行参数</div>
    </div>

    <div class="card">
      <div class="card-title">轮询与重试设置</div>
      <div class="form-row">
        <div class="form-item">
          <label>邮件轮询频率（秒）</label>
          <input v-model.number="form.pollingInterval" type="number" min="10" max="300" />
          <div class="field-hint">建议30-60秒，最低10秒</div>
        </div>
        <div class="form-item">
          <label>发送失败重试次数</label>
          <input v-model.number="form.retryCount" type="number" min="1" max="10" />
        </div>
        <div class="form-item">
          <label>重试间隔（秒）</label>
          <input v-model.number="form.retryInterval" type="number" min="1" max="60" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">重复发件人回复规则</div>
      <div class="radio-group">
        <label class="radio-item">
          <input type="radio" v-model="form.duplicateSenderRule" value="first_only" />
          <div class="radio-content">
            <div class="radio-title">仅回复首封</div>
            <div class="radio-desc">同一发件人只回复第一封邮件，避免重复打扰</div>
          </div>
        </label>
        <label class="radio-item">
          <input type="radio" v-model="form.duplicateSenderRule" value="each" />
          <div class="radio-content">
            <div class="radio-title">逐封回复</div>
            <div class="radio-desc">每封邮件都独立回复</div>
          </div>
        </label>
      </div>
    </div>

    <div class="card">
      <div class="card-title">黑名单（不回复这些邮件地址）</div>
      <div class="tag-input-row">
        <input
          v-model="blackInput"
          type="email"
          placeholder="输入邮箱地址后按回车添加"
          @keyup.enter="handleAddBlack"
        />
        <button class="btn btn-secondary" @click="handleAddBlack">添加</button>
      </div>
      <div class="tag-list" v-if="form.blacklist.length">
        <div v-for="email in form.blacklist" :key="email" class="tag tag-black">
          {{ email }}
          <span class="tag-remove" @click="handleRemoveBlack(email)">×</span>
        </div>
      </div>
      <div v-else class="empty-hint">暂无黑名单</div>
    </div>

    <div class="card">
      <div class="card-title">白名单（仅回复这些邮件地址，为空则全部回复）</div>
      <div class="tag-input-row">
        <input
          v-model="whiteInput"
          type="email"
          placeholder="输入邮箱地址后按回车添加"
          @keyup.enter="handleAddWhite"
        />
        <button class="btn btn-secondary" @click="handleAddWhite">添加</button>
      </div>
      <div class="tag-list" v-if="form.whitelist.length">
        <div v-for="email in form.whitelist" :key="email" class="tag tag-white">
          {{ email }}
          <span class="tag-remove" @click="handleRemoveWhite(email)">×</span>
        </div>
      </div>
      <div v-else class="empty-hint">暂无白名单（回复所有来信）</div>
    </div>

    <div v-if="message.text" class="alert" :class="`alert-${message.type}`">
      {{ message.text }}
    </div>

    <div class="btn-actions">
      <button class="btn btn-primary" @click="handleSave" :disabled="saving">
        {{ saving ? '保存中...' : '💾 保存参数' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.field-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.form-row {
  grid-template-columns: 1fr 1fr 1fr;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.radio-item:has(input:checked) {
  border-color: #6366f1;
  background: #eef2ff;
}

.radio-item input {
  margin-top: 2px;
  width: auto;
  accent-color: #6366f1;
}

.radio-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.radio-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.tag-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-input-row input {
  flex: 1;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
}

.tag-black {
  background: #fee2e2;
  color: #991b1b;
}

.tag-white {
  background: #d1fae5;
  color: #065f46;
}

.tag-remove {
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
  opacity: 0.7;
}

.tag-remove:hover {
  opacity: 1;
}

.empty-hint {
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 0;
}
</style>
