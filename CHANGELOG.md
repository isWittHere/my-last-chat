# Change Log

## Feedback and Issues
[MyLastChat](https://github.com/isWittHere/my-last-chat) is a open-source project.
If you encounter any problems or have feature suggestions, welcome to submit them in [GitHub Issues](https://github.com/isWittHere/my-last-chat/issues).

## [0.2.0] - 2026-04-05

### ✨ New Features

- **Multi-workspace auto-discovery**: Automatically scans sub-folders containing `.git` under the current workspace and reads their `.myLastChat` directories, enabling cross-repository chat history browsing in monorepo environments
- **Workspace filter tabs**: The workspace filter is now a dedicated tab row — single-click to toggle a workspace on/off, double-click to exclusively show only that workspace
- **Type filter tabs**: The type/scope filter dropdowns are replaced with compact tab rows for faster switching
- **Manage Workspaces command**: New command (toolbar button) to show or hide individual workspace tabs and assign custom codicon icons to each workspace
- **Global scope control**: The Global tab can be independently shown or hidden via the Manage Workspaces command

### 🎨 UI/UX Improvements

- Controls row moved to the top for quicker access to sort, favorites toggle, and view-mode switch
- Tab rows use a subtle dashed/solid border style that matches the VS Code theme
- Each workspace tab displays a customizable codicon icon

## [0.1.3] - 2026-01-31

### 🐛 Bug Fixes
- Fixed compact view button layout issue - buttons no longer occupy fixed width when hidden
- Fixed folder tooltip not updating when toggling expand/collapse state

### 🎨 UI/UX Improvements
- Item titles now show full content and timestamp on hover in both detailed and compact views
- Folder titles show preview of contained items when collapsed (up to 3 items)
- Improved tooltip display with support for multi-line content
- Better space utilization in compact view - title now expands to fill available width

### ✨ Enhancements
- Changed button visibility strategy from opacity to display for better layout
- Enhanced custom tooltip system to support line breaks and longer content
- Added localized strings for folder preview features

## [0.1.2] - 2025-01-31

### 🐛 Bug Fixes
- Editor tab button click now correctly creates MyLastChat in editor view
- Now detects md files in first-level subfolders
- Editor view now auto-reloads and restores properly

### 🎨 UI/UX Improvements
- Improved colored icon visibility in light themes
- Enhanced font size and weight for better display on 1080P screens
- Editor view list now auto-refreshes
- Improved list hover effects

### ✨ New Features
- Subfolder grouping functionality
- Compact view mode
- Language model tools update
- Added Knowledge type md document support

## [0.1.1] - 2025-01-30

### Initial Features
- Save and manage Copilot chat summaries
- Sidebar tree view and editor panel view
- Support for workspace and global storage
- Markdown file support with YAML frontmatter
- Language model tools for MCP integration
- Multi-language support (English & Chinese)

## [0.1.0] - 2025-01-29

### Initial Release
- First public release
