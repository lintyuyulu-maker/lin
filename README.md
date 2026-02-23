<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Butler — AI 管家

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19aQaCWD82FLXxWGHyU0-m1L_vMRPL7Vf

---

## 快速启动 / Quick Start

### 1. 前提条件 / Prerequisites

- 安装 [Node.js](https://nodejs.org/)（建议 v18 或更高版本）
- 获取一个 [Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. 克隆项目 / Clone the Repository

```bash
git clone https://github.com/lintyuyulu-maker/lin.git
cd lin
```

### 3. 安装依赖 / Install Dependencies

```bash
npm install
```

### 4. 配置环境变量 / Set Up Environment

在项目根目录创建 `.env.local` 文件，写入你的 Gemini API Key：

```bash
# 首次设置时创建文件（注意：会覆盖已有内容）
echo "GEMINI_API_KEY=你的API密钥" > .env.local
```

> 将 `你的API密钥` 替换为你从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取的真实密钥。
> 如果 `.env.local` 已存在且包含其他配置，请手动编辑该文件添加 `GEMINI_API_KEY=你的API密钥` 这一行。

### 5. 启动应用 / Start the App

```bash
npm run dev
```

启动成功后，在浏览器中打开 **http://localhost:3000** 即可使用。

### 6. 其他命令 / Other Commands

```bash
# 构建生产版本 / Build for production
npm run build

# 预览生产版本 / Preview production build
npm run preview
```

---

## Claude Code

如需使用 Claude Code 进行 AI 辅助开发，请参阅 [CLAUDE_CODE_SETUP.md](CLAUDE_CODE_SETUP.md)。

For AI-assisted development with Claude Code, see [CLAUDE_CODE_SETUP.md](CLAUDE_CODE_SETUP.md).
