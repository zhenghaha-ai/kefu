用中文回答我
每次都用审视的目光，仔细看我输入的潜在问题，你要指出我的问题，并给出明显在我思考框架之外的建议
make sure your implementation will not break existing features and there will be tested
如果你觉得我说的太离谱了，你就骂回来，帮我瞬间清醒
每次完成任务后，只有在实际修改了文件的情况下才询问用户是否需要 commit 和推送；如果没有修改任何文件（如纯查询、解答问题），则不要询问。创建新项目后务必帮用户完成首次 git init + commit。
如果用户提供的信息不够详细和充分，一定要多反问，让用户补充必要的信息后再动手，不要自己脑补需求。
项目所有任务完成后，创建清晰的 README.md（项目简介、技术栈、启动方式、目录结构、部署说明）。有重大功能改进时及时更新 README，确保文档与代码同步。
项目构建完成后非必要不要频繁重启 dev server，只在配置变更等必要时才重启。每个新项目根据用户系统创建智能启动脚本，macOS 必须使用 start.command（禁止 .sh，.command 才能双击运行），Windows 使用 start.bat。脚本需处理依赖检查、端口占用检测（占用时提供选项：杀掉占用进程/换端口/取消）、自动打开浏览器。
## 版本控制号策略（Cache Busting）

### 核心原则
每次 push 之前，必须确保版本号已更新，保证用户浏览器能及时获取最新资源。**禁止在前端页面上显示版本号文本**，除非用户明确要求。

### 版本号位置与格式
1. **`index.html` 静态引用**：所有 CSS/JS 引用通过 `?v=x.x.x` 查询参数做 cache busting（如 `<script src="app.js?v=1.2.0">`）
2. **Vite 项目**：在 `vite.config.js` 中配置 `build.rollupOptions.output` 使用 hash 文件名（如 `[name]-[hash].js`），同时在 `index.html` 的非构建资源上保留 `?v=x.x.x`
3. **`package.json`**：`version` 字段与 `index.html` 的 `?v=` 保持同步

### 版本号递增规则
- **bugfix**（修复 bug、样式微调）：`+0.0.1`（如 1.2.0 → 1.2.1）
- **功能**（新增功能、功能增强）：`+0.1.0`（如 1.2.1 → 1.3.0）
- **大版本**（架构重构、破坏性变更）：`+1.0.0`（如 1.3.0 → 2.0.0）

### 执行流程（每次 commit/push 前）
1. **检查**：扫描 `index.html` 中所有资源引用，确认是否已有 `?v=` 参数
2. **补全**：如果没有版本号，添加 `?v=0.1.0` 作为初始版本
3. **递增**：如果已有版本号且本次有实质代码改动，按上述规则递增
4. **同步**：确保 `package.json` 的 `version` 与 `index.html` 的 `?v=` 一致
5. **验证**：commit message 中注明版本号变更（如 `v1.2.0 → v1.2.1`）

---

## Obsidian 笔记规则

- 笔记库：`E:\Obsidian\ehhh`（vault: obsidian）
- 触发词：「OB」「Obsidian」「笔记」「写到笔记里」「日记」
- 格式：Obsidian Markdown + YAML frontmatter（tags、date）
- 位置：用户指定文件夹就放对应文件夹，没指定放根目录
- **必须使用 Obsidian CLI**（`obsidian` 命令）操作笔记，禁止直接读写文件
- 所有命令末尾追加 `2>&1 | grep -v "Loading\|out of date"` 过滤噪音
- 常用命令（日常够用，无需加载 skill）：
  - `obsidian create path="folder/note.md" content="..." open` — 创建并打开
  - `obsidian read path="folder/note.md"` — 读取内容
  - `obsidian append path="folder/note.md" content="..."` — 尾部追加
  - `obsidian open path="folder/note.md"` — 打开笔记
  - `obsidian search query="关键词" path="folder"` — 搜索
  - `obsidian daily:append content="..."` — 追加到日记
- 进阶操作（属性管理、插件、同步、历史、Bases 等）加载 `obsidian-cli` skill

---

## 新建前端项目默认规范

当创建新的前端项目或组件时，遵循以下规范。完整规范详见 `~/.claude/design-system.md`。

### Vue 编码要点
- SFC 顺序：`<script setup>` → `<template>` → `<style scoped>`
- 响应式统一用 `ref`，禁止 `reactive`
- Props 用 `defineProps` 对象语法，Events 用 `defineEmits` 数组语法
- 事件处理函数用 `handle` 前缀（handleClick、handleSubmit）
- 无全局状态管理，本地状态 + Props/Events 通信
- 复杂静态数据抽到 `src/data/` 目录

### 需要更多细节？
读取 `~/.claude/design-system.md` 获取完整规范，包含：颜色系统、组件模式、动画系统、SVG 规范、数据结构模式等。