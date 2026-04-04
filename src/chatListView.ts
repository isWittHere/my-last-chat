import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { ChatSummary } from './types';
import { generateWebviewHtml, WebviewDataItem } from './webviewTemplate';

/**
 * 聊天列表 WebView 视图提供者（侧边栏）
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

    webviewView.webview.html = generateWebviewHtml(webviewView.webview, this._extensionUri, {
      isPanel: false
    });

    // 处理来自 WebView 的消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      await this._handleMessage(data);
    });
  }

  /**
   * 发送设置到 webview
   */
  private _sendSettings(): void {
    if (this._view) {
      const config = vscode.workspace.getConfiguration('myLastChat');
      this._view.webview.postMessage({
        type: 'settings',
        autoHideControls: config.get('autoHideControls', false)
      });
    }
  }

  /**
   * 处理来自 WebView 的消息
   */
  private async _handleMessage(data: any): Promise<void> {
    switch (data.type) {
      case 'refresh':
        await this.refresh();
        break;
      case 'openFile':
        const document = await vscode.workspace.openTextDocument(data.filePath);
        await vscode.window.showTextDocument(document);
        break;
      case 'search':
        await this._search(data.query, data.filter, data.showFavoritesOnly, data.sortBy, data.scope);
        break;
      case 'ready':
        // 使用 webview 传递的筛选参数
        const scope = data.scope || ['all'];
        const filter = data.filter || ['all'];
        const sortBy = data.sortBy || 'updated-desc';
        const showFavoritesOnly = data.showFavoritesOnly || false;
        
        // 发送可用工作区列表
        const workspaces = await this._storageService.getAvailableWorkspaces();
        this._view?.webview.postMessage({
          type: 'updateWorkspaces',
          workspaces: workspaces,
          showGlobal: !this._storageService.isGlobalHidden(),
          workspaceIcons: this._storageService.getWorkspaceIcons()
        });
        
        // 使用确定的范围进行搜索
        await this._search('', filter, showFavoritesOnly, sortBy, scope);
        
        // 发送设置给 webview
        this._sendSettings();
        break;
      case 'toggleFavorite':
        await this._storageService.toggleFavorite(data.filePath);
        await this.refresh();
        break;
      case 'deleteFile':
        const confirm = await vscode.window.showWarningMessage(
          `确定要删除 "${data.fileName}" 吗？`,
          { modal: true },
          '删除'
        );
        if (confirm === '删除') {
          await this._storageService.deleteChatFile(data.filePath);
          await this.refresh();
        }
        break;
      case 'copyLink':
        await vscode.env.clipboard.writeText(data.filePath);
        vscode.window.showInformationMessage('文件路径已复制到剪贴板');
        break;
      case 'attachToChat':
        await vscode.commands.executeCommand('workbench.action.chat.attachFile', vscode.Uri.file(data.filePath));
        break;
      case 'createInFolder':
        await this._storageService.createNewSummaryInFolder(data.folderPath);
        await this.refresh();
        break;
    }
  }

  /**
   * 刷新聊天列表
   * 通过通知 webview 触发搜索，保持当前的筛选器状态
   */
  public async refresh(): Promise<void> {
    if (this._view) {
      // 重新发送工作区列表
      const workspaces = await this._storageService.getAvailableWorkspaces();
      this._view.webview.postMessage({
        type: 'updateWorkspaces',
        workspaces: workspaces,
        showGlobal: !this._storageService.isGlobalHidden(),
        workspaceIcons: this._storageService.getWorkspaceIcons()
      });
      // 通知 webview 使用当前筛选状态重新搜索
      this._view.webview.postMessage({
        type: 'triggerSearch'
      });
    }
  }

  /**
   * 搜索聊天摘要
   */
  private async _search(
    query: string,
    filter: string | string[],
    showFavoritesOnly: boolean = false,
    sortBy: string = 'updated-desc',
    scope: string | string[] = 'all'
  ): Promise<void> {
    if (!this._view) {
      return;
    }

    // 解析 scope：支持数组或字符串
    let summaries: ChatSummary[] | undefined;
    const scopeArr = Array.isArray(scope) ? scope : [scope];
    
    if (scopeArr.includes('all')) {
      summaries = await this._storageService.getAllChatSummaries('all');
    } else {
      // 收集所有选中的工作区路径和特殊范围
      const workspacePaths: string[] = [];
      let includeGlobal = false;
      
      for (const s of scopeArr) {
        if (s === 'global') {
          includeGlobal = true;
        } else if (s === 'workspace') {
          summaries = await this._storageService.getAllChatSummaries('workspace');
        } else {
          // 具体的工作区路径
          workspacePaths.push(s);
        }
      }
      
      if (workspacePaths.length > 0) {
        const pathSummaries = await this._storageService.getAllChatSummaries(workspacePaths);
        summaries = summaries ? [...summaries, ...pathSummaries] : pathSummaries;
      }
      
      if (includeGlobal) {
        const globalSummaries = await this._storageService.getAllChatSummaries('global');
        summaries = summaries ? [...summaries, ...globalSummaries] : globalSummaries;
      }
      
      if (!summaries) {
        summaries = [];
      }
    }

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
    const filterArr = Array.isArray(filter) ? filter : [filter];
    if (!filterArr.includes('all')) {
      summaries = summaries.filter(s => filterArr.includes(s.metadata.type || ''));
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

    this._view.webview.postMessage({
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
      folderName: s.folderName || undefined,
      folderPath: s.folderPath || undefined,
      workspaceName: s.workspaceName || undefined,
      workspacePath: s.workspacePath || undefined,
    }));
  }

  /**
   * 获取存储服务
   */
  public getStorageService(): ChatStorageService {
    return this._storageService;
  }
}
