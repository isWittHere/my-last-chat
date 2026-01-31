---
title: 嵌套子文件夹支持与自定义工具提示
description: 实现嵌套子文件夹检测、文件夹分组UI、Knowledge类型、VS Code风格自定义工具提示
workplace: e:\Dev\my-last-chat
project: my-last-chat
type: coding
solved_lists:
  - 实现嵌套子文件夹扫描（深度2级）
  - 文件夹分组UI与可折叠行为
  - 文件夹默认折叠状态
  - 文件监视器适配子文件夹
  - 编辑器面板文件夹支持
  - 文件夹图标/标题对齐
  - 文件夹悬停时"加号"按钮
  - 语言模型工具文件夹感知
  - Knowledge类型支持
  - 文本样式调整（13px/12px/11px）
  - 时间悬停显示确切时间戳
  - VS Code风格自定义工具提示
---

# 嵌套子文件夹支持与自定义工具提示

## 1. Previous Conversation

用户在使用 My Last Chat 插件时发现了一系列需求和问题：

1. **初始问题**：插件无法检测到嵌套子文件夹内的 MD 文件，只能扫描根目录
2. **需求演进**：
   - 要求支持深度 2 级的子文件夹扫描
   - 需要可折叠的文件夹分组 UI（默认折叠）
   - 文件夹图标应与列表项对齐
   - 文件夹悬停时显示"加号"按钮创建摘要
   - 语言模型工具需要感知文件所在的文件夹
   - 添加新的内容类型 "Knowledge"
   - 调整文本样式以改进可读性
   - 将浏览器原生工具提示替换为 VS Code 风格的自定义工具提示

3. **实现过程**：
   - 完成了递归文件夹扫描和存储层实现
   - 构建了前端文件夹分组 UI 和交互逻辑
   - 修复了文件监视器的通配符模式
   - 同步更新了编辑器面板和 LM 工具
   - 逐步优化 UI 样式和交互体验
   - 最后实现了 VS Code 主题感知的自定义工具提示系统

## 2. Current Work

刚刚完成了 VS Code 风格自定义工具提示的全面实现：

1. **CSS 样式添加**：
   - 创建 `.custom-tooltip` 类，使用 VS Code 主题变量（`--vscode-editorHoverWidget-background`、`--vscode-editorHoverWidget-border`、`--vscode-editorHoverWidget-foreground`）
   - 添加 `visible` 状态的过渡动画和阴影效果
   - 设置 z-index 为 10000 确保最高层级显示

2. **HTML 容器**：
   - 在 Webview HTML body 中添加 `<div class="custom-tooltip" id="customTooltip"></div>`

3. **JavaScript 逻辑**：
   - 实现了 `initTooltip()` 函数，监听 `mouseover`/`mouseout` 事件
   - 400ms 延迟显示（模拟原生行为）
   - 动态定位工具提示，自动避免超出视口边界（左右上下四个方向检查）
   - 使用 `data-tooltip` 属性作为工具提示内容源

4. **属性迁移**：
   - 将所有元素的 `title` 属性替换为 `data-tooltip` 属性
   - 影响的元素包括：时间显示、删除按钮、复制链接按钮、收藏按钮、插入到对话按钮、文件夹加号按钮

5. **编译验证**：
   - TypeScript 编译通过，无任何类型错误
   - 项目成功打包为 VSIX 文件

## 3. Key Technical Concepts

- **VS Code Extension API**：Webview、File System Watcher、Language Model Tools
- **文件监视与扫描**：`fs.promises` 异步文件系统 API、glob 模式通配符、递归目录遍历
- **前端交互**：Webview DOM 操作、事件委托、CSS 主题变量、过渡动画
- **TypeScript 类型系统**：接口定义、类型联合、泛型
- **灰物质解析**：YAML frontmatter 提取，支持元数据管理
- **工具提示设计**：延迟显示、智能定位、边界检查、主题适配
- **代码扫描与搜索**：语言模型工具接口、SearchResult 格式化

## 4. Relevant Files and Code

### src/types.ts
- **作用**：定义所有核心类型和接口
- **关键更改**：
  - `ChatSummary` 接口添加 `folderName` 和 `folderPath` 字段
  - `SearchResult` 接口添加同样的文件夹字段
  - 新增 `FolderGroup` 接口：`{ folderName: string; folderPath: string; items: ChatSummary[] }`
  - `ChatMetadata` 的 `type` 字段扩展为 `'coding' | 'debug' | 'planning' | 'spec' | 'knowledge'`
- **代码示例**：
```typescript
interface ChatSummary {
  id: string;
  title: string;
  description: string;
  type?: 'coding' | 'debug' | 'planning' | 'spec' | 'knowledge';
  folderName?: string;
  folderPath?: string;
  favorite?: boolean;
  updatedTime: number;
}

interface FolderGroup {
  folderName: string;
  folderPath: string;
  items: ChatSummary[];
}
```

### src/storage.ts
- **作用**：处理文件系统操作和摘要数据管理
- **关键更改**：
  - `getChatSummariesFromPath()` 方法实现递归子文件夹扫描（深度 2）
  - 使用 `withFileTypes: true` 区分目录和文件
  - 过滤掉以 `.` 开头的隐藏文件夹
  - 每个子文件夹中单独扫描 `*.md` 文件
  - `formatResult()` 方法输出包含 `folderName` 和 `folderPath`
  - 新增 `createNewSummaryInFolder()` 方法在指定文件夹中创建摘要
