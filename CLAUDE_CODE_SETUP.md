# Claude Code 安装指南

Claude Code 是 Anthropic 推出的 AI 命令行编程工具，可用于辅助本项目的开发。

## 系统要求

- **macOS** 13.0+、**Windows** 10 1809+ / Windows 11、**Linux** (Ubuntu 20.04+, Debian 10+)
- 至少 4GB 内存
- 需要联网

## 安装方法

### 方法一：推荐安装方式（原生安装）

**macOS / Linux：**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows（PowerShell）：**

```powershell
irm https://claude.ai/install.ps1 | iex
```

### 方法二：Homebrew（macOS / Linux）

```bash
brew install --cask claude-code
```

### 方法三：npm（需要 Node.js 18+）

```bash
npm install -g @anthropic-ai/claude-code
```

## 验证安装

```bash
claude --version
```

## 启动使用

在项目根目录下运行：

```bash
# 进入你克隆的项目目录（目录名以实际为准）
cd lin
claude
```

首次启动会引导你通过 Claude.ai 账户进行登录认证。登录后即可在终端中与 Claude 对话，让它帮你编写、修改和调试本项目的代码。

### 在本项目中使用示例

```bash
# 进入项目目录
cd lin

# 启动 Claude Code
claude

# 之后你可以在交互模式中输入指令，例如：
# "帮我看看 App.tsx 的代码结构"
# "帮我添加一个新功能"
# "帮我修复某个 bug"
```

## 常用命令

```bash
# 启动交互模式
claude

# 查看版本
claude --version

# 运行诊断
claude doctor
```

## 参考链接

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code GitHub 仓库](https://github.com/anthropics/claude-code)
