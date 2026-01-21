# My Last Chat

Agent对话历史摘要管理器 - 一个用于管理和搜索AI聊天记录摘要的VS Code扩展。

## 功能特性

### 📝 聊天摘要管理
- 在 `.myLastChat` 文件夹中存储和管理Markdown格式的聊天摘要
- 支持工作区内存储或全局存储（跨工作区管理）
- 每个摘要文件包含结构化的元数据

### 🔍 搜索和筛选
- 通过标题搜索聊天摘要
- 通过元数据（项目、类型等）筛选
- 支持多关键词搜索

### 🤖 Copilot 工具集成
提供三个可供Copilot调用的原生工具：
1. **get_lastchats_list** - 获取所有聊天摘要列表
2. **search_by_title** - 通过标题关键词搜索
3. **search_by_meta** - 通过元数据关键词搜索

### 🎨 用户界面
- 侧边栏WebView面板，可放置在VS Code任意位置
- 列表显示标题、项目和描述
- 点击直接在编辑器中打开

## 元数据格式

聊天摘要使用YAML frontmatter存储元数据：

```markdown
---
title: 聊天标题（必填）
description: 聊天描述（必填）
workplace: /path/to/workspace（必填）
project: 项目名称
type: coding | debug | planning | spec
solved_lists:
  - 完成的任务1
  - 完成的任务2
---

# 正文内容

在这里自由编写聊天记录...
```

### 元数据字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 聊天摘要的标题 |
| `description` | ✅ | 聊天的简短描述 |
| `workplace` | ✅ | 适用的工作区路径 |
| `project` | ❌ | 项目名称 |
| `type` | ❌ | 聊天类型：`coding`、`debug`、`planning`、`spec` |
| `solved_lists` | ❌ | 本次聊天完成的任务列表 |

## Feedback Level

工具返回信息的详细程度：

| Level | 返回内容 |
|-------|----------|
| `TITLE_ONLY` | 仅返回标题 |
| `DESCRIPTION` | 返回标题和描述 |
| `META` | 返回所有元数据 |
| `ALL` | 返回全文（元数据+正文） |

## 设置

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `myLastChat.storageLocation` | `workspace` | 存储位置：`workspace`（工作区）或 `global`（全局） |
| `myLastChat.globalStoragePath` | `` | 全局存储路径（当选择global时使用） |

## 命令

- `My Last Chat: 刷新聊天列表` - 刷新侧边栏中的聊天列表
- `My Last Chat: 新建聊天摘要` - 创建一个新的聊天摘要文件
- `My Last Chat: 打开设置` - 打开扩展设置

## 开发

### 安装依赖
```bash
npm install
```

### 编译
```bash
npm run compile
```

### 监听模式
```bash
npm run watch
```

### 调试
按 `F5` 启动扩展开发主机进行调试。

## 许可证

MIT