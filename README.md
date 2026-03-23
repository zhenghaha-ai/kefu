# 邮件AI自动回复系统

Web版智能邮件自动响应工具，支持7×24小时无人值守自动回复，全程可视化配置，开箱即用。

## 功能特性

- **可视化配置**：浏览器访问，无需技术操作，支持邮箱绑定、AI接口配置、回复规则设定
- **智能回复**：调用OpenAI兼容AI接口，结合预设回复思路生成合规话术
- **自动监听**：IMAP实时轮询，新邮件触发自动回复，关闭网页不影响运行
- **防重复机制**：已读标记 + 唯一ID记录，杜绝重复回复
- **黑白名单**：灵活过滤来信，精准控制回复范围
- **多套模板**：支持配置多套回复规则，按场景切换使用
- **回复日志**：全量记录处理历史，成功/失败一目了然

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js + Express |
| 前端 | Vue 3 + Vite |
| IMAP收信 | imapflow |
| SMTP发信 | nodemailer |
| AI接口 | openai SDK（兼容所有OpenAI-compatible API） |
| 数据存储 | JSON文件 |

## 快速启动

### Windows（双击启动）

```
双击 start.bat
```

脚本会自动完成：依赖检查安装 → 前端构建 → 启动服务 → 打开浏览器

### 手动启动

```bash
# 安装后端依赖
npm install

# 安装并构建前端
cd frontend
npm install
npm run build
cd ..

# 启动服务
npm start
```

访问 http://localhost:3000

## 目录结构

```
AutoMailReplySystem/
├── src/                    # 后端源码
│   ├── index.js            # Express 入口
│   ├── routes/             # API 路由
│   │   ├── config.js       # 配置读写
│   │   ├── control.js      # 启停控制
│   │   └── logs.js         # 日志查询
│   └── services/           # 核心服务
│       ├── configService.js  # 配置文件管理
│       ├── emailListener.js  # IMAP邮件监听与解析
│       ├── emailSender.js    # SMTP发送与重试
│       ├── aiService.js      # AI回复生成
│       ├── logsService.js    # 日志读写
│       └── taskManager.js    # 轮询任务管理
├── data/                   # 持久化数据
│   ├── config.json         # 配置文件
│   └── logs.json           # 回复日志
├── frontend/               # Vue 3 前端
│   └── src/views/          # 页面组件
│       ├── Dashboard.vue   # 运行状态
│       ├── EmailConfig.vue # 邮箱配置
│       ├── AIConfig.vue    # AI接口配置
│       ├── ReplyRules.vue  # 回复规则
│       ├── RunConfig.vue   # 运行参数
│       └── Logs.vue        # 回复日志
├── start.bat               # Windows一键启动
└── package.json
```

## 使用指南

### 1. 邮箱配置

1. 进入「邮箱配置」页面
2. 选择邮箱服务商预设（QQ/163/Gmail等）
3. 填写邮箱账号和授权码（非登录密码）
4. 点击「测试连接」验证配置
5. 保存配置

> QQ邮箱授权码获取：设置 → 账户 → POP3/IMAP/SMTP → 开启服务 → 生成授权码

### 2. AI接口配置

1. 进入「AI接口」页面
2. 填写 API Key 和接口地址
3. 选择模型（支持 GPT、Claude、通义、文心、DeepSeek 等）
4. 点击「测试接口」验证
5. 保存配置

### 3. 回复规则配置

1. 进入「回复规则」页面
2. 在「回复思路」中描述AI回复逻辑和业务口径
3. 在「注意事项」中列出禁止内容和特殊处理规则
4. 可创建多套模板，按需切换

### 4. 启动服务

在「运行状态」首页点击「启动服务」，服务即在后台运行。

## 支持的邮箱服务商

| 服务商 | IMAP | SMTP |
|--------|------|------|
| QQ邮箱 | imap.qq.com:993 | smtp.qq.com:465 |
| 163邮箱 | imap.163.com:993 | smtp.163.com:465 |
| 126邮箱 | imap.126.com:993 | smtp.126.com:465 |
| Gmail | imap.gmail.com:993 | smtp.gmail.com:465 |
| Outlook | outlook.office365.com:993 | smtp.office365.com:587 |
| 腾讯企业邮 | imap.exmail.qq.com:993 | smtp.exmail.qq.com:465 |
| 阿里企业邮 | imap.mxhichina.com:993 | smtp.mxhichina.com:465 |

## 部署说明

服务默认运行在 `3000` 端口，数据存储在 `data/` 目录下（JSON文件）。

如需后台常驻，推荐使用 PM2：

```bash
npm install -g pm2
pm2 start src/index.js --name auto-mail-reply
pm2 save
pm2 startup
```
