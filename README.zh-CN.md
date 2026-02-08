# My Last Chat

[English](README.md) | 简体中文

My Last Chat 是一个 VS Code 扩展，用于管理和搜索您的 AI 聊天历史摘要。它与 GitHub Copilot 深度集成，让您可以轻松保存、搜索和重用您的 AI 对话记录。

![My Last Chat Preview](https://raw.githubusercontent.com/isWittHere/my-last-chat/main/sample_image.png)

当您安装 My Last Chat 扩展时，您将获得：

- **My Last Chat 视图** - 在侧边栏中查看和管理所有聊天摘要
- **Copilot 工具集成** - 提供三个原生 LM 工具供 GitHub Copilot 调用
- **自动摘要生成** - 使用 `/compact` 命令自动总结对话内容

## 快速开始

### 创建您的第一个摘要

1. 在 Activity Bar 中点击 My Last Chat 图标
2. 点击 `+` 按钮创建新摘要
3. 填写摘要信息并保存

### 使用 Copilot 自动生成摘要

本插件提供了 [`compact.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/compact.prompt.md) 文件，它是一个可重用的 prompt 文件。在 Copilot Chat 的 Prompt 配置中添加它，就可以在 Copilot Chat 中使用 `/compact` 命令：

```
@workspace /compact
```

该命令将自动：
- 提取当前对话的技术细节和代码模式
- 生成符合规范的 YAML frontmatter 元数据
- 智能查重，更新已有摘要或创建新文件
- 自动保存到 `.myLastChat/` 目录

### 生成技术知识文档

使用 [`knowledge_maker.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/knowledge_maker.prompt.md) 为特定技术主题创建专注的知识文档：

```
@workspace /knowledge-gen
```

该命令将自动：
- 为讨论的特定技术主题生成专注的知识文档
- 记录技术决策、模式和解决方案
- 包含实现细节和最佳实践
- 自动保存到 `.myLastChat/` 目录，文件名以 `MLC_K_` 为前缀

## 主要功能

### 📝 摘要管理

所有聊天摘要以 Markdown 格式存储在 `.myLastChat` 文件夹中，每个文件包含：

- YAML frontmatter 元数据（标题、描述、项目信息等）
- Markdown 格式的聊天内容
- 标签和任务完成列表

### 💡 灵活的知识管理

`/compact` 不仅可用于总结对话，还可以用于灵活的项目知识管理。你可以：
- 在对话后使用 `/compact` 更新现有知识或创建新知识
- 随时将相关摘要插入当前对话，以提供项目知识或进展
- 构建一个可搜索、可复用的项目知识库

### 🔍 搜索和筛选

- **按标题搜索** - 快速找到相关摘要
- **元数据筛选** - 按项目、类型、范围筛选
- **收藏功能** - 标记重要的摘要
- **时间分组** - 按今天、昨天、上周、更早分组显示

### 🎨 灵活的视图选项

- **侧边栏视图** - 在侧边栏中快速浏览摘要
- **编辑器面板** - 在编辑器中打开完整的摘要列表

### 🤖 Copilot 工具集成

为 GitHub Copilot 提供三个拓展工具：

| 工具 | 功能 |
|------|------|
| `myLastChat_getLastChatsList` | 获取所有聊天摘要列表 |
| `myLastChat_searchByTitle` | 按标题关键词搜索摘要 |
| `myLastChat_searchByMeta` | 按元数据字段搜索摘要 |

**反馈级别**: 
- `TITLE_ONLY` - 仅返回标题
- `DESCRIPTION` - 返回标题和描述
- `META` - 返回所有元数据
- `ALL` - 返回完整内容

示例：
```
使用 MyLastChats 工具查找所有关于调试的摘要
```

### 🚀 快速插入到聊天

一键将摘要文件添加到 Copilot 对话中，让 AI 助手了解之前的对话上下文。

## 摘要文件格式

```markdown
---
title: 聊天标题（必填）
description: 聊天描述（必填）
workplace: /path/to/workspace（必填）
project: 项目名称
type: coding | debug | planning | spec
createdAt: 2026-01-25T10:00:00.000Z
updatedAt: 2026-01-25T10:00:00.000Z
favorite: false
tags: [tag1, tag2]
solved_lists:
  - 完成的任务1
  - 完成的任务2
---

# 聊天摘要标题

在此处记录聊天内容...
```

## 配套 Prompt 文件

所有 prompt 文件都位于 [`prompts/`](https://github.com/isWittHere/my-last-chat/tree/main/prompts) 文件夹中。

### 📄 [`compact.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/compact.prompt.md) - 对话摘要生成器

这是一个配套的 prompt 文件，可以在 Copilot Chat 中使用：

```
@workspace /compact
```

功能：
- ✅ 自动提取技术细节和代码模式
- ✅ 生成符合元数据格式的 YAML frontmatter
- ✅ 智能查重，更新已有摘要或创建新文件
- ✅ 自动保存到 `.myLastChat/` 目录

### 📄 [`knowledge_maker.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/knowledge_maker.prompt.md) - 技术主题知识生成器

为对话中讨论的特定技术主题、功能或想法生成专注的知识文档：

```
@workspace /knowledge-gen
```

功能：
- ✅ 为特定技术主题生成专注的知识文档
- ✅ 记录技术决策、模式和解决方案
- ✅ 包含实现细节和最佳实践
- ✅ 智能查重，更新已有文档或创建新文件
- ✅ 自动保存到 `.myLastChat/` 目录，文件名以 `MLC_K_` 为前缀

## 设置选项

打开 VS Code 设置 (Ctrl+,) 并搜索 "My Last Chat"：

- **存储位置** - 选择工作区或全局存储
- **全局存储路径** - 自定义全局存储目录
- **自动隐藏控件** - 滚动时自动隐藏搜索栏

## 隐私和数据

所有聊天摘要都存储在本地文件系统中，扩展不会将您的摘要内容发送到任何远程服务器。

## 反馈和问题

如果您遇到任何问题或有功能建议，请在 [GitHub Issues](https://github.com/isWittHere/my-last-chat/issues) 中提交。

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件