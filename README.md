# My Last Chat

English | [简体中文](README.zh-CN.md)

My Last Chat is a VS Code extension for managing and searching your AI chat history summaries. It integrates deeply with GitHub Copilot, making it easy to save, search, and reuse your AI conversation records.

![My Last Chat Preview](https://raw.githubusercontent.com/isWittHere/my-last-chat/main/sample_image.png)

When you install the My Last Chat extension, you get:

- **My Last Chat View** - View and manage all chat summaries in the sidebar
- **Copilot Tool Integration** - Three native LM tools for GitHub Copilot
- **Auto Summary Generation** - Use `/compact` command to automatically summarize conversations

## Getting Started

### Create Your First Summary

1. Click the My Last Chat icon in the Activity Bar
2. Click the `+` button to create a new summary
3. Fill in the summary information and save

### Auto-Generate Summaries with Copilot

This extension provides a [`compact.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/compact.prompt.md) file, which is a reusable prompt file. Add it to Copilot Chat's Prompt configuration, and you can use the `/compact` command in Copilot Chat:

```
@workspace /compact
```

This command will automatically:
- Extract technical details and code patterns from the current conversation
- Generate YAML frontmatter with proper metadata format
- Smart deduplication: update existing summaries or create new files
- Auto-save to `.myLastChat/` directory

### Generate Technical Knowledge Documentation

Use [`knowledge_maker.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/knowledge_maker.prompt.md) to create focused knowledge documentation for specific technical topics:

```
@workspace /knowledge-gen
```

This command will automatically:
- Generate focused knowledge docs for specific technical topics discussed
- Document technical decisions, patterns, and solutions
- Include implementation details and best practices
- Auto-save to `.myLastChat/` directory with `MLC_K_` prefix

## Key Features

### 📝 Summary Management

All chat summaries are stored as Markdown files in the `.myLastChat` folder, each containing:

- YAML frontmatter metadata (title, description, project info, etc.)
- Markdown-formatted chat content
- Tags and completed task lists

### 💡 Flexible Knowledge Management

`/compact` is not just for summarizing conversations, but also for flexible project knowledge management. You can:
- Use `/compact` after conversations to update existing knowledge or create new knowledge
- Insert relevant summaries into current conversations anytime to provide project knowledge or progress
- Build a searchable, reusable project knowledge base

### 🏗️ Multi-Workspace Support

My Last Chat automatically discovers sub-workspaces inside your current workspace:

- Scans all sub-folders containing a `.git` directory
- Reads each sub-workspace's `.myLastChat` folder alongside your main workspace
- Perfect for **monorepo** setups — browse chat history across all projects in one place

### 🔍 Search and Filtering

- **Search by title** - Quickly find relevant summaries
- **Workspace filter tabs** - One tab per workspace; single-click to toggle, **double-click to exclusively show that workspace**
- **Type filter tabs** - Filter by type (Coding, Debug, Planning, Spec, Knowledge, Note) with a single click
- **Favorites** - Mark important summaries
- **Time grouping** - Group by Today, Yesterday, Last Week, Earlier

### 🎨 Flexible View Options

- **Sidebar View** - Quick browse summaries in the sidebar
- **Editor Panel** - Open the full summary list in the editor
- **Manage Workspaces** - Show/hide workspace tabs and assign custom icons via the toolbar button

### 🤖 Copilot Tool Integration

Provides three extension tools for GitHub Copilot:

| Tool  | Function |
|------|----------|
| `myLastChat_getLastChatsList` | Get all chat summary lists |
| `myLastChat_searchByTitle` | Search summaries by title keywords |
| `myLastChat_searchByMeta` | Search summaries by metadata fields |

**Feedback Levels**: 
- `TITLE_ONLY` - Returns title only
- `DESCRIPTION` - Returns title and description
- `META` - Returns all metadata
- `ALL` - Returns full content

Example:
```
Find all debugging summaries using MyLastChats tools
```

### 🚀 Quick Insert to Chat

One-click to add summary files to Copilot conversations, helping the AI assistant understand previous conversation context.

## Summary File Format

```markdown
---
title: Chat title (required)
description: Chat description (required)
workplace: /path/to/workspace (required)
project: Project name
type: coding | debug | planning | spec
createdAt: 2026-01-25T10:00:00.000Z
updatedAt: 2026-01-25T10:00:00.000Z
favorite: false
tags: [tag1, tag2]
solved_lists:
  - Completed task 1
  - Completed task 2
---

# Chat Summary Title

Record chat content here...
```

## Companion Prompt Files

All prompt files are located in the [`prompts/`](https://github.com/isWittHere/my-last-chat/tree/main/prompts) folder.

### 📄 [`compact.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/compact.prompt.md) - Conversation Summary Generator

This is a companion prompt file that can be used in Copilot Chat:

```
@workspace /compact
```

Features:
- ✅ Auto-extract technical details and code patterns
- ✅ Generate YAML frontmatter with proper metadata format
- ✅ Smart deduplication: update existing summaries or create new files
- ✅ Auto-save to `.myLastChat/` directory

### 📄 [`knowledge_maker.prompt.md`](https://github.com/isWittHere/my-last-chat/blob/main/prompts/knowledge_maker.prompt.md) - Technical Topic Knowledge Generator

Generate focused knowledge documentation for specific technical topics, features, or ideas discussed in the conversation:

```
@workspace /knowledge-gen
```

Features:
- ✅ Generate focused knowledge docs for specific technical topics
- ✅ Document technical decisions, patterns, and solutions
- ✅ Include implementation details and best practices
- ✅ Smart deduplication: update existing docs or create new files
- ✅ Auto-save to `.myLastChat/` directory with `MLC_K_` prefix

## Configuration Options

Open VS Code Settings (Ctrl+,) and search for "My Last Chat":

- **Storage Location** - Choose workspace or global storage
- **Global Storage Path** - Customize global storage directory
- **Auto Hide Controls** - Automatically hide search bar when scrolling
- **Hidden Workspaces** - List of workspace paths hidden from the filter tabs
- **Workspace Icons** - Map workspace paths to custom codicon icon names

## Privacy and Data

All chat summaries are stored in the local file system. The extension does not send your summary content to any remote servers.

## Feedback and Issues

If you encounter any problems or have feature suggestions, please submit them in [GitHub Issues](https://github.com/isWittHere/my-last-chat/issues).

## License

MIT License - See [LICENSE](LICENSE) file for details