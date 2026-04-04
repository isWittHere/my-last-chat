import * as vscode from 'vscode';
import * as path from 'path';
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

  // 注册管理子工作区命令
  context.subscriptions.push(
    vscode.commands.registerCommand('myLastChat.manageWorkspaces', async () => {
      const allSubWorkspaces = await storageService.discoverSubWorkspaces();

      // 读取当前隐藏列表
      const config = vscode.workspace.getConfiguration('myLastChat');
      const hiddenWorkspaces: string[] = config.get('hiddenWorkspaces', []);

      const items: vscode.QuickPickItem[] = [];

      // 添加子工作区项
      for (const sw of allSubWorkspaces) {
        items.push({
          label: sw.name,
          description: sw.path,
          detail: sw.hasChatStorage ? vscode.l10n.t('Has .myLastChat folder') : vscode.l10n.t('No .myLastChat folder'),
          picked: !hiddenWorkspaces.includes(sw.path),
        });
      }

      // 添加全局存储项
      const globalStoragePath = storageService.getGlobalStoragePath();
      items.push({
        label: vscode.l10n.t('Global Storage'),
        description: globalStoragePath,
        detail: vscode.l10n.t('Global chat summaries storage'),
        picked: !hiddenWorkspaces.includes('__global__'),
      });

      if (items.length === 0) {
        vscode.window.showInformationMessage(vscode.l10n.t('No sub-workspaces found (folders with .git)'));
        return;
      }

      const selected = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        title: vscode.l10n.t('Select visible scopes'),
        placeHolder: vscode.l10n.t('Check the workspaces you want to display'),
      });

      if (selected !== undefined) {
        const selectedDescs = new Set(selected.map(s => s.description!));
        const newHidden: string[] = [];
        
        for (const sw of allSubWorkspaces) {
          if (!selectedDescs.has(sw.path)) {
            newHidden.push(sw.path);
          }
        }
        
        // 检查全局存储是否被选中
        if (!selectedDescs.has(globalStoragePath)) {
          newHidden.push('__global__');
        }
        
        await config.update('hiddenWorkspaces', newHidden, vscode.ConfigurationTarget.Workspace);
        await chatListProvider.refresh();
        if (ChatListPanel.currentPanel) {
          ChatListPanel.currentPanel.refresh();
        }

        // 询问是否设置工作区图标
        const iconPresets = [
          { label: '$(close) ' + vscode.l10n.t('No icon'), value: '' },
          { label: '$(home) home', value: 'home' },
          { label: '$(folder) folder', value: 'folder' },
          { label: '$(repo) repo', value: 'repo' },
          { label: '$(project) project', value: 'project' },
          { label: '$(database) database', value: 'database' },
          { label: '$(cloud) cloud', value: 'cloud' },
          { label: '$(globe) globe', value: 'globe' },
          { label: '$(server) server', value: 'server' },
          { label: '$(tools) tools', value: 'tools' },
          { label: '$(beaker) beaker', value: 'beaker' },
          { label: '$(heart) heart', value: 'heart' },
          { label: '$(star-full) star', value: 'star-full' },
          { label: '$(zap) zap', value: 'zap' },
          { label: '$(flame) flame', value: 'flame' },
          { label: '$(rocket) rocket', value: 'rocket' },
          { label: '$(compass) compass', value: 'compass' },
          { label: '$(package) package', value: 'package' },
          { label: '$(archive) archive', value: 'archive' },
          { label: '$(bookmark) bookmark', value: 'bookmark' },
          { label: '$(tag) tag', value: 'tag' },
          { label: '$(terminal) terminal', value: 'terminal' },
          { label: '$(lightbulb) lightbulb', value: 'lightbulb' },
          { label: '$(shield) shield', value: 'shield' },
        ];

        // 构建可设置图标的工作区列表（可见的）
        const visibleWorkspaces: { label: string; path: string }[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
          const mainPath = workspaceFolders[0].uri.fsPath;
          visibleWorkspaces.push({ label: path.basename(mainPath), path: mainPath });
        }
        for (const sw of allSubWorkspaces) {
          if (!newHidden.includes(sw.path)) {
            visibleWorkspaces.push({ label: sw.name, path: sw.path });
          }
        }

        if (visibleWorkspaces.length > 0) {
          const workspaceIcons: Record<string, string> = config.get('workspaceIcons', {});
          const wsToSet = await vscode.window.showQuickPick(
            visibleWorkspaces.map(ws => {
              const currentIcon = workspaceIcons[ws.path];
              return {
                label: (currentIcon ? `$(${currentIcon}) ` : '') + ws.label,
                description: currentIcon ? currentIcon : vscode.l10n.t('No icon'),
                detail: ws.path,
              };
            }),
            {
              title: vscode.l10n.t('Set Workspace Icon'),
              placeHolder: vscode.l10n.t('Select a workspace to set its icon (Esc to skip)'),
            }
          );

          if (wsToSet) {
            const wsPath = wsToSet.detail!;
            const iconChoice = await vscode.window.showQuickPick(iconPresets, {
              title: vscode.l10n.t('Choose Icon for {0}', wsToSet.label.replace(/^\$\([^)]+\)\s*/, '')),
              placeHolder: vscode.l10n.t('Select an icon'),
            });

            if (iconChoice) {
              const updatedIcons = { ...workspaceIcons };
              if (iconChoice.value) {
                updatedIcons[wsPath] = iconChoice.value;
              } else {
                delete updatedIcons[wsPath];
              }
              await config.update('workspaceIcons', updatedIcons, vscode.ConfigurationTarget.Workspace);
              await chatListProvider.refresh();
              if (ChatListPanel.currentPanel) {
                ChatListPanel.currentPanel.refresh();
              }
            }
          }
        }
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
