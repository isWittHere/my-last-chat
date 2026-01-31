import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { ChatListViewProvider, ChatListPanel } from './webview';
import { registerTools } from './tools';

let chatListProvider: ChatListViewProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('My Last Chat extension is now active!');

  // 初始化存储服务
  const storageService = ChatStorageService.getInstance(context);

  // 注册WebView视图提供者
  chatListProvider = new ChatListViewProvider(context.extensionUri, storageService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatListViewProvider.viewType,
      chatListProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // 注册 WebviewPanel 序列化器，支持重载后恢复编辑器面板
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(ChatListPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        // 使用 revive 方法恢复面板
        ChatListPanel.revive(webviewPanel, context.extensionUri, storageService);
      }
    })
  );

  // 注册刷新命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.refresh', async () => {
      await chatListProvider.refresh();
      vscode.window.showInformationMessage(vscode.l10n.t('Chat list refreshed'));
    })
  );

  // 注册新建聊天摘要命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.createNew', async () => {
      const filePath = await storageService.createNewChatSummary();
      if (filePath) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
        await chatListProvider.refresh();
      } else {
        vscode.window.showErrorMessage(vscode.l10n.t('Failed to create chat summary'));
      }
    })
  );

  // 注册打开设置命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'myLastChat');
    })
  );

  // 注册打开文件命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.openFile', async (filePath: string) => {
      if (filePath) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
      }
    })
  );

  // 注册在编辑器中打开面板命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.openInEditor', () => {
      ChatListPanel.createOrShow(context.extensionUri, storageService);
    })
  );

  // 注册从编辑器面板创建新摘要命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.createNewFromPanel', async () => {
      const filePath = await storageService.createNewChatSummary();
      if (filePath) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document, {
          viewColumn: vscode.ViewColumn.Active,
          preserveFocus: false
        });
        // 刷新面板列表
        if (ChatListPanel.currentPanel) {
          ChatListPanel.currentPanel.refresh();
        }
      } else {
        vscode.window.showErrorMessage(vscode.l10n.t('Failed to create chat summary'));
      }
    })
  );

  // 注册LM工具供Copilot调用
  registerTools(context);

  // 监听文件变化以自动刷新
  // 同时刷新侧边栏和编辑器面板
  const debouncedRefresh = debounce(() => {
    chatListProvider.refresh();
    // 同时刷新编辑器面板（如果存在）
    if (ChatListPanel.currentPanel) {
      ChatListPanel.currentPanel.refresh();
    }
  }, 300);

  // 监听工作区存储路径（包括子文件夹）
  const workspacePath = storageService.getWorkspaceStoragePath();
  if (workspacePath) {
    const workspaceWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspacePath, '**/*.md')
    );
    workspaceWatcher.onDidCreate(() => debouncedRefresh());
    workspaceWatcher.onDidChange(() => debouncedRefresh());
    workspaceWatcher.onDidDelete(() => debouncedRefresh());
    context.subscriptions.push(workspaceWatcher);
  }

  // 监听全局存储路径（如果不同于工作区路径，包括子文件夹）
  const globalPath = storageService.getGlobalStoragePath();
  if (globalPath !== workspacePath) {
    const globalWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(globalPath, '**/*.md')
    );
    globalWatcher.onDidCreate(() => debouncedRefresh());
    globalWatcher.onDidChange(() => debouncedRefresh());
    globalWatcher.onDidDelete(() => debouncedRefresh());
    context.subscriptions.push(globalWatcher);
  }
  
  // 也监听文档保存事件
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.fileName.includes('.myLastChat') && doc.fileName.endsWith('.md')) {
        debouncedRefresh();
      }
    })
  );
}

// 防抖函数
function debounce(fn: () => void, delay: number): () => void {
  let timer: NodeJS.Timeout | undefined;
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

export function deactivate() {
  console.log('My Last Chat extension is now deactivated.');
}
