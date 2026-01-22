import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';
import { ChatMetadata, ChatSummary, FeedbackLevel, SearchResult, StorageScope } from './types';

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
   * 从指定路径获取所有聊天摘要文件
   */
  async getChatSummariesFromPath(storagePath: string, scope: StorageScope): Promise<ChatSummary[]> {
    const summaries: ChatSummary[] = [];

    try {
      await this.ensureStorageDirectory(storagePath);
      const files = await fs.promises.readdir(storagePath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      for (const file of mdFiles) {
        const filePath = path.join(storagePath, file);
        const summary = await this.parseChatFile(filePath);
        if (summary) {
          (summary as any).scope = scope;
          summaries.push(summary);
        }
      }
    } catch (error) {
      // 目录不存在时静默失败
    }

    return summaries;
  }

  /**
   * 获取所有聊天摘要文件（根据 scope）
   */
  async getAllChatSummaries(scope: StorageScope = 'all'): Promise<ChatSummary[]> {
    const summaries: ChatSummary[] = [];

    if (scope === 'workspace' || scope === 'all') {
      const workspacePath = this.getWorkspaceStoragePath();
      if (workspacePath) {
        const workspaceSummaries = await this.getChatSummariesFromPath(workspacePath, 'workspace');
        summaries.push(...workspaceSummaries);
      }
    }

    if (scope === 'global' || scope === 'all') {
      const globalPath = this.getGlobalStoragePath();
      // 避免重复（如果工作区路径和全局路径相同）
      const workspacePath = this.getWorkspaceStoragePath();
      if (globalPath !== workspacePath) {
        const globalSummaries = await this.getChatSummariesFromPath(globalPath, 'global');
        summaries.push(...globalSummaries);
      }
    }

    return summaries;
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
title: 新聊天摘要
description: 请填写聊天描述
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

# 聊天摘要

在此处记录聊天内容...
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
