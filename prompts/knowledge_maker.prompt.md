---
name: "knowledge-gen"
description: "Generate technical topic knowledge documentation based on conversation history about specific features, technologies, or ideas."
---
Your task is to generate focused knowledge documentation for a **specific technical topic, feature, or idea** discussed in the conversation. This is NOT a comprehensive project documentation, but rather a knowledge record of a particular technical discussion within the project context.

This documentation should be created based on:
1. **Primary Source**: Previous conversation history with insights, technical decisions, patterns, and solutions discussed about the specific topic
2. **Supplementary Source** (when necessary): Analysis of the relevant code or configuration for verification or additional details

This documentation should be thorough, actionable, and serve as a knowledge reference for this specific technical topic.

Your technical topic knowledge documentation should include:
1. **主题概述 (Topic Overview)**: What is this technical topic/feature, what problem does it solve, and why was it discussed
2. **背景与上下文 (Background & Context)**: Project context, related systems/components, why this topic is relevant
3. **技术方案 (Technical Solution)**: The specific technical approach, architecture choices, and implementation strategy discussed
4. **关键决策与理由 (Key Decisions & Rationale)**: Technical decisions made, trade-offs considered, and reasons for choices
5. **实现要点 (Implementation Details)**: Specific implementation approach, code snippets, configuration points, and key steps
6. **最佳实践与注意事项 (Best Practices & Considerations)**: Usage recommendations, common pitfalls, performance considerations, and gotchas
7. **相关资源 (Related Resources)**: Related code locations, dependencies, documentation links, and reference materials
8. **待办与改进 (TODOs & Improvements)**: Incomplete items, known issues, and future optimization opportunities

## Documentation Focus

**IMPORTANT**: This tool generates documentation for a **single technical topic** discussed in the conversation, such as:
- A specific feature implementation (e.g., authentication mechanism, caching strategy)
- A technical decision or architecture choice (e.g., state management approach, API design)
- A problem-solving discussion (e.g., performance optimization, bug fix approach)
- A technology integration (e.g., third-party service integration, database setup)

The documentation should be **focused and specific** to the discussed topic, not a comprehensive project overview.

## Output Format Requirements

Save the documentation as a Markdown file with the following specifications:

### YAML Frontmatter (Required)
```yaml
---
title: [Required] Concise topic title (e.g., "认证机制实现", "状态管理方案")
description: [Required] Brief description of the technical topic (40 tokens or less)
workplace: [Required] Current workspace path (${workspaceFolder})
project: [Optional] Project name if applicable
type: knowledge
tags:
    - knowledge
    - [topic-specific tags]
---
```

### File Storage and Naming:

**Step 1: Analyze and Query Existing Documentation**
⚠️ BEFORE creating new file:
- Determine the specific technical topic from conversation history
- Use `#tool:my-last-chat.my-last-chat/lastchats` for quick query
- Use `#tool:my-last-chat.my-last-chat/searchchat` (keywords: topic keywords, "知识", feedbackLevel: "META", scope: "all")
- If existing doc for same topic found → UPDATE that file
- If no related doc found → CREATE new file

**Step 2: File Location and Naming**
- **Location**: `.myLastChat/` in workspace root (NOT in z_md)
- **Naming Format**: `MLC_K_[TechTopic].md`
  - Use clear, concise topic name in Chinese or English
  - Example: `MLC_K_认证机制.md`
  - Example: `MLC_K_状态管理方案.md`
  - Example: `MLC_K_Redis缓存集成.md`
- **No user consent needed** - create/update directly

**Step 3: File Structure**
```markdown
---
[YAML frontmatter as above]
---

# [Topic Title]

## 1. 主题概述 (Topic Overview)
- **主题**: [What is this technical topic/feature]
- **目标**: [What problem does it solve]
- **讨论背景**: [Why was this discussed, what triggered the conversation]

## 2. 背景与上下文 (Background & Context)
- **项目上下文**: [Project context, where this fits in the project]
- **相关组件/系统**: [Related components, modules, or systems]
- **需求或问题**: [The need or problem that led to this discussion]

## 3. 技术方案 (Technical Solution)
- **方案概述**: [Overall approach and strategy]
- **技术选型**: [Technologies, libraries, frameworks chosen]
- **架构设计**: [Architecture or design approach if applicable]

## 4. 关键决策与理由 (Key Decisions & Rationale)
- **决策点**: [Key technical decisions made]
- **权衡考虑**: [Trade-offs considered]
- **选择原因**: [Why these choices were made]

## 5. 实现要点 (Implementation Details)
- **实现步骤**: [Key implementation steps]
- **代码示例**: [Code snippets from conversation]
- **配置要点**: [Configuration details]
- **关键代码位置**: [File paths if discussed]

## 6. 最佳实践与注意事项 (Best Practices & Considerations)
- **使用建议**: [How to use this properly]
- **常见陷阱**: [Common pitfalls to avoid]
- **性能考虑**: [Performance considerations]
- **安全注意**: [Security considerations if applicable]

## 7. 相关资源 (Related Resources)
- **代码位置**: [Relevant file paths and line numbers]
- **依赖项**: [Dependencies and packages]
- **参考文档**: [Documentation links, articles, references]

## 8. 待办与改进 (TODOs & Improvements)
- **待完成**: [Incomplete items or TODOs]
- **已知问题**: [Known issues or limitations]
- **优化方向**: [Future optimization opportunities]
```

### Key Rules:
1. ⚠️ Always determine the specific technical topic from conversation history
2. ⚠️ Always query existing documentation using `#tool:my-last-chat.my-last-chat/searchchat` and `#tool:my-last-chat.my-last-chat/lastchats`
3. ⚠️ Update existing file if found; create new only if none exists
4. ⚠️ Location: `${workspaceFolder}/.myLastChat/`
5. ⚠️ Filename: `MLC_K_[TechTopic].md` with clear, concise topic name
6. Base content primarily on conversation history, supplement with code analysis only when necessary
7. Focus on the specific topic discussed, not comprehensive project documentation
8. Include specific file paths and code examples mentioned in the conversation
9. Use clear Chinese for section headers as shown in the structure
10. When updating: preserve previous content, mark new additions with timestamps
11. After save: inform user if CREATED or UPDATED, with file path

Output the focused technical topic knowledge documentation following the structure above, then proceed to save it as a markdown file following the specifications.