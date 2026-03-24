const OpenAI = require('openai')

const BUILT_IN_API_KEY = 'sk-BZvkkVrX5P8WnDPRKlcr0iXilfQoxfJtFS1bIJhK5JMlqA9m'
const BUILT_IN_BASE_URL = 'https://api.tu-zi.com/v1'
const BUILT_IN_MODEL = 'gemini-3-flash-preview'

function createClient() {
  return new OpenAI({
    apiKey: BUILT_IN_API_KEY,
    baseURL: BUILT_IN_BASE_URL,
    timeout: 120000,  // 120秒超时
    maxRetries: 2     // 超时或网络错误自动重试2次
  })
}

async function generateReply({ from, fromName, subject, body, guidelines, restrictions, ai = {} }) {
  const client = createClient()

  const systemPrompt = `你是一名专业的邮件客服助手，负责代表公司回复客户邮件。

回复思路与核心逻辑：
${guidelines || '以专业、友好的方式回复邮件，解答对方的问题或需求。'}

注意事项与禁忌：
${restrictions || '保持礼貌，不承诺无法兑现的内容。'}

要求：
- 根据发件人姓名（如有）使用恰当称呼
- 回复内容简洁、专业、有针对性
- 直接给出回复正文，不需要额外解释
- 语气：${ai.style || '专业礼貌'}`

  const userPrompt = `请回复以下邮件：

发件人：${fromName || from}（${from}）
邮件主题：${subject}
邮件正文：
${body}`

  const response = await client.chat.completions.create({
    model: BUILT_IN_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: ai.maxTokens || 1500,
    temperature: ai.temperature ?? 0.7
  })

  return response.choices[0]?.message?.content?.trim() || '感谢您的来信，我们已收到您的邮件，将尽快处理。'
}

async function testConnection() {
  const client = createClient()
  const response = await client.chat.completions.create({
    model: BUILT_IN_MODEL,
    messages: [{ role: 'user', content: '回复"连接成功"' }],
    max_tokens: 10
  })
  return response.choices[0]?.message?.content || '连接成功'
}

module.exports = { generateReply, testConnection }
