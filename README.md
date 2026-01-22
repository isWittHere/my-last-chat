# My Last Chat

Agent对话历史摘要管理器 - 一个用于管理和搜索AI聊天记录摘要的VS Code扩展。

## 功能特性

### 📝 聊天摘要管理
- 在 `.myLastChat` 文件夹中存储和管理Markdown格式的聊天摘要
- 支持工作区内存储或全局存储（跨工作区管理）
- 每个摘要文件包含结构化的元数据

### 🔍 搜索和筛选
- 通过标题搜索聊天摘要
- 通过元数据（项目、类型、标签等）筛选
- 支持多关键词搜索
- 支持收藏夹筛选
- 多种排序方式（最近更新、创建时间、标题）

### 🎨 用户界面
- **侧边栏视图** - WebView面板，可放置在VS Code任意位置
- **编辑器面板** - 可在编辑器区域打开完整列表
- **时间分组** - 按今天/昨天/近一周/更早分组显示
- **类型图标** - 不同类型显示对应图标（coding/debug/planning/spec）
- **实时刷新** - 时间显示每分钟自动更新
- **收藏功能** - 标记重要的聊天摘要
- 点击直接在编辑器中打开

### 🤖 Copilot 工具集成
提供三个可供Copilot调用的原生工具：

| 工具名称 | 功能 | 参数 |
|----------|------|------|
| `get_lastchats_list` | 获取所有聊天摘要列表 | `feedbackLevel`, `scope` |
| `search_by_title` | 通过标题关键词搜索 | `keywords`, `feedbackLevel`, `scope` |
| `search_by_meta` | 通过元数据关键词搜索 | `keywords`, `feedbackLevel`, `scope` |

**scope 参数说明：**
- `workspace` - 仅搜索当前工作区
- `global` - 仅搜索全局存储
- `all` - 搜索所有位置（默认）

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

| 命令 | 说明 |
|------|------|
| `My Last Chat: 刷新聊天列表` | 刷新侧边栏中的聊天列表 |
| `My Last Chat: 新建聊天摘要` | 创建一个新的聊天摘要文件 |
| `My Last Chat: 打开设置` | 打开扩展设置 |
| `My Last Chat: 在编辑器中打开` | 在编辑器面板中打开聊天列表 |

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

## 更新日志

### v0.0.1
- 初始版本发布
- 聊天摘要管理（工作区/全局存储）
- 搜索和筛选功能
- Copilot 工具集成（3个工具）
- 侧边栏和编辑器面板双视图
- 时间分组显示
- 类型图标支持
- 收藏功能
- 实时时间刷新

## 许可证

MIT