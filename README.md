<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Butler - AI 助手

一个专业的 AI 时间管理助手，提供智能日程安排、世界时钟、精准计时等功能。

在线访问: https://ai.studio/apps/drive/19aQaCWD82FLXxWGHyU0-m1L_vMRPL7Vf

---

## 🚀 快速开始

### 方式一：直接使用简化版（推荐给普通用户）

**无需安装任何软件！** 直接用浏览器打开 `simple.html` 文件即可使用。

1. 下载或克隆本仓库
2. 找到 `simple.html` 文件
3. 双击用浏览器打开
4. 输入你的 Gemini API Key（从 [这里获取](https://aistudio.google.com/app/apikey)）
5. 开始使用！

> ⚠️ **注意**：`simple.html` 是简化版，只提供基本的 AI 对话功能。如果你想要完整的功能（时间管理、日程安排、世界时钟等），请使用下面的"方式二"。

### 方式二：运行完整版开发应用（推荐给开发者）

完整版包含更多功能：世界时钟、精准计时器、智能日程表、生活方式跟踪等。

**系统要求:** Node.js (推荐 v18 或更高版本)

继续阅读下面的"本地运行"章节了解详细步骤。

---

## 本地运行

**系统要求:**  Node.js (推荐 v18 或更高版本)

### 步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置 API Key**
   
   复制示例配置文件：
   ```bash
   cp .env.local.example .env.local
   ```
   
   然后编辑 `.env.local` 文件，将 `your_api_key_here` 替换为你的 Gemini API Key
   
   > 💡 从这里获取 API Key: https://aistudio.google.com/app/apikey

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   服务器启动后，你会看到类似这样的输出：
   ```
   VITE v6.4.1  ready in 218 ms
   
   ➜  Local:   http://localhost:3000/
   ```

4. **在浏览器中访问**
   
   ⚠️ **重要**：请访问 **http://localhost:3000/** （不是 8080 端口，也不要在后面加 `/index.html`）
   
   在浏览器地址栏输入：`http://localhost:3000/` 或 `http://localhost:3000`

## 常见问题

### 为什么不能直接用浏览器打开 index.html？

这是一个 React 应用，需要通过开发服务器运行。请按照上面的步骤使用 `npm run dev` 启动应用。

### 访问 http://localhost:8080 或其他端口打不开？

正确的端口是 **3000**，不是 8080 或其他端口。请确保：
1. 使用 `npm run dev` 启动服务器
2. 在浏览器中访问 **http://localhost:3000/**（不要加 `/index.html`）

如果 3000 端口被占用，Vite 会自动使用其他端口，请查看终端输出的实际端口号。

### 如何构建生产版本？

```bash
npm run build
```

构建后的文件在 `dist` 目录中。
