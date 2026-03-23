<script setup>
import { ref, onMounted } from 'vue'

const form = ref({
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  maxTokens: 500,
  temperature: 0.7,
  style: '专业礼貌'
})

const saving = ref(false)
const testing = ref(false)
const message = ref({ text: '', type: '' })

const styleOptions = ['专业礼貌', '热情友好', '简洁明了', '正式严谨', '轻松亲切']

const commonModels = [
  'gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo',
  'claude-sonnet-4-6', 'claude-haiku-4-5-20251001',
  'deepseek-chat', 'qwen-max', 'glm-4'
]

async function handleSave() {
  saving.value = true
  message.value = { text: '', type: '' }
  try {
    const res = await fetch('/api/config/ai', {
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
    const res = await fetch('/api/config/ai/test', {
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
    if (data.data?.ai) {
      Object.assign(form.value, data.data.ai)
    }
  } catch {}
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">AI接口配置</div>
      <div class="page-desc">配置AI接口，支持OpenAI及所有兼容接口（通义、文心、DeepSeek等）</div>
    </div>

    <div class="card">
      <div class="card-title">接口配置</div>
      <div class="form-row">
        <div class="form-item full">
          <label>接口地址（Base URL）</label>
          <input v-model="form.baseUrl" type="text" placeholder="https://api.openai.com/v1" />
          <div class="field-hint">国内模型请填写对应的API地址，留空默认使用OpenAI</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">模型参数</div>
      <div class="form-row">
        <div class="form-item">
          <label>模型名称</label>
          <input v-model="form.model" type="text" placeholder="gpt-4o-mini" list="model-list" />
          <datalist id="model-list">
            <option v-for="m in commonModels" :key="m" :value="m" />
          </datalist>
        </div>
        <div class="form-item">
          <label>回复语气风格</label>
          <select v-model="form.style">
            <option v-for="s in styleOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-item">
          <label>最大回复字数（max_tokens）</label>
          <input v-model.number="form.maxTokens" type="number" min="100" max="4000" />
        </div>
        <div class="form-item">
          <label>创造性（temperature：0=严谨，1=发散）</label>
          <input v-model.number="form.temperature" type="number" min="0" max="1" step="0.1" />
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
        {{ testing ? '测试中...' : '🔌 测试接口' }}
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
</style>
