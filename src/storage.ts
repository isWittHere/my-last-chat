import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';
import { ChatMetadata, ChatSummary, FeedbackLevel, SearchResult, StorageScope, SubWorkspaceInfo } from './types';

/**
 * 聊天摘要存储服务
 * 负责管理.myLastChat文件夹中的md文件
 */
export class ChatStorageService {
  private static instance: ChatStorageService;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  static getInstance(context?: vscode.ExtensionContext): ChatStorageService {
    if (!ChatStorageService.instance && context) {
      ChatStorageService.instance = new ChatStorageService(context);
    }
    return ChatStorageService.instance;
  }

  /**
   * 获取工作区存储路径
   */
  getWorkspaceStoragePath(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return path.join(workspaceFolders[0].uri.fsPath, '.myLastChat');
    }
    return null;
  }

  /**
   * 获取全局存储路径
   */
  getGlobalStoragePath(): string {
    const config = vscode.workspace.getConfiguration('myLastChat');
    const globalPath = config.get<string>('globalStoragePath');
    if (globalPath && globalPath.trim() !== '') {
      return path.join(globalPath, '.myLastChat');
    }
    return path.join(this.context.globalStorageUri.fsPath, '.myLastChat');
  }

  /**
   * 获取存储路径（基于配置）
   */
  getStoragePath(): string {
    const config = vscode.workspace.getConfiguration('myLastChat');
    const storageLocation = config.get<string>('storageLocation', 'workspace');

    if (storageLocation === 'global') {
      return this.getGlobalStoragePath();
    }

    // 工作区存储
    const workspacePath = this.getWorkspaceStoragePath();
    if (workspacePath) {
      return workspacePath;
    }

    // 回退到全局存储
    return this.getGlobalStoragePath();
  }

  /**
   * 确保存储目录存在
   */
  async ensureStorageDirectory(storagePath?: string): Promise<void> {
    const targetPath = storagePath || this.getStoragePath();
    try {
      await fs.promises.mkdir(targetPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  /**
   * 从指定路径获取所有聊天摘要文件（包括第二层子文件夹）
   */
  async getChatSummariesFromPath(storagePath: string, scope: StorageScope): Promise<ChatSummary[]> {
    const summaries: ChatSummary[] = [];

    try {
      await this.ensureStorageDirectory(storagePath);
      const entries = await fs.promises.readdir(storagePath, { withFileTypes: true });
      
      // 处理根目录下的 md 文件
      const mdFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.md'));
      for (const file of mdFiles) {
        const filePath = path.join(storagePath, file.name);
        const summary = await this.parseChatFile(filePath);
        if (summary) {
          (summary as any).scope = scope;
          summaries.push(summary);
        }
      }

      // 处理子文件夹（仅第二层）
      const subDirs = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));
      for (const dir of subDirs) {
        const subDirPath = path.join(storagePath, dir.name);
        try {
          const subEntries = await fs.promises.readdir(subDirPath, { withFileTypes: true });
          const subMdFiles = subEntries.filter(entry => entry.isFile() && entry.name.endsWith('.md'));
          
          for (const file of subMdFiles) {
            const filePath = path.join(subDirPath, file.name);
            const summary = await this.parseChatFile(filePath);
            if (summary) {
              (summary as any).scope = scope;
              (summary as any).folderName = dir.name;
              (summary as any).folderPath = subDirPath;
              summaries.push(summary);
            }
          }
        } catch (subError) {
          // 子目录读取失败时静默失败
        }
      }
    } catch (error) {
      // 目录不存在时静默失败
    }

    return summaries;
  }

  /**
   * 获取所有聊天摘要文件（根据 scope）
   * scope 可以是 'workspace' | 'global' | 'all'，或者具体的子工作区路径数组
   */
  async getAllChatSummaries(scope: StorageScope | string[] = 'all'): Promise<ChatSummary[]> {
    const summaries: ChatSummary[] = [];

    // 如果 scope 是路径数组，按子工作区路径筛选
    if (Array.isArray(scope)) {
      for (const wsPath of scope) {
        const chatPath = path.join(wsPath, '.myLastChat');
        const wsSummaries = await this.getChatSummariesFromPath(chatPath, 'workspace');
        const wsName = path.basename(wsPath);
        for (const s of wsSummaries) {
          (s as any).workspaceName = wsName;
          (s as any).workspacePath = wsPath;
        }
        summaries.push(...wsSummaries);
      }
      return summaries;
    }

    if (scope === 'workspace' || scope === 'all') {
      const workspacePath = this.getWorkspaceStoragePath();
      if (workspacePath) {
        const workspaceSummaries = await this.getChatSummariesFromPath(workspacePath, 'workspace');
        // 标记主工作区名称
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
          const mainWsName = path.basename(workspaceFolders[0].uri.fsPath);
          const mainWsPath = workspaceFolders[0].uri.fsPath;
          for (const s of workspaceSummaries) {
            (s as any).workspaceName = mainWsName;
            (s as any).workspacePath = mainWsPath;
          }
        }
        summaries.push(...workspaceSummaries);
      }

      // 扫描子工作区（排除隐藏的）
      const subWorkspaces = await this.discoverSubWorkspaces();
      const hiddenConfig = vscode.workspace.getConfiguration('myLastChat');
      const hiddenWorkspaces: string[] = hiddenConfig.get('hiddenWorkspaces', []);
      
      for (const sw of subWorkspaces) {
        if (sw.hasChatStorage && !hiddenWorkspaces.includes(sw.path)) {
          const swSummaries = await this.getChatSummariesFromPath(sw.chatStoragePath, 'workspace');
          for (const s of swSummaries) {
            (s as any).workspaceName = sw.name;
            (s as any).workspacePath = sw.path;
          }
          summaries.push(...swSummaries);
        }
      }
    }

    if (scope === 'global' || scope === 'all') {
      const hiddenCfg = vscode.workspace.getConfiguration('myLastChat');
      const hidden: string[] = hiddenCfg.get('hiddenWorkspaces', []);
      
      if (!hidden.includes('__global__')) {
        const globalPath = this.getGlobalStoragePath();
        // 避免重复（如果工作区路径和全局路径相同）
        const workspacePath = this.getWorkspaceStoragePath();
        if (globalPath !== workspacePath) {
          const globalSummaries = await this.getChatSummariesFromPath(globalPath, 'global');
          summaries.push(...globalSummaries);
        }
      }
    }

    return summaries;
  }

  /**
   * 发现主工作区下的子工作区（含 .git 的一级子文件夹）
   */
  async discoverSubWorkspaces(): Promise<SubWorkspaceInfo[]> {
    const subWorkspaces: SubWorkspaceInfo[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return subWorkspaces;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    try {
      const entries = await fs.promises.readdir(rootPath, { withFileTypes: true });
      const subDirs = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

      for (const dir of subDirs) {
        const dirPath = path.join(rootPath, dir.name);
        const gitPath = path.join(dirPath, '.git');

        try {
          const gitStat = await fs.promises.stat(gitPath);
          if (gitStat.isDirectory()) {
            const chatStoragePath = path.join(dirPath, '.myLastChat');
            let hasChatStorage = false;
            try {
              const chatStat = await fs.promises.stat(chatStoragePath);
              hasChatStorage = chatStat.isDirectory();
            } catch {
              // .myLastChat 不存在
            }

            subWorkspaces.push({
              name: dir.name,
              path: dirPath,
              chatStoragePath,
              hasChatStorage,
            });
          }
        } catch {
          // .git 不存在，跳过
        }
      }
    } catch (error) {
      console.error('Failed to discover sub-workspaces:', error);
    }

    return subWorkspaces;
  }

  /**
   * 获取所有可用的工作区信息（主工作区 + 子工作区）
   */
  async getAvailableWorkspaces(): Promise<{ name: string; path: string; isMain: boolean }[]> {
    const workspaces: { name: string; path: string; isMain: boolean }[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
      const mainPath = workspaceFolders[0].uri.fsPath;
      const mainChatPath = path.join(mainPath, '.myLastChat');
      let mainHasChat = false;
      try {
        const stat = await fs.promises.stat(mainChatPath);
        mainHasChat = stat.isDirectory();
      } catch { }

      if (mainHasChat) {
        workspaces.push({
          name: path.basename(mainPath),
          path: mainPath,
          isMain: true,
        });
      }
    }

    const subWorkspaces = await this.discoverSubWorkspaces();
    const config = vscode.workspace.getConfiguration('myLastChat');
    const hiddenWorkspaces: string[] = config.get('hiddenWorkspaces', []);
    
    for (const sw of subWorkspaces) {
      if (sw.hasChatStorage && !hiddenWorkspaces.includes(sw.path)) {
        workspaces.push({
          name: sw.name,
          path: sw.path,
          isMain: false,
        });
      }
    }

    return workspaces;
  }

  /**
   * 检查 Global 是否被隐藏
   */
  isGlobalHidden(): boolean {
    const config = vscode.workspace.getConfiguration('myLastChat');
    const hidden: string[] = config.get('hiddenWorkspaces', []);
    return hidden.includes('__global__');
  }

  /**
   * 获取工作区图标映射
   */
  getWorkspaceIcons(): Record<string, string> {
    const config = vscode.workspace.getConfiguration('myLastChat');
    return config.get('workspaceIcons', {});
  }

  /**
   * 解析聊天摘要文件
   */
  async parseChatFile(filePath: string): Promise<ChatSummary | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = matter(content);
      
      // Get file stats for timestamps
      const stats = await fs.promises.stat(filePath);

      const metadata: ChatMetadata = {
        title: parsed.data.title || path.basename(filePath, '.md'),
        description: parsed.data.description || '',
        workplace: parsed.data.workplace || '',
        project: parsed.data.project,
        type: parsed.data.type,
        solved_lists: parsed.data.solved_lists,
        createdAt: parsed.data.createdAt || stats.birthtime.toISOString(),
        updatedAt: parsed.data.updatedAt || stats.mtime.toISOString(),
        favorite: parsed.data.favorite || false,
        tags: parsed.data.tags || [],
      };

      return {
        filePath,
        fileName: path.basename(filePath),
        metadata,
        content: parsed.content,
      };
    } catch (error) {
      console.error(`Failed to parse chat file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 根据FeedbackLevel格式化搜索结果
   */
  formatResult(summary: ChatSummary, level: FeedbackLevel): SearchResult {
    const result: SearchResult = {
      filePath: summary.filePath,
      fileName: summary.fileName,
      title: summary.metadata.title,
      folderName: summary.folderName,
      folderPath: summary.folderPath,
    };

    switch (level) {
      case 'TITLE_ONLY':
        break;
      case 'DESCRIPTION':
        result.description = summary.metadata.description;
        break;
      case 'META':
        result.metadata = summary.metadata;
        break;
      case 'ALL':
        result.metadata = summary.metadata;
        result.content = summary.content;
        break;
    }

    return result;
  }

  /**
   * 通过标题搜索
   */
  async searchByTitle(keywords: string[], feedbackLevel: FeedbackLevel = 'DESCRIPTION', scope: StorageScope = 'all'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries(scope);
    const results: SearchResult[] = [];

    for (const summary of summaries) {
      const title = summary.metadata.title.toLowerCase();
      const matched = keywords.some(keyword => 
        title.includes(keyword.toLowerCase())
      );

      if (matched) {
        const result = this.formatResult(summary, feedbackLevel);
        result.scope = (summary as any).scope;
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 通过元数据搜索
   */
  async searchByMeta(keywords: string[], feedbackLevel: FeedbackLevel = 'META', scope: StorageScope = 'all'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries(scope);
    const results: SearchResult[] = [];

    for (const summary of summaries) {
      const meta = summary.metadata;
      const searchableText = [
        meta.title,
        meta.description,
        meta.workplace,
        meta.project || '',
        meta.type || '',
        ...(meta.solved_lists || []),
      ].join(' ').toLowerCase();

      const matched = keywords.some(keyword => 
        searchableText.includes(keyword.toLowerCase())
      );

      if (matched) {
        const result = this.formatResult(summary, feedbackLevel);
        result.scope = (summary as any).scope;
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 获取聊天列表
   */
  async getLastChatsList(feedbackLevel: FeedbackLevel = 'DESCRIPTION', scope: StorageScope = 'all'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries(scope);
    return summaries.map(summary => {
      const result = this.formatResult(summary, feedbackLevel);
      result.scope = (summary as any).scope;
      return result;
    });
  }

  /**
   * 创建新的聊天摘要文件
   * 优先创建到工作区，如果没有工作区则创建到全局
   */
  async createNewChatSummary(): Promise<string | null> {
    // 优先使用工作区路径
    const workspacePath = this.getWorkspaceStoragePath();
    const storagePath = workspacePath || this.getGlobalStoragePath();
    
    await this.ensureStorageDirectory(storagePath);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `chat-${timestamp}.md`;
    const filePath = path.join(storagePath, fileName);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const defaultWorkplace = workspaceFolders && workspaceFolders.length > 0 
      ? workspaceFolders[0].uri.fsPath 
      : '';

    const now = new Date().toISOString();
    const template = `---
title: ${vscode.l10n.t('New Chat Summary')}
description: ${vscode.l10n.t('Please enter chat description')}
workplace: ${defaultWorkplace}
project: 
type: 
createdAt: ${now}
updatedAt: ${now}
favorite: false
tags: []
solved_lists:
  - 
---

# ${vscode.l10n.t('Chat Summary')}

${vscode.l10n.t('Record chat content here...')}
`;

    try {
      await fs.promises.writeFile(filePath, template, 'utf-8');
      return filePath;
    } catch (error) {
      console.error('Failed to create new chat summary:', error);
      return null;
    }
  }

  /**
   * 在指定文件夹内创建新的聊天摘要文件
   */
  async createNewSummaryInFolder(folderPath: string): Promise<string | null> {
    try {
      // 确保文件夹存在
      await fs.promises.mkdir(folderPath, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `chat-${timestamp}.md`;
      const filePath = path.join(folderPath, fileName);

      const workspaceFolders = vscode.workspace.workspaceFolders;
      const defaultWorkplace = workspaceFolders && workspaceFolders.length > 0 
        ? workspaceFolders[0].uri.fsPath 
        : '';

      const now = new Date().toISOString();
      const template = `---
title: ${vscode.l10n.t('New Chat Summary')}
description: ${vscode.l10n.t('Please enter chat description')}
workplace: ${defaultWorkplace}
project: 
type: 
createdAt: ${now}
updatedAt: ${now}
favorite: false
tags: []
solved_lists:
  - 
---

# ${vscode.l10n.t('Chat Summary')}

${vscode.l10n.t('Record chat content here...')}
`;

      await fs.promises.writeFile(filePath, template, 'utf-8');
      
      // 打开新创建的文件
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);
      
      return filePath;
    } catch (error) {
      console.error('Failed to create new chat summary in folder:', error);
      return null;
    }
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(filePath: string): Promise<boolean> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = matter(content);
      
      // 切换收藏状态
      parsed.data.favorite = !parsed.data.favorite;
      parsed.data.updatedAt = new Date().toISOString();
      
      // 重新生成文件内容
      const newContent = matter.stringify(parsed.content, parsed.data);
      await fs.promises.writeFile(filePath, newContent, 'utf-8');
      
      return parsed.data.favorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }

  /**
   * 删除聊天文件
   */
  async deleteChatFile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete chat file:', error);
      return false;
    }
  }
}
