---
title: 创建VSCode聊天摘要管理插件
description: 与Copilot合作开发了一个用于管理AI对话历史摘要的VSCode扩展，支持元数据管理和搜索功能
workplace: /workspaces/my-last-chat
project: my-last-chat
type: coding
solved_lists:
  - 设计了聊天摘要的元数据格式
  - 实现了存储服务和文件解析
  - 创建了WebView用户界面
  - 集成了Copilot LM工具
---

# 项目概述

这次聊天的目标是创建一个VSCode插件，用于管理Agent对话历史摘要。

## 主要功能

1. **元数据管理** - 使用YAML frontmatter存储结构化的聊天元数据
2. **搜索功能** - 支持通过标题和元数据搜索
3. **Copilot集成** - 提供可供Copilot调用的工具

## 技术栈

- TypeScript
- VS Code Extension API
- WebviewView for UI
- gray-matter for YAML parsing

## 下一步

- 添加更多的筛选选项
- 支持导出功能
- 增加统计面板
