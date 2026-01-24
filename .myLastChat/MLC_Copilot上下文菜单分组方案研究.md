---
title: Copilot上下文菜单分组方案研究
description: 研究在 Copilot 的"添加上下文"菜单中为 My Last Chat 插件安排独立分组的可行性
workplace: e:\Dev\my-last-chat
project: my-last-chat
type: planning
solved_lists:
  - 分析了 languageModelTools 贡献点的限制
  - 发现并评估了 chatContext Proposed API 方案
---

# Copilot上下文菜单分组方案研究

## 1. Previous Conversation

用户询问了是否可能在 Copilot 的"添加上下文"菜单中单独为 My Last Chat 插件安排一个分组类别。这个问题涉及 VS Code 扩展 API 的能力边界和可能的实现方案。

我通过以下步骤进行了研究：
1. 初步分析 `languageModelTools` 贡献点的现有能力
2. 研究 VS Code 扩展菜单贡献点的可用性
3. 发现并分析了 `chatContext` Proposed API 这一新方案
4. 对比了不同解决方案的优缺点

## 2. Current Work

用户要求按照 `compact.prompt.md` 的规范创建对话总结。当前任务是：
- 生成详细的对话总结
- 记录 VS Code 扩展 API 研究的关键发现
- 为后续实现工作提供技术基础
- 保存到 `.myLastChat/` 目录以供查阅

## 3. Key Technical Concepts

- **languageModelTools**: VS Code 用于注册 MCP（Model Context Protocol）工具的贡献点
- **Copilot 上下文菜单**: Copilot 聊天输入框中的"添加上下文"（📎）菜单
- **chatContext Proposed API**: 允许扩展注册自定义上下文提供者的提议 API
- **Proposed API**: VS Code 的试验性 API，可能会在未来版本中变化或移除
- **enabledApiProposals**: `package.json` 中用于启用试验性 API 的配置项
- **MCP (Model Context Protocol)**: Anthropic 的模型上下文协议，VS Code 用其来集成 AI 工具

## 4. Relevant Files and Code

### package.json
  - 当前包含 3 个 `languageModelTools` 的注册：
    - `myLastChat_getLastChatsList`
    - `myLastChat_searchByTitle`
    - `myLastChat_searchByMeta`
  - 使用 `myLastChat_` 前缀帮助用户识别工具来源
  - **无法在此实现上下文菜单分组功能**

### src/extension.ts
  - 主扩展入口文件
  - 如果实现 `chatContext` Proposed API，需要在此文件中添加 `vscode.chat.registerChatContextProvider()` 调用

### .myLastChat/ 目录
  - 存储聊天摘要的 Markdown 文件
  - 若实现新方案，需从此目录读取摘要文件作为上下文提供者的数据源

## 5. Problem Solving

### 问题：Copilot "添加上下文"菜单中无法创建自定义分组

**分析过程**：
1. 初步调查 `languageModelTools` API → 发现只支持基本属性（name、displayName、description、icon、tags）
2. 查询 `contributes.menus` 贡献点 → 发现不包含 `chat/addContext` 菜单位置
3. 搜索 VS Code 官方文档 → 找到了 `chatContextProvider` Proposed API

**关键发现**：
- ✅ **可行方案存在**: `chatContext` Proposed API 允许扩展在"添加上下文"菜单中注册自己的项目分组
- ⚠️ **使用限制**: 这是 Proposed API，需在 `package.json` 中启用，且无法发布到官方 Marketplace
- 📝 **目前权衡**: 是否值得使用 Proposed API 取决于分布方式需求

## 6. Pending Tasks and Next Steps

### 待决议事项
1. **确认需求优先级**: 是否必须在 Copilot 的"添加上下文"菜单中创建分组（而不是依赖 MCP Tools）
2. **评估发布约束**: 使用 Proposed API 将无法在官方 Marketplace 中发布，是否可接受
3. **后续实现计划**: 如用户确认需求，可按以下步骤实现：

   **Step 1**: 在 `package.json` 中添加配置
   ```json
   {
     "enabledApiProposals": ["chatContextProvider"]
   }
   ```

   **Step 2**: 在 `package.json` 的 `contributes` 中注册上下文提供者
   ```json
   {
     "contributes": {
       "chatContext": [
         {
           "id": "myLastChat",
           "displayName": "My Last Chat 摘要",
           "icon": "$(comment-discussion)"
         }
       ]
     }
   }
   ```

   **Step 3**: 在 `src/extension.ts` 中实现提供者逻辑
   ```typescript
   vscode.chat.registerChatContextProvider(
     undefined,
     'myLastChat',
     {
       provideChatContext: async (options, token) => {
         // 读取 .myLastChat 文件夹下的摘要文件列表
         // 返回 ChatContextItem[] 格式的数据
       },
       resolveChatContext: async (context, token) => {
         // 返回选中项的完整内容
       }
     }
   );
   ```

### 后续行动
- 等待用户反馈是否确实需要实现此功能
- 如果需要实现，准备详细的集成方案
- 如果不需要，可继续改进现有 MCP Tools 的用户体验（如优化 tags、displayName 等）
