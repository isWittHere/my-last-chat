# My Last Chat

[English](README_EN.md) | 简体中文

Agent对话历史摘要管理器 - 管理和搜索您的AI聊天记录摘要

## 功能特性

- 📝 **摘要管理** - 在 `.myLastChat` 文件夹中存储 Markdown 格式的聊天摘要
- 🔍 **搜索筛选** - 按标题、元数据搜索，支持收藏和时间分组
- 🎨 **双视图** - 侧边栏视图和编辑器面板
- 🤖 **Copilot 工具** - 提供三个原生工具供 Copilot 调用
- 🚀 **快速插入到 Copilot 聊天中** - 快速将摘要文件附加到 Copilot 对话中

## 配套 Prompt

### 📄 `compact.prompt.md` - 对话摘要生成器

在 Copilot Chat 中使用 `/compact` 命令，自动将当前对话总结为符合规范的摘要文件：

- 自动提取技术细节和代码模式
- 生成符合元数据格式的 YAML frontmatter
- 智能查重，更新已有摘要或创建新文件
- 自动保存到 `.myLastChat/` 目录

## 元数据格式

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
```

## Copilot 工具

| 工具 | 功能 |
|------|------|
| `get_lastchats_list` | 获取所有聊天摘要 |
| `search_by_title` | 按标题搜索 |
| `search_by_meta` | 按元数据搜索 |

**Feedback Level**: `TITLE_ONLY` / `DESCRIPTION` / `META` / `ALL`

## 许可证

MIT