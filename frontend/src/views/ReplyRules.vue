<script setup>
import { ref, onMounted } from 'vue'

const templates = ref({})
const activeTemplate = ref('default')
const currentId = ref('default')
const currentName = ref('')
const guidelines = ref('')
const restrictions = ref('')
const saving = ref(false)
const message = ref({ text: '', type: '' })
const newTemplateName = ref('')
const showNewForm = ref(false)

function loadTemplate(id) {
  const tpl = templates.value[id]
  if (tpl) {
    currentId.value = id
    currentName.value = tpl.name
    guidelines.value = tpl.guidelines || ''
    restrictions.value = tpl.restrictions || ''
  }
}

function handleSelectTemplate(id) {
  loadTemplate(id)
}

function handleAddTemplate() {
  if (!newTemplateName.value.trim()) return
  const id = 'tpl_' + Date.now()
  templates.value[id] = { name: newTemplateName.value.trim(), guidelines: '', restrictions: '' }
  newTemplateName.value = ''
  showNewForm.value = false
  loadTemplate(id)
}

function handleDeleteTemplate(id) {
  if (id === 'default') {
    message.value = { text: '默认模板不可删除', type: 'error' }
    return
  }
  delete templates.value[id]
  if (currentId.value === id) loadTemplate('default')
}

async function handleSave() {
  saving.value = true
  message.value = { text: '', type: '' }

  // 先更新当前模板内容
  templates.value[currentId.value] = {
    name: currentName.value || '模板',
    guidelines: guidelines.value,
    restrictions: restrictions.value
  }

  try {
    const res = await fetch('/api/config/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeTemplate: activeTemplate.value,
        templates: templates.value
      })
    })
    const data = await res.json()
    message.value = { text: data.success ? '规则已保存' : data.message, type: data.success ? 'success' : 'error' }
  } catch (err) {
    message.value = { text: '保存失败: ' + err.message, type: 'error' }
  } finally {
    saving.value = false
  }
}

function handleSetActive(id) {
  activeTemplate.value = id
}

onMounted(async () => {
  try {
    const res = await fetch('/api/config')
    const data = await res.json()
    if (data.data?.rules) {
      templates.value = data.data.rules.templates || { default: { name: '默认模板', guidelines: '', restrictions: '' } }
      activeTemplate.value = data.data.rules.activeTemplate || 'default'
      loadTemplate(activeTemplate.value)
    } else {
      templates.value = { default: { name: '默认模板', guidelines: '', restrictions: '' } }
      loadTemplate('default')
    }
  } catch {
    templates.value = { default: { name: '默认模板', guidelines: '', restrictions: '' } }
    loadTemplate('default')
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">回复规则配置</div>
      <div class="page-desc">设置AI回复的核心逻辑与注意事项，支持多套模板按场景切换</div>
    </div>

    <div class="layout">
      <!-- 模板列表 -->
      <div class="template-panel">
        <div class="panel-header">
          <span>回复模板</span>
          <button class="btn btn-secondary btn-sm" @click="showNewForm = !showNewForm">+ 新增</button>
        </div>
        <div v-if="showNewForm" class="new-form">
          <input v-model="newTemplateName" type="text" placeholder="模板名称" @keyup.enter="handleAddTemplate" />
          <button class="btn btn-primary btn-sm" @click="handleAddTemplate">确认</button>
        </div>
        <div class="template-list">
          <div
            v-for="(tpl, id) in templates"
            :key="id"
            class="template-item"
            :class="{ selected: currentId === id }"
            @click="handleSelectTemplate(id)"
          >
            <div class="tpl-info">
              <div class="tpl-name">{{ tpl.name }}</div>
              <div v-if="activeTemplate === id" class="tpl-active-badge">启用中</div>
            </div>
            <div class="tpl-actions">
              <button
                v-if="activeTemplate !== id"
                class="tpl-btn"
                title="设为当前使用模板"
                @click.stop="handleSetActive(id)"
              >✓</button>
              <button
                v-if="id !== 'default'"
                class="tpl-btn danger"
                title="删除"
                @click.stop="handleDeleteTemplate(id)"
              >✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑区 -->
      <div class="edit-panel">
        <div class="card">
          <div class="card-title">编辑模板：{{ currentName }}</div>
          <div class="form-item" style="margin-bottom:16px;">
            <label>模板名称</label>
            <input v-model="currentName" type="text" />
          </div>
          <div class="form-item" style="margin-bottom:16px;">
            <label>回复思路与核心逻辑</label>
            <textarea
              v-model="guidelines"
              rows="8"
              placeholder="描述AI回复邮件时的核心逻辑，例如：
- 你代表XX公司客服
- 如遇产品咨询，告知对方我们提供XX服务
- 如遇投诉，首先表达歉意，承诺72小时内处理
- 保持专业、耐心的沟通风格"
            ></textarea>
          </div>
          <div class="form-item">
            <label>注意事项与禁忌话术</label>
            <textarea
              v-model="restrictions"
              rows="6"
              placeholder="列出AI绝对不能说的内容，例如：
- 不得承诺具体退款金额
- 不得透露公司内部价格
- 涉及法律问题，引导联系法务部门
- 紧急情况请联系：400-XXX-XXXX"
            ></textarea>
          </div>
        </div>

        <div v-if="message.text" class="alert" :class="`alert-${message.type}`">
          {{ message.text }}
        </div>

        <div class="btn-actions">
          <button class="btn btn-primary" @click="handleSave" :disabled="saving">
            {{ saving ? '保存中...' : '💾 保存规则' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
}

.template-panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  height: fit-content;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.btn-sm {
  font-size: 12px;
  padding: 4px 10px;
}

.new-form {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.new-form input {
  flex: 1;
  padding: 6px 8px;
  font-size: 13px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.template-item:hover {
  background: #f3f4f6;
}

.template-item.selected {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.tpl-name {
  font-size: 13px;
  color: #111827;
}

.tpl-active-badge {
  font-size: 10px;
  color: #6366f1;
  background: #e0e7ff;
  border-radius: 4px;
  padding: 1px 5px;
  margin-top: 2px;
}

.tpl-actions {
  display: flex;
  gap: 4px;
}

.tpl-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tpl-btn:hover {
  background: #e5e7eb;
}

.tpl-btn.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.edit-panel {
  min-width: 0;
}
</style>
