import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { generateWebviewHtml, WebviewDataItem } from './webviewTemplate';

/**
 * 编辑器中的聊天列表面板
 */
export class ChatListPanel {
  public static currentPanel: ChatListPanel | undefined;
  public static readonly viewType = 'myLastChat.chatListPanel';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _storageService: ChatStorageService;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, storageService: ChatStorageService) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // 如果已有面板，显示它
    if (ChatListPanel.currentPanel) {
      ChatListPanel.currentPanel._panel.reveal(column);
      return;
    }

    // 创建新面板
    const panel = vscode.window.createWebviewPanel(
      ChatListPanel.viewType,
      'My Last Chat',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true
      }
    );

    ChatListPanel.currentPanel = new ChatListPanel(panel, extensionUri, storageService);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    storageService: ChatStorageService
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._storageService = storageService;

    // 设置初始 HTML
    this._update();

    // 监听面板关闭
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 监听面板状态变化，当面板重新显示时刷新数据
    this._panel.onDidChangeViewState(
      async (e) => {
        if (e.webviewPanel.visible) {
          await this._refresh();
        }
      },
      null,
      this._disposables
    );

    // 处理消息
    this._panel.webview.onDidReceiveMessage(
      async (data) => {
        await this._handleMessage(data);
      },
      null,
      this._disposables
    );
  }

  /**
   * 处理来自 WebView 的消息
   */
  private async _handleMessage(data: any): Promise<void> {
    switch (data.type) {
      case 'refresh':
        await this._refresh();
        break;
      case 'openFile':
        // 检查文件是否已经打开
        const existingDoc = vscode.workspace.textDocuments.find(
          doc => doc.uri.fsPath === data.filePath
        );
        if (existingDoc) {
          // 文件已打开，查找并激活对应的编辑器
          const editors = vscode.window.visibleTextEditors;
          const existingEditor = editors.find(
            e => e.document.uri.fsPath === data.filePath
          );
          if (existingEditor) {
            // 激活已存在的编辑器
            await vscode.window.showTextDocument(existingDoc, existingEditor.viewColumn);
          } else {
            // 文档已打开但不可见，优先在当前活动列打开
            await vscode.window.showTextDocument(existingDoc, {
              viewColumn: vscode.ViewColumn.Active,
              preserveFocus: false
            });
          }
        } else {
          // 文件未打开，优先在当前活动列打开
          const document = await vscode.workspace.openTextDocument(data.filePath);
          await vscode.window.showTextDocument(document, {
            viewColumn: vscode.ViewColumn.Active,
            preserveFocus: false
          });
        }
        break;
      case 'search':
        await this._search(data.query, data.filter, data.showFavoritesOnly, data.sortBy, data.scope);
        break;
      case 'ready':
        await this._refresh();
        break;
      case 'toggleFavorite':
        await this._storageService.toggleFavorite(data.filePath);
        await this._refresh();
        break;
      case 'deleteFile':
        const confirm = await vscode.window.showWarningMessage(
          `确定要删除 "${data.fileName}" 吗？`,
          { modal: true },
          '删除'
        );
        if (confirm === '删除') {
          await this._storageService.deleteChatFile(data.filePath);
          await this._refresh();
        }
        break;
      case 'copyLink':
        await vscode.env.clipboard.writeText(data.filePath);
        vscode.window.showInformationMessage('文件路径已复制到剪贴板');
        break;
      case 'attachToChat':
        await vscode.commands.executeCommand('workbench.action.chat.attachFile', vscode.Uri.file(data.filePath));
        break;
    }
  }

  public dispose() {
    ChatListPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    this._panel.webview.html = generateWebviewHtml(this._panel.webview, this._extensionUri, {
      isPanel: true,
      placeholder: '搜索聊天摘要...'
    });
  }

  /**
   * 公共刷新方法，供外部调用
   */
  public async refresh(): Promise<void> {
    await this._refresh();
  }

  private async _refresh(): Promise<void> {
    let summaries = await this._storageService.getAllChatSummaries();
    
    // 默认按最近更新时间降序排序
    summaries.sort((a, b) => {
      const aTime = a.metadata.updatedAt || a.metadata.createdAt || '';
      const bTime = b.metadata.updatedAt || b.metadata.createdAt || '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
    
    this._panel.webview.postMessage({
      type: 'updateList',
      data: this._mapSummariesToData(summaries)
    });
  }

  private async _search(
    query: string,
    filter: string,
    showFavoritesOnly: boolean = false,
    sortBy: string = 'updated-desc',
    scope: string = 'all'
  ): Promise<void> {
    let summaries = await this._storageService.getAllChatSummaries(scope as 'workspace' | 'global' | 'all');

    // 应用收藏筛选
    if (showFavoritesOnly) {
      summaries = summaries.filter(s => s.metadata.favorite === true);
    }

    // 应用搜索
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      summaries = summaries.filter(s => 
        s.metadata.title.toLowerCase().includes(lowerQuery) ||
        s.metadata.description.toLowerCase().includes(lowerQuery) ||
        (s.metadata.project && s.metadata.project.toLowerCase().includes(lowerQuery)) ||
        (s.metadata.tags && s.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    }

    // 应用类型筛选
    if (filter && filter !== 'all') {
      summaries = summaries.filter(s => s.metadata.type === filter);
    }

    // 应用排序
    summaries.sort((a, b) => {
      const aTime = a.metadata.updatedAt || a.metadata.createdAt || '';
      const bTime = b.metadata.updatedAt || b.metadata.createdAt || '';
      const aCreated = a.metadata.createdAt || '';
      const bCreated = b.metadata.createdAt || '';
      
      switch (sortBy) {
        case 'created-desc':
          return new Date(bCreated).getTime() - new Date(aCreated).getTime();
        case 'created-asc':
          return new Date(aCreated).getTime() - new Date(bCreated).getTime();
        case 'updated-asc':
          return new Date(aTime).getTime() - new Date(bTime).getTime();
        case 'title-asc':
          return a.metadata.title.localeCompare(b.metadata.title);
        case 'title-desc':
          return b.metadata.title.localeCompare(a.metadata.title);
        case 'updated-desc':
        default:
          return new Date(bTime).getTime() - new Date(aTime).getTime();
      }
    });

    this._panel.webview.postMessage({
      type: 'updateList',
      data: this._mapSummariesToData(summaries)
    });
  }

  /**
   * 将摘要数据映射为 WebView 数据格式
   */
  private _mapSummariesToData(summaries: any[]): WebviewDataItem[] {
    return summaries.map(s => ({
      filePath: s.filePath,
      fileName: s.fileName,
      title: s.metadata.title,
      description: s.metadata.description,
      project: s.metadata.project || '',
      type: s.metadata.type || '',
      createdAt: s.metadata.createdAt || new Date().toISOString(),
      updatedAt: s.metadata.updatedAt || new Date().toISOString(),
      favorite: s.metadata.favorite || false,
      tags: s.metadata.tags || [],
      scope: (s as any).scope || 'workspace',
    }));
  }
}
