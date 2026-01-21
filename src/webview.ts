import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { ChatSummary } from './types';

/**
 * 聊天列表WebView视图提供者
 */
export class ChatListViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myLastChat.chatListView';
  
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;
  private _storageService: ChatStorageService;

  constructor(extensionUri: vscode.Uri, storageService: ChatStorageService) {
    this._extensionUri = extensionUri;
    this._storageService = storageService;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理来自WebView的消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          await this.refresh();
          break;
        case 'openFile':
          const document = await vscode.workspace.openTextDocument(data.filePath);
          await vscode.window.showTextDocument(document);
          break;
        case 'search':
          await this.search(data.query, data.filter);
          break;
        case 'ready':
          await this.refresh();
          break;
      }
    });
  }

  /**
   * 刷新聊天列表
   */
  public async refresh(): Promise<void> {
    if (this._view) {
      const summaries = await this._storageService.getAllChatSummaries();
      this._view.webview.postMessage({
        type: 'updateList',
        data: summaries.map(s => ({
          filePath: s.filePath,
          fileName: s.fileName,
          title: s.metadata.title,
          description: s.metadata.description,
          project: s.metadata.project || '',
          type: s.metadata.type || '',
        }))
      });
    }
  }

  /**
   * 搜索聊天摘要
   */
  private async search(query: string, filter: string): Promise<void> {
    if (!this._view) {
      return;
    }

    let summaries = await this._storageService.getAllChatSummaries();

    // 应用搜索
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      summaries = summaries.filter(s => 
        s.metadata.title.toLowerCase().includes(lowerQuery) ||
        s.metadata.description.toLowerCase().includes(lowerQuery) ||
        (s.metadata.project && s.metadata.project.toLowerCase().includes(lowerQuery))
      );
    }

    // 应用类型筛选
    if (filter && filter !== 'all') {
      summaries = summaries.filter(s => s.metadata.type === filter);
    }

    this._view.webview.postMessage({
      type: 'updateList',
      data: summaries.map(s => ({
        filePath: s.filePath,
        fileName: s.fileName,
        title: s.metadata.title,
        description: s.metadata.description,
        project: s.metadata.project || '',
        type: s.metadata.type || '',
      }))
    });
  }

  /**
   * 生成WebView HTML
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>My Last Chat</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      padding: 0;
    }
    
    .container {
      padding: 8px;
    }
    
    .search-container {
      margin-bottom: 12px;
    }
    
    .search-input {
      width: 100%;
      padding: 6px 10px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 4px;
      font-size: 13px;
      outline: none;
    }
    
    .search-input:focus {
      border-color: var(--vscode-focusBorder);
    }
    
    .filter-container {
      margin-bottom: 12px;
    }
    
    .filter-select {
      width: 100%;
      padding: 6px 10px;
      background-color: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border, transparent);
      border-radius: 4px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }
    
    .chat-list {
      list-style: none;
    }
    
    .chat-item {
      padding: 10px 12px;
      margin-bottom: 6px;
      background-color: var(--vscode-list-inactiveSelectionBackground);
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    
    .chat-item:hover {
      background-color: var(--vscode-list-hoverBackground);
    }
    
    .chat-title {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
      color: var(--vscode-foreground);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .chat-project {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 500;
    }
    
    .chat-type {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .chat-type.coding {
      background-color: #4caf50;
      color: white;
    }
    
    .chat-type.debug {
      background-color: #f44336;
      color: white;
    }
    
    .chat-type.planning {
      background-color: #2196f3;
      color: white;
    }
    
    .chat-type.spec {
      background-color: #9c27b0;
      color: white;
    }
    
    .chat-description {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--vscode-descriptionForeground);
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    
    .empty-state-text {
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="search-container">
      <input 
        type="text" 
        class="search-input" 
        id="searchInput" 
        placeholder="搜索聊天摘要..."
      >
    </div>
    
    <div class="filter-container">
      <select class="filter-select" id="filterSelect">
        <option value="all">所有类型</option>
        <option value="coding">Coding</option>
        <option value="debug">Debug</option>
        <option value="planning">Planning</option>
        <option value="spec">Spec</option>
      </select>
    </div>
    
    <ul class="chat-list" id="chatList">
      <li class="empty-state">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-text">加载中...</div>
      </li>
    </ul>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const chatList = document.getElementById('chatList');
    
    let debounceTimer;
    
    // 搜索输入事件
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        vscode.postMessage({
          type: 'search',
          query: searchInput.value,
          filter: filterSelect.value
        });
      }, 300);
    });
    
    // 筛选选择事件
    filterSelect.addEventListener('change', () => {
      vscode.postMessage({
        type: 'search',
        query: searchInput.value,
        filter: filterSelect.value
      });
    });
    
    // 处理来自扩展的消息
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.type) {
        case 'updateList':
          renderChatList(message.data);
          break;
      }
    });
    
    // 渲染聊天列表
    function renderChatList(items) {
      if (!items || items.length === 0) {
        chatList.innerHTML = \`
          <li class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">没有找到聊天摘要</div>
          </li>
        \`;
        return;
      }
      
      chatList.innerHTML = items.map(item => \`
        <li class="chat-item" data-path="\${escapeHtml(item.filePath)}">
          <div class="chat-title">
            <span>\${escapeHtml(item.title)}</span>
            \${item.project ? \`<span class="chat-project">\${escapeHtml(item.project)}</span>\` : ''}
            \${item.type ? \`<span class="chat-type \${item.type}">\${item.type}</span>\` : ''}
          </div>
          <div class="chat-description">\${escapeHtml(item.description)}</div>
        </li>
      \`).join('');
      
      // 添加点击事件
      document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
          vscode.postMessage({
            type: 'openFile',
            filePath: item.dataset.path
          });
        });
      });
    }
    
    // HTML转义
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // 通知扩展WebView已准备好
    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
  }

  /**
   * 生成nonce
   */
  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
