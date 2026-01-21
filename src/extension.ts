import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { ChatListViewProvider } from './webview';
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

  // 注册刷新命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.refresh', async () => {
      await chatListProvider.refresh();
      vscode.window.showInformationMessage('聊天列表已刷新');
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
        vscode.window.showErrorMessage('创建聊天摘要失败');
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

  // 注册LM工具供Copilot调用
  registerTools(context);

  // 监听文件变化以自动刷新
  const watcher = vscode.workspace.createFileSystemWatcher('**/.myLastChat/*.md');
  watcher.onDidCreate(() => chatListProvider.refresh());
  watcher.onDidChange(() => chatListProvider.refresh());
  watcher.onDidDelete(() => chatListProvider.refresh());
  context.subscriptions.push(watcher);
}

export function deactivate() {
  console.log('My Last Chat extension is now deactivated.');
}