- **核心逻辑**：
```typescript
async getChatSummariesFromPath(folderPath: string) {
  const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
  const summaries: ChatSummary[] = [];
  const folders: FolderGroup[] = [];
  
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const subDirPath = path.join(folderPath, entry.name);
      const subFiles = await fs.promises.readdir(subDirPath);
      const mdFiles = subFiles.filter(f => f.endsWith('.md'));
      
      const folderItems = [];
      for (const file of mdFiles) {
        // 解析各个 MD 文件...
        folderItems.push(summary);
      }
      
      if (folderItems.length > 0) {
        folders.push({
          folderName: entry.name,
          folderPath: entry.name,
          items: folderItems
        });
      }
    }
  }
  
  return { summaries, folders };
}
```

### src/webviewTemplate.ts
- **作用**：生成 Webview HTML、CSS 和 JavaScript
- **关键更改**：
  - 新增 `getSharedStyles()` 函数中的文件夹分组样式（`.folder-group`, `.folder-header`, `.folder-items` 等）
  - 新增 Knowledge 类型的样式（codicon-book 图标、浅蓝色/浅绿色主题色）
  - 新增 `.custom-tooltip` 类和可见状态动画
  - `renderItem()` 函数返回 HTML 字符串，包含所有项目 DOM
  - 新增 `renderFolder()` 函数，实现文件夹组和默认折叠逻辑
  - `initTooltip()` 函数实现自定义工具提示的完整逻辑
  - 更新 `bindEvents()` 处理文件夹展开/折叠、加号按钮等
  - 所有按钮和时间显示改用 `data-tooltip` 属性而不是 `title`
  - 新增 `formatExactTime()` 函数格式化完整时间戳

- **自定义工具提示实现**：
```typescript
function initTooltip() {
  document.addEventListener('mouseover', e => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      const text = target.dataset.tooltip;
      if (text) {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => {
          customTooltip.textContent = text;
          const rect = target.getBoundingClientRect();
          let left = rect.left;
          let top = rect.bottom + 4;
          
          // 智能定位逻辑...
          customTooltip.classList.add('visible');
          customTooltip.style.left = left + 'px';
          customTooltip.style.top = top + 'px';
        }, 400);
      }
    }
  });
  
  document.addEventListener('mouseout', e => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      if (tooltipTimer) clearTimeout(tooltipTimer);
      customTooltip.classList.remove('visible');
    }
  });
}
```

### src/extension.ts
- **作用**：VS Code 扩展主入口和激活逻辑
- **关键更改**：
  - 文件监视器模式从 `*.md` 改为 `**/*.md`，支持所有子目录变化

### src/chatListView.ts 和 src/chatListPanel.ts
- **作用**：侧边栏视图和编辑器面板数据提供
- **关键更改**：
  - 数据映射中添加 `folderName` 和 `folderPath` 字段
  - 处理 `createInFolder` 消息事件

### src/tools.ts
- **作用**：语言模型工具实现
- **关键更改**：
  - 三个 `formatResults()` 方法（getLastChatsList、searchByTitle、searchByMeta）均更新输出格式
  - 添加 `Folder: {folderName}` 信息到每个搜索结果输出
  - 本地化支持（l10n）

### l10n/bundle.l10n.json 和 bundle.l10n.zh-cn.json
- **作用**：国际化资源文件
- **关键更改**：
  - 添加 `"Folder: {0}"` 翻译键值对

## 5. Problem Solving

### 问题 1：原始代码只扫描根目录 MD 文件
**解决方案**：实现递归扫描，使用 `fs.promises.readdir({ withFileTypes: true })` 获取目录列表，逐层扫描子文件夹（限制深度为 2）

### 问题 2：文件监视器无法检测子文件夹变化
**解决方案**：将 glob 模式从 `*.md` 改为 `**/*.md`，使其递归匹配所有层级

### 问题 3：编辑器面板未显示文件夹信息
**解决方案**：在 chatListPanel.ts 中补充 folderName/folderPath 数据映射

### 问题 4：浏览器原生工具提示样式不符合 VS Code 风格
**解决方案**：
- 使用 VS Code 主题变量（`--vscode-editorHoverWidget-*`）构建 CSS
- 实现 JavaScript 事件监听和动态定位逻辑
- 400ms 延迟显示，智能避免边界溢出
- 使用 `data-tooltip` 属性替代 `title` 属性

### 问题 5：文件夹图标与列表项图标未对齐
**解决方案**：调整文件夹标题行的高度和图标大小，确保与普通列表项一致

### 问题 6：文件夹加号按钮样式与预期不符
**解决方案**：添加 hover 背景色，使用绝对定位右对齐

## 6. Pending Tasks and Next Steps

### 已完成的全部工作：
✅ 嵌套子文件夹扫描实现  
✅ 文件夹分组 UI 与可折叠功能  
✅ 文件夹默认折叠状态  
✅ 文件监视器子文件夹支持  
✅ 编辑器面板文件夹同步  
✅ 文件夹图标/标题对齐  
✅ 文件夹悬停加号按钮  
✅ LM 工具文件夹感知  
✅ Knowledge 类型实现  
✅ 文本样式调整（13px/12px/11px）  
✅ 时间悬停精确时间戳（title attribute）  
✅ VS Code 风格自定义工具提示（CSS + JS + HTML）  
✅ 所有按钮元素迁移至 data-tooltip 属性  
✅ TypeScript 编译验证通过  

### 项目当前状态：
- 所有功能已实现并通过编译
- 可以打包 VSIX 并安装到 VS Code
- Webview UI 完全响应用户交互
- 自定义工具提示系统已全面集成

### 如有后续需求，可能的方向：
- 性能优化：大量 MD 文件时的扫描效率
- 高级功能：更深的文件夹支持、文件夹快捷操作
- UI 增强：文件夹拖拽排序、文件夹批量操作
- 本地化完善：其他语言的翻译补充
