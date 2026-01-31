import * as vscode from 'vscode';

/**
 * Webview 数据项接口
 */
export interface WebviewDataItem {
  filePath: string;
  fileName: string;
  title: string;
  description: string;
  project: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  tags: string[];
  scope: string;
  /** 所属文件夹名称（仅子文件夹内的文件有此字段） */
  folderName?: string;
  /** 所属文件夹路径（仅子文件夹内的文件有此字段） */
  folderPath?: string;
}

/**
 * Webview 本地化字符串接口
 */
export interface WebviewI18n {
  search: string;
  allTypes: string;
  allScopes: string;
  workspaceOnly: string;
  globalOnly: string;
  favoritesOnly: string;
  recentlyUpdated: string;
  newestCreated: string;
  oldestCreated: string;
  titleAZ: string;
  titleZA: string;
  loading: string;
  noSummaries: string;
  today: string;
  yesterday: string;
  lastWeek: string;
  earlier: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  delete: string;
  copyLink: string;
  favorite: string;
  insertToChat: string;
}

/**
 * 获取默认的本地化字符串
 */
export function getDefaultI18n(): WebviewI18n {
  return {
    search: vscode.l10n.t('Search...'),
    allTypes: vscode.l10n.t('All Types'),
    allScopes: vscode.l10n.t('All Scopes'),
    workspaceOnly: vscode.l10n.t('Workspace'),
    globalOnly: vscode.l10n.t('Global'),
    favoritesOnly: vscode.l10n.t('Favorites'),
    recentlyUpdated: vscode.l10n.t('Recently Updated'),
    newestCreated: vscode.l10n.t('Newest Created'),
    oldestCreated: vscode.l10n.t('Oldest Created'),
    titleAZ: vscode.l10n.t('Title A-Z'),
    titleZA: vscode.l10n.t('Title Z-A'),
    loading: vscode.l10n.t('Loading...'),
    noSummaries: vscode.l10n.t('No chat summaries'),
    today: vscode.l10n.t('Today'),
    yesterday: vscode.l10n.t('Yesterday'),
    lastWeek: vscode.l10n.t('Last Week'),
    earlier: vscode.l10n.t('Earlier'),
    justNow: vscode.l10n.t('Just now'),
    minutesAgo: vscode.l10n.t('{0} min ago'),
    hoursAgo: vscode.l10n.t('{0} hr ago'),
    daysAgo: vscode.l10n.t('{0} days ago'),
    delete: vscode.l10n.t('Delete'),
    copyLink: vscode.l10n.t('Copy link'),
    favorite: vscode.l10n.t('Favorite'),
    insertToChat: vscode.l10n.t('Insert to chat'),
  };
}

/**
 * 获取 codicons 的 URI
 */
export function getCodiconsUri(webview: vscode.Webview, extensionUri: vscode.Uri): vscode.Uri {
  return webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'codicons', 'codicon.css')
  );
}

/**
 * 生成随机 nonce
 */
export function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * 获取共享的 CSS 样式
 */
