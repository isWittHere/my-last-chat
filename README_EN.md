# My Last Chat

English | [简体中文](README.md)

Agent Conversation Summary Manager - Manage and search your AI chat history summaries

## Features

- 📝 **Summary Management** - Store Markdown-formatted chat summaries in `.myLastChat` folder
- 🔍 **Search & Filter** - Search by title or metadata, with favorites and time grouping
- 🎨 **Dual View** - Sidebar view and editor panel
- 🤖 **Copilot Tools** - Three native tools for Copilot integration
- 🚀 **Quick Insert into Copilot Chat** - Attach summary files to Copilot conversation

## Companion Prompt

### 📄 `compact.prompt.md` - Conversation Summary Generator

Use `/compact` command in Copilot Chat to automatically summarize current conversation into a compliant summary file:

- Auto-extract technical details and code patterns
- Generate YAML frontmatter with proper metadata format
- Smart deduplication: update existing summaries or create new files
- Auto-save to `.myLastChat/` directory

## Metadata Format

```markdown
---
title: Chat title (required)
description: Chat description (required)
workplace: /path/to/workspace (required)
project: Project name
type: coding | debug | planning | spec
solved_lists:
  - Completed task 1
  - Completed task 2
---
```

## Copilot Tools

| Tool | Function |
|------|----------|
| `get_lastchats_list` | Get all chat summaries |
| `search_by_title` | Search by title |
| `search_by_meta` | Search by metadata |

**Feedback Level**: `TITLE_ONLY` / `DESCRIPTION` / `META` / `ALL`

## License

MIT