export function getSharedStyles(isPanel: boolean = false): string {
  const backgroundColor = isPanel 
    ? 'var(--vscode-editor-background)' 
    : 'var(--vscode-sideBar-background)';
  
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      overflow: hidden;
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: ${backgroundColor};
      user-select: none;
      display: flex;
      flex-direction: column;
    }
    .container { 
      padding: 6px;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    
    /* 顶部控件区域 - 支持自动隐藏 */
    .controls-area {
      transition: transform 0.2s ease, opacity 0.2s ease, max-height 0.2s ease;
      transform-origin: top;
    }
    .controls-area.hidden {
      transform: translateY(-100%);
      opacity: 0;
      max-height: 0;
      overflow: hidden;
      margin-bottom: 0;
    }
    
    /* 搜索框 */
    .search-box { margin-bottom: 6px; }
    .search-input {
      width: 100%;
      padding: 4px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 4px;
      font-size: 12px;
      outline: none;
    }
    .search-input:focus { border-color: var(--vscode-focusBorder); }
    
    /* 控制行 */
    .controls-row {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    /* 自定义下拉选单 */
    .custom-select {
      flex: 1 1 auto;
      min-width: 80px;
      position: relative;
    }
    .custom-select-btn {
      width: 100%;
      padding: 4px 8px;
      background: var(--vscode-dropdown-background);
      color: var(--vscode-descriptionForeground);
      border: 1px solid var(--vscode-dropdown-border, rgba(128,128,128,0.35));
      border-radius: 4px;
      font-size: 12px;
      font-family: var(--vscode-font-family);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.15s;
      text-align: left;
    }
    .custom-select-btn .select-text { flex: 1; }
    .custom-select-btn .codicon {
      flex-shrink: 0;
      margin-left: 4px;
      font-size: 12px;
      opacity: 0.7;
      transition: transform 0.15s;
    }
    .custom-select-btn:hover {
      background: var(--vscode-list-hoverBackground);
      border-color: var(--vscode-focusBorder);
    }
    .custom-select.open .custom-select-btn {
      border-color: var(--vscode-focusBorder);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .custom-select.open .custom-select-btn .codicon { transform: rotate(180deg); }
    .custom-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--vscode-dropdown-background);
      border: 1px solid var(--vscode-focusBorder);
      border-top: none;
      border-radius: 0 0 4px 4px;
      z-index: 100;
      display: none;
      max-height: 180px;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .custom-select.open .custom-select-dropdown { display: block; }
    .custom-select-option {
      padding: 4px 10px;
      cursor: pointer;
      font-size: 12px;
      transition: background 0.1s;
    }
    .custom-select-option:hover { background: var(--vscode-list-hoverBackground); }
    .custom-select-option.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .custom-select-option:last-child { border-radius: 0 0 4px 4px; }
    
    /* 收藏筛选 */
    .fav-filter {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
      border: 1px solid var(--vscode-dropdown-border, rgba(128,128,128,0.35));
      transition: all 0.15s;
    }
    .fav-filter:hover { background: var(--vscode-list-hoverBackground); }
    .fav-filter .codicon { font-size: 12px; color: var(--vscode-descriptionForeground); }
    .fav-filter input:checked + .codicon { color: #f59e0b; }
    
    /* 列表 - 隐藏原生滚动条 */
    .chat-list { 
      list-style: none;
      overflow-y: scroll;
      flex: 1;
      min-height: 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding-right: 10px; /* 给滚动条留出空间 */
    }
    .chat-list::-webkit-scrollbar {
      display: none;
    }
    
    /* 列表容器 - 用于定位滚动条 */
    .list-wrapper {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      margin-right: -6px; /* 抵消container的padding */
    }
    
    /* 自定义滚动条轨道 */
    .scrollbar-track {
      position: absolute;
      right: 0;
      top: 0;
      width: 14px;
      height: 100%;
      background: transparent;
      opacity: 0;
      transition: opacity 0.15s ease;
      z-index: 100;
      pointer-events: auto;
    }
    .scrollbar-track.visible {
      opacity: 1;
    }
    
    /* 自定义滚动条滑块 */
    .scrollbar-thumb {
      position: absolute;
      right: 2px;
      width: 6px;
      min-height: 30px;
      background: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4));
      border-radius: 0;
      cursor: pointer;
      transition: background 0.1s ease;
    }
    .scrollbar-thumb:hover {
      background: var(--vscode-scrollbarSlider-hoverBackground, rgba(121, 121, 121, 0.7));
    }
    .scrollbar-thumb.dragging {
      background: var(--vscode-scrollbarSlider-activeBackground, rgba(121, 121, 121, 0.9));
    }

    /* 分组标题 */
    .group-header {
      position: sticky;
      top: 0;
      background: ${backgroundColor};
      padding: 4px 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 10;
      border-radius: 4px;
      transition: background 0.1s;
    }
    .group-header:hover { 
      color: var(--vscode-foreground);
      background: var(--vscode-list-hoverBackground);
    }
    .group-header .codicon { font-size: 12px; }
    .group-items.collapsed { display: none; }
    .group-count { color: var(--vscode-descriptionForeground); font-weight: normal; }
    
    /* 文件夹组样式 */
    .folder-group {
      margin: 2px 0;
    }
    .folder-header {
      padding: 0px 8px;
      font-size: 12px;
      color: var(--vscode-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      border-radius: 4px;
      transition: background 0.1s;
    }
    .folder-header:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .folder-header .folder-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      opacity: 0.75;
      color: var(--vscode-icon-foreground, #c5c5c5);
    }
    .folder-header .folder-name {
      font-weight: 500;
    }
    .folder-header .folder-count {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      opacity: 0.8;
      margin-left: 2px;
    }
    .folder-header .folder-spacer {
      flex: 1;
    }
    .folder-header .folder-add-btn {
      opacity: 0;
      padding: 2px 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      border-radius: 3px;
      transition: opacity 0.15s, background 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .folder-header:hover .folder-add-btn {
      opacity: 1;
    }
    .folder-header .folder-add-btn:hover {
      background: var(--vscode-toolbar-hoverBackground);
      color: var(--vscode-foreground);
    }
    .folder-header .folder-add-btn .codicon {
      font-size: 14px;
    }
    .folder-items {
      padding-left: 28px;
    }
    .folder-items.collapsed {
      display: none;
    }
    
    /* 单项卡片 */
    .chat-item {
      padding: 6px 8px;
      margin: 2px 0;
      background: transparent;
      border-radius: 4px;
      transition: background 0.1s;
      display: flex;
      gap: 4px;
    }
    .chat-item:hover { background: var(--vscode-list-hoverBackground); }
    
    /* 左侧图标列 */
    .item-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      opacity: 0.75;
      margin-top: 2px;
    }
    
    /* 默认后备颜色 (优先级最低) */
    .item-icon.codicon-code { color: #4fc3f7; }
    .item-icon.codicon-bug { color: #ef5350; }
    .item-icon.codicon-checklist { color: #66bb6a; }
    .item-icon.codicon-file-text { color: #ab47bc; }
    .item-icon.codicon-comment-discussion { color: var(--vscode-descriptionForeground); }
    
    /* 浅色主题 - 使用稍暗的颜色以确保可读性 */
    body[data-vscode-theme-kind="vscode-light"] .item-icon.codicon-code { 
      color: #0079dc; 
    }
    body[data-vscode-theme-kind="vscode-light"] .item-icon.codicon-bug { 
      color: #d32f2f; 
    }
    body[data-vscode-theme-kind="vscode-light"] .item-icon.codicon-checklist { 
      color: #009207; 
    }
    body[data-vscode-theme-kind="vscode-light"] .item-icon.codicon-file-text { 
      color: #8e24aa; 
    }
    
    /* 暗色主题 - 使用更亮的颜色以提高对比度 (优先级最高) */
    body[data-vscode-theme-kind="vscode-dark"] .item-icon.codicon-code,
    body[data-vscode-theme-kind="vscode-high-contrast"] .item-icon.codicon-code { 
      color: #64d8ff; 
    }
    body[data-vscode-theme-kind="vscode-dark"] .item-icon.codicon-bug,
    body[data-vscode-theme-kind="vscode-high-contrast"] .item-icon.codicon-bug { 
      color: #ff6b68; 
    }
    body[data-vscode-theme-kind="vscode-dark"] .item-icon.codicon-checklist,
    body[data-vscode-theme-kind="vscode-high-contrast"] .item-icon.codicon-checklist { 
      color: #7fcd85; 
    }
    body[data-vscode-theme-kind="vscode-dark"] .item-icon.codicon-file-text,
    body[data-vscode-theme-kind="vscode-high-contrast"] .item-icon.codicon-file-text { 
      color: #c77dd1; 
    }
    
    /* 右侧内容列 */
    .item-content {
      flex: 1;
      min-width: 0;
    }
    
    /* 标题 */
    .item-title {
      font-weight: 600;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 3px;
      color: var(--vscode-foreground);
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-title:hover { color: var(--vscode-textLink-foreground); text-decoration: underline; }
    
    /* 描述 */
    .item-desc {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.3;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    /* 标签行 */
    .item-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
      margin-bottom: 2px;
    }
    .item-tag {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 0 4px;
      border-radius: 2px;
      font-weight: 350;
      font-size: 9px;
    }
    .item-type {
      padding: 0 4px;
      border-radius: 2px;
      font-weight: 350;
      text-transform: uppercase;
      font-size: 9px;
      display: none; /* 暂时隐藏 */
    }
    .item-type.coding { background: #197fb2; color: #fff; }
    .item-type.debug { background: #a83b34; color: #fff; }
    .item-type.planning { background: #2c7e49; color: #fff; }
    .item-type.spec { background: #6a1f8f; color: #fff; }
    
    /* 底部元信息行 */
    .item-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
    }
    .meta-left {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }
    .item-time { color: var(--vscode-descriptionForeground); white-space: nowrap; }
    
    /* 操作按钮 */
    .item-actions {
      display: flex;
      gap: 2px;
      transition: opacity 0.1s;
    }
    .act-btn {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.1s;
    }
    .act-btn .codicon { font-size: 14px; }
    .act-btn:hover { background: var(--vscode-toolbar-hoverBackground); color: var(--vscode-foreground); }
    .act-btn.fav.active { color: #f59e0b; }
    .act-btn.del:hover { color: #f44336; }
    /* 卡片hover时显示其他按钮 */
    .chat-item:hover .act-btn {
      opacity: 1;
    }
    /* 插入按钮默认只显示图标 - 始终可见 */
    .act-btn.attach {
      opacity: 1;
      background: none;
      color: var(--vscode-descriptionForeground);
      padding: 2px 4px;
      border-radius: 2px;
      transition: all 0.15s;
      overflow: hidden;
      white-space: nowrap;
    }
    .act-btn.attach .btn-text {
      max-width: 0;
      opacity: 0;
      display: inline-block;
      overflow: hidden;
      transition: all 0.15s;
      margin-left: 0;
    }
    /* 卡片hover时显示完整按钮样式 */
    .chat-item:hover .act-btn.attach {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      padding: 2px 8px;
      border-radius: 3px;
    }
    .chat-item:hover .act-btn.attach .btn-text {
      max-width: 100px;
      opacity: 1;
      margin-left: 4px;
    }
    
    /* 空状态 */
    .empty-state {
      text-align: center;
      padding: 24px 12px;
      color: var(--vscode-descriptionForeground);
    }
    .empty-state .codicon { font-size: 32px; margin-bottom: 8px; display: block; }
    .empty-text { font-size: 12px; }
  `;
}

/**
 * 获取控件 HTML
 */
export function getControlsHtml(i18n: WebviewI18n): string {
  return `
    <div class="controls-area" id="controlsArea">
      <div class="search-box">
        <input type="text" class="search-input" id="searchInput" placeholder="${i18n.search}">
      </div>
      
      <div class="controls-row">
        <div class="custom-select" id="filterSelect" data-value="all">
          <button class="custom-select-btn">
            <span class="select-text">${i18n.allTypes}</span>
            <span class="codicon codicon-chevron-down"></span>
          </button>
          <div class="custom-select-dropdown">
            <div class="custom-select-option selected" data-value="all">${i18n.allTypes}</div>
            <div class="custom-select-option" data-value="coding">Coding</div>
            <div class="custom-select-option" data-value="debug">Debug</div>
            <div class="custom-select-option" data-value="planning">Planning</div>
            <div class="custom-select-option" data-value="spec">Spec</div>
          </div>
        </div>
        <div class="custom-select" id="scopeSelect" data-value="workspace">
          <button class="custom-select-btn">
            <span class="select-text">${i18n.workspaceOnly}</span>
            <span class="codicon codicon-chevron-down"></span>
          </button>
          <div class="custom-select-dropdown">
            <div class="custom-select-option" data-value="all">${i18n.allScopes}</div>
            <div class="custom-select-option selected" data-value="workspace">${i18n.workspaceOnly}</div>
            <div class="custom-select-option" data-value="global">${i18n.globalOnly}</div>
          </div>
        </div>
        <div class="custom-select" id="sortSelect" data-value="updated-desc">
          <button class="custom-select-btn">
            <span class="select-text">${i18n.recentlyUpdated}</span>
            <span class="codicon codicon-chevron-down"></span>
          </button>
          <div class="custom-select-dropdown">
            <div class="custom-select-option selected" data-value="updated-desc">${i18n.recentlyUpdated}</div>
            <div class="custom-select-option" data-value="created-desc">${i18n.newestCreated}</div>
            <div class="custom-select-option" data-value="created-asc">${i18n.oldestCreated}</div>
            <div class="custom-select-option" data-value="title-asc">${i18n.titleAZ}</div>
            <div class="custom-select-option" data-value="title-desc">${i18n.titleZA}</div>
          </div>
        </div>
        <label class="fav-filter">
          <input type="checkbox" id="favOnly" style="display:none;">
          <span class="codicon codicon-star-empty"></span>
          <span>${i18n.favoritesOnly}</span>
        </label>
      </div>
    </div>
    
    <div class="list-wrapper" id="listWrapper">
      <ul class="chat-list" id="chatList">
        <li class="empty-state">
          <span class="codicon codicon-comment-discussion"></span>
          <div class="empty-text">${i18n.loading}</div>
        </li>
      </ul>
    </div>
  `;
}

/**
 * 获取共享的 JavaScript 代码
 */
export function getSharedScript(i18n: WebviewI18n): string {
  // 将 i18n 对象转换为 JSON 字符串嵌入到脚本中
  const i18nJson = JSON.stringify(i18n);
  
  return `
    const vscode = acquireVsCodeApi();
    const $ = id => document.getElementById(id);
    const i18n = ${i18nJson};
    
    const searchInput = $('searchInput');
    const filterSelect = $('filterSelect');
    const scopeSelect = $('scopeSelect');
    const sortSelect = $('sortSelect');
    const favOnly = $('favOnly');
    const chatList = $('chatList');
    
    let timer;
    let collapsed = new Set();
    
    // 自定义下拉选单初始化
    function initCustomSelects() {
      document.querySelectorAll('.custom-select').forEach(select => {
        const btn = select.querySelector('.custom-select-btn');
        const dropdown = select.querySelector('.custom-select-dropdown');
        const options = select.querySelectorAll('.custom-select-option');
        const textEl = select.querySelector('.select-text');
        
        btn.addEventListener('click', e => {
          e.stopPropagation();
          document.querySelectorAll('.custom-select.open').forEach(s => {
            if (s !== select) s.classList.remove('open');
          });
          select.classList.toggle('open');
        });
        
        options.forEach(opt => {
          opt.addEventListener('click', e => {
            e.stopPropagation();
            const val = opt.dataset.value;
            const txt = opt.textContent;
            select.dataset.value = val;
            textEl.textContent = txt;
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            select.classList.remove('open');
            doSearch();
          });
        });
      });
      
      document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
      });
    }
    initCustomSelects();
    
    // 自定义滚动条实现
    (function initCustomScrollbar() {
      const wrapper = $('listWrapper');
      if (!wrapper) return;
      
      // 创建滚动条元素
      const track = document.createElement('div');
      track.className = 'scrollbar-track';
      const thumb = document.createElement('div');
      thumb.className = 'scrollbar-thumb';
      track.appendChild(thumb);
      wrapper.appendChild(track);
      
      let hideTimer;
      let isDragging = false;
      let startY, startScrollTop;
      let updatePending = false;
      
      // 更新滚动条位置和大小（节流）
      function updateThumb() {
        if (updatePending) return;
        updatePending = true;
        requestAnimationFrame(() => {
          updatePending = false;
          const { scrollTop, scrollHeight, clientHeight } = chatList;
          if (scrollHeight <= clientHeight) {
            track.style.display = 'none';
            return;
          }
          track.style.display = '';
          const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * clientHeight);
          const maxTop = clientHeight - thumbHeight;
          const thumbTop = scrollHeight > clientHeight 
            ? (scrollTop / (scrollHeight - clientHeight)) * maxTop 
            : 0;
          thumb.style.height = thumbHeight + 'px';
          thumb.style.top = thumbTop + 'px';
        });
      }
      
      // 显示滚动条
      function showScrollbar() {
        track.classList.add('visible');
        clearTimeout(hideTimer);
      }
      
      // 隐藏滚动条
      function hideScrollbar() {
        if (!isDragging) {
          hideTimer = setTimeout(() => track.classList.remove('visible'), 800);
        }
      }
      
      // 滚动事件
      chatList.addEventListener('scroll', () => {
        updateThumb();
        showScrollbar();
        hideScrollbar();
      }, { passive: true });
      
      // 鼠标进入/离开
      wrapper.addEventListener('mouseenter', () => {
        updateThumb();
        showScrollbar();
      });
      wrapper.addEventListener('mouseleave', hideScrollbar);
      
      // 拖拽滚动条
      thumb.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        thumb.classList.add('dragging');
        startY = e.clientY;
        startScrollTop = chatList.scrollTop;
        showScrollbar();
      });
      
      document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const { scrollHeight, clientHeight } = chatList;
        const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * clientHeight);
        const maxTop = clientHeight - thumbHeight;
        const deltaY = e.clientY - startY;
        const scrollRatio = maxTop > 0 ? deltaY / maxTop : 0;
        chatList.scrollTop = startScrollTop + scrollRatio * (scrollHeight - clientHeight);
      });
      
      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          thumb.classList.remove('dragging');
          hideScrollbar();
        }
      });
      
      // 点击轨道跳转
      track.addEventListener('click', e => {
        if (e.target === thumb) return;
        const rect = track.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const { scrollHeight, clientHeight } = chatList;
        const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * clientHeight);
        const maxTop = clientHeight - thumbHeight;
        const scrollRatio = maxTop > 0 ? (clickY - thumbHeight / 2) / maxTop : 0;
        chatList.scrollTop = Math.max(0, Math.min(scrollRatio * (scrollHeight - clientHeight), scrollHeight - clientHeight));
      });
      
      // 延迟初始化
      setTimeout(updateThumb, 100);
      
      // 监听窗口大小变化
      window.addEventListener('resize', updateThumb);
    })();
    
    // 顶部控制区域自动隐藏
    let autoHideControlsEnabled = false; // 默认关闭，由设置控制
    
    (function initControlsAutoHide() {
      const controlsArea = $('controlsArea');
      const listWrapper = $('listWrapper');
      if (!controlsArea || !listWrapper || !chatList) return;
      
      let lastScrollTop = 0;
      let ticking = false;
      const threshold = 10; // 最小滚动距离才触发
      
      chatList.addEventListener('scroll', () => {
        if (!autoHideControlsEnabled) return; // 检查设置是否启用
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const scrollTop = chatList.scrollTop;
          const delta = scrollTop - lastScrollTop;
          
          // 滚动到顶部时始终显示
          if (scrollTop <= 5) {
            controlsArea.classList.remove('hidden');
          } else if (Math.abs(delta) > threshold) {
            if (delta > 0) {
              // 向下滚动 - 隐藏
              controlsArea.classList.add('hidden');
            } else {
              // 向上滚动 - 显示
              controlsArea.classList.remove('hidden');
            }
            lastScrollTop = scrollTop;
          }
          ticking = false;
        });
      }, { passive: true });
    })();
    
    function updateFavIcon() {
      const label = favOnly.parentElement;
      const icon = label.querySelector('.codicon');
      if (favOnly.checked) {
        icon.className = 'codicon codicon-star-full';
      } else {
        icon.className = 'codicon codicon-star-empty';
      }
    }
    
    // 保存筛选器状态
    function saveFilterState() {
      const state = {
        query: searchInput.value,
        filter: filterSelect.dataset.value,
        scope: scopeSelect.dataset.value,
        showFavoritesOnly: favOnly.checked,
        sortBy: sortSelect.dataset.value
      };
      vscode.setState(state);
    }
    
    // 恢复筛选器状态
    function restoreFilterState() {
      const state = vscode.getState();
      if (state) {
        searchInput.value = state.query || '';
        
        if (state.filter) {
          filterSelect.dataset.value = state.filter;
          const filterText = filterSelect.querySelector('.select-text');
          const filterOpt = filterSelect.querySelector('[data-value="' + state.filter + '"]');
          if (filterOpt && filterText) {
            filterText.textContent = filterOpt.textContent;
            filterSelect.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            filterOpt.classList.add('selected');
          }
        }
        
        if (state.scope) {
          scopeSelect.dataset.value = state.scope;
          const scopeText = scopeSelect.querySelector('.select-text');
          const scopeOpt = scopeSelect.querySelector('[data-value="' + state.scope + '"]');
          if (scopeOpt && scopeText) {
            scopeText.textContent = scopeOpt.textContent;
            scopeSelect.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            scopeOpt.classList.add('selected');
          }
        }
        
        if (state.sortBy) {
          sortSelect.dataset.value = state.sortBy;
          const sortText = sortSelect.querySelector('.select-text');
          const sortOpt = sortSelect.querySelector('[data-value="' + state.sortBy + '"]');
          if (sortOpt && sortText) {
            sortText.textContent = sortOpt.textContent;
            sortSelect.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            sortOpt.classList.add('selected');
          }
        }
        
        if (state.showFavoritesOnly) {
          favOnly.checked = true;
          updateFavIcon();
        }
      }
    }
    
    function doSearch() {
      saveFilterState();
      vscode.postMessage({
        type: 'search',
        query: searchInput.value,
        filter: filterSelect.dataset.value,
        scope: scopeSelect.dataset.value,
        showFavoritesOnly: favOnly.checked,
        sortBy: sortSelect.dataset.value
      });
    }
    
    function getTypeIcon(type) {
      switch (type) {
        case 'coding': return 'codicon-code';
        case 'debug': return 'codicon-bug';
        case 'planning': return 'codicon-checklist';
        case 'spec': return 'codicon-file-text';
        default: return 'codicon-comment-discussion';
      }
    }
    
    let currentItems = [];
    
    function updateTimes() {
      document.querySelectorAll('.chat-item').forEach(item => {
        const path = item.dataset.path;
        const it = currentItems.find(i => i.filePath === path);
        if (it) {
          const timeEl = item.querySelector('.item-time');
          if (timeEl) {
            timeEl.textContent = formatTime(it.updatedAt || it.createdAt);
          }
        }
      });
    }
    
    setInterval(updateTimes, 60000);
    
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(doSearch, 250);
    });
    favOnly.addEventListener('change', () => {
      updateFavIcon();
      doSearch();
    });
    
    window.addEventListener('message', e => {
      if (e.data.type === 'updateList') render(e.data.data);
      if (e.data.type === 'triggerSearch') {
        // 后端请求刷新，使用当前筛选状态重新搜索
        doSearch();
      }
      if (e.data.type === 'settings') {
        autoHideControlsEnabled = e.data.autoHideControls || false;
        // 如果禁用了自动隐藏，确保控制区域显示
        if (!autoHideControlsEnabled) {
          const controlsArea = $('controlsArea');
          if (controlsArea) controlsArea.classList.remove('hidden');
        }
      }
      if (e.data.type === 'updateScope') {
        // 更新范围选择器
        const newScope = e.data.scope;
        scopeSelect.dataset.value = newScope;
        const scopeText = scopeSelect.querySelector('.select-text');
        const scopeOpt = scopeSelect.querySelector('[data-value="' + newScope + '"]');
        if (scopeOpt && scopeText) {
          scopeText.textContent = scopeOpt.textContent;
          scopeSelect.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
          scopeOpt.classList.add('selected');
        }
        saveFilterState();
      }
    });
    
    function formatTime(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      const now = new Date();
      const diff = now - d;
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return i18n.justNow;
      if (mins < 60) return i18n.minutesAgo.replace('{0}', mins);
      if (hrs < 24) return i18n.hoursAgo.replace('{0}', hrs);
      if (days < 7) return i18n.daysAgo.replace('{0}', days);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    
    function getGroup(iso) {
      if (!iso) return i18n.earlier;
      const d = new Date(iso);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diff = Math.floor((today - itemDay) / 86400000);
      if (diff === 0) return i18n.today;
      if (diff === 1) return i18n.yesterday;
      if (diff < 7) return i18n.lastWeek;
      return i18n.earlier;
    }
    
    function esc(t) {
      if (!t) return '';
      const d = document.createElement('div');
      d.textContent = t;
      return d.innerHTML;
    }
    
    function render(items) {
      currentItems = items || [];
      
      if (!items || !items.length) {
        chatList.innerHTML = '<li class="empty-state"><span class="codicon codicon-inbox"></span><div class="empty-text">' + i18n.noSummaries + '</div></li>';
        return;
      }
      
      // 分离普通文件和文件夹内的文件
      const rootItems = [];
      const folderMap = {}; // folderPath -> { folderName, items, latestTime }
      
      items.forEach(it => {
        if (it.folderName && it.folderPath) {
          if (!folderMap[it.folderPath]) {
            folderMap[it.folderPath] = {
              folderName: it.folderName,
              folderPath: it.folderPath,
              items: [],
              latestTime: it.updatedAt || it.createdAt
            };
          }
          folderMap[it.folderPath].items.push(it);
          // 更新文件夹的最新时间
          const currentTime = new Date(it.updatedAt || it.createdAt).getTime();
          const folderTime = new Date(folderMap[it.folderPath].latestTime).getTime();
          if (currentTime > folderTime) {
            folderMap[it.folderPath].latestTime = it.updatedAt || it.createdAt;
          }
        } else {
          rootItems.push(it);
        }
      });
      
      // 将文件夹作为一个整体加入时间分组
      const folders = Object.values(folderMap);
      
      const groups = {};
      groups[i18n.today] = [];
      groups[i18n.yesterday] = [];
      groups[i18n.lastWeek] = [];
      groups[i18n.earlier] = [];
      
      // 添加普通文件到对应时间组
      rootItems.forEach(it => {
        const g = getGroup(it.updatedAt || it.createdAt);
        groups[g].push({ type: 'item', data: it });
      });
      
      // 添加文件夹到对应时间组（按最新文件时间）
      folders.forEach(folder => {
        const g = getGroup(folder.latestTime);
        groups[g].push({ type: 'folder', data: folder });
      });
      
      // 渲染函数：单个聊天项
      function renderItem(it) {
        const typeIcon = getTypeIcon(it.type);
        let html = '';
        html += '<div class="chat-item" data-path="' + esc(it.filePath) + '" data-fn="' + esc(it.fileName) + '">';
        html += '<span class="item-icon codicon ' + typeIcon + '"></span>';
        html += '<div class="item-content">';
        html += '<div class="item-title">' + esc(it.title) + '</div>';
        html += '<div class="item-desc">' + esc(it.description) + '</div>';
        if (it.type || (it.tags && it.tags.length)) {
          html += '<div class="item-tags">';
          if (it.type) html += '<span class="item-type ' + it.type + '">' + it.type + '</span>';
          if (it.tags && it.tags.length) {
            it.tags.forEach(t => { html += '<span class="item-tag">' + esc(t) + '</span>'; });
          }
          html += '</div>';
        }
        html += '<div class="item-meta">';
        html += '<div class="meta-left">';
        html += '<span class="item-time">' + formatTime(it.updatedAt || it.createdAt) + '</span>';
        html += '</div>';
        html += '<div class="item-actions">';
        html += '<button class="act-btn del" data-act="del" title="' + i18n.delete + '"><span class="codicon codicon-trash"></span></button>';
        html += '<button class="act-btn copy" data-act="copy" title="' + i18n.copyLink + '"><span class="codicon codicon-copy"></span></button>';
        html += '<button class="act-btn fav ' + (it.favorite ? 'active' : '') + '" data-act="fav" title="' + i18n.favorite + '"><span class="codicon ' + (it.favorite ? 'codicon-star-full' : 'codicon-star-empty') + '"></span></button>';
        html += '<button class="act-btn attach" data-act="attach" title="' + i18n.insertToChat + '"><span class="codicon codicon-indent"></span></button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        return html;
      }
      
      // 收集所有文件夹ID，用于默认折叠状态
      const folderIds = new Set();
      
      // 渲染函数：文件夹组
      function renderFolder(folder) {
        const folderId = 'folder-' + folder.folderPath.replace(/[^a-zA-Z0-9]/g, '-');
        folderIds.add(folderId);
        // 默认折叠：如果这是新的文件夹ID且不在collapsed中，添加到collapsed
        if (!collapsed.has(folderId) && !collapsed.has('_init_' + folderId)) {
          collapsed.add(folderId);
          collapsed.add('_init_' + folderId); // 标记已初始化
        }
        const isFolderCol = collapsed.has(folderId);
        let html = '';
        html += '<div class="folder-group">';
        html += '<div class="folder-header" data-folder="' + folderId + '" data-folder-path="' + esc(folder.folderPath) + '">';
        html += '<span class="folder-icon codicon ' + (isFolderCol ? 'codicon-folder' : 'codicon-folder-opened') + '"></span>';
        html += '<span class="folder-name">' + esc(folder.folderName) + '</span>';
        html += '<span class="folder-count">(' + folder.items.length + ')</span>';
        html += '<span class="folder-spacer"></span>';
        html += '<button class="folder-add-btn" data-act="add" title="New Summary"><span class="codicon codicon-add"></span></button>';
        html += '</div>';
        html += '<div class="folder-items ' + (isFolderCol ? 'collapsed' : '') + '" data-fi="' + folderId + '">';
        folder.items.forEach(it => {
          html += renderItem(it);
        });
        html += '</div>';
        html += '</div>';
        return html;
      }
      
      let html = '';
      for (const [name, list] of Object.entries(groups)) {
        if (!list.length) continue;
        const isCol = collapsed.has(name);
        
        // 计算总项目数（文件夹内的项目也要计入）
        let totalCount = 0;
        list.forEach(entry => {
          if (entry.type === 'folder') {
            totalCount += entry.data.items.length;
          } else {
            totalCount += 1;
          }
        });
        
        html += '<li>';
        html += '<div class="group-header" data-g="' + name + '">';
        html += '<span class="codicon ' + (isCol ? 'codicon-chevron-right' : 'codicon-chevron-down') + '"></span>';
        html += '<span>' + name + '</span>';
        html += '<span class="group-count">(' + totalCount + ')</span>';
        html += '</div>';
        html += '<div class="group-items ' + (isCol ? 'collapsed' : '') + '" data-gi="' + name + '">';
        
        // 按时间排序：文件夹按最新时间，普通项按更新时间
        list.sort((a, b) => {
          const aTime = a.type === 'folder' ? a.data.latestTime : (a.data.updatedAt || a.data.createdAt);
          const bTime = b.type === 'folder' ? b.data.latestTime : (b.data.updatedAt || b.data.createdAt);
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        
        list.forEach(entry => {
          if (entry.type === 'folder') {
            html += renderFolder(entry.data);
          } else {
            html += renderItem(entry.data);
          }
        });
        
        html += '</div></li>';
      }
      
      chatList.innerHTML = html;
      bindEvents();
    }
    
    function bindEvents() {
      document.querySelectorAll('.group-header').forEach(h => {
        h.onclick = e => {
          e.stopPropagation();
          const g = h.dataset.g;
          const icon = h.querySelector('.codicon');
          const items = document.querySelector('[data-gi="' + g + '"]');
          if (collapsed.has(g)) {
            collapsed.delete(g);
            icon.className = 'codicon codicon-chevron-down';
            items.classList.remove('collapsed');
          } else {
            collapsed.add(g);
            icon.className = 'codicon codicon-chevron-right';
            items.classList.add('collapsed');
          }
        };
      });
      
      // 文件夹折叠/展开事件
      document.querySelectorAll('.folder-header').forEach(h => {
        h.onclick = e => {
          // 如果点击的是加号按钮，不触发折叠
          if (e.target.closest('.folder-add-btn')) {
            return;
          }
          e.stopPropagation();
          const folderId = h.dataset.folder;
          const icon = h.querySelector('.folder-icon');
          const items = document.querySelector('[data-fi="' + folderId + '"]');
          if (collapsed.has(folderId)) {
            collapsed.delete(folderId);
            icon.className = 'folder-icon codicon codicon-folder-opened';
            items.classList.remove('collapsed');
          } else {
            collapsed.add(folderId);
            icon.className = 'folder-icon codicon codicon-folder';
            items.classList.add('collapsed');
          }
        };
      });
      
      // 文件夹新建按钮事件
      document.querySelectorAll('.folder-add-btn').forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          const header = btn.closest('.folder-header');
          const folderPath = header.dataset.folderPath;
          vscode.postMessage({ type: 'createInFolder', folderPath: folderPath });
        };
      });
      
      document.querySelectorAll('.item-title').forEach(title => {
        title.onclick = e => {
          e.stopPropagation();
          const it = title.closest('.chat-item');
          vscode.postMessage({ type: 'openFile', filePath: it.dataset.path });
        };
      });
      
      document.querySelectorAll('.act-btn').forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          const act = btn.dataset.act;
          const it = btn.closest('.chat-item');
          const path = it.dataset.path;
          const fn = it.dataset.fn;
          if (act === 'attach') vscode.postMessage({ type: 'attachToChat', filePath: path });
          else if (act === 'fav') vscode.postMessage({ type: 'toggleFavorite', filePath: path });
          else if (act === 'copy') vscode.postMessage({ type: 'copyLink', filePath: path });
          else if (act === 'del') vscode.postMessage({ type: 'deleteFile', filePath: path, fileName: fn });
        };
      });
    }
    
    // 恢复之前的筛选器状态
    restoreFilterState();
    
    // 发送 ready 消息，包含当前的筛选器状态
    vscode.postMessage({ 
      type: 'ready',
      filter: filterSelect.dataset.value,
      scope: scopeSelect.dataset.value,
      showFavoritesOnly: favOnly.checked,
      sortBy: sortSelect.dataset.value
    });
  `;
}

/**
 * 生成完整的 Webview HTML
 */
export function generateWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  options: {
    isPanel?: boolean;
    i18n?: WebviewI18n;
  } = {}
): string {
  const { isPanel = false, i18n = getDefaultI18n() } = options;
  const nonce = getNonce();
  const codiconsUri = getCodiconsUri(webview, extensionUri);

  return `<!DOCTYPE html>
<html lang="${vscode.env.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <link href="${codiconsUri}" rel="stylesheet" />
  <title>My Last Chat</title>
  <style>${getSharedStyles(isPanel)}</style>
</head>
<body>
  <div class="container">
    ${getControlsHtml(i18n)}
  </div>
  <script nonce="${nonce}">${getSharedScript(i18n)}</script>
</body>
</html>`;
}
