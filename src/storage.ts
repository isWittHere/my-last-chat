import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';
import { ChatMetadata, ChatSummary, FeedbackLevel, SearchResult } from './types';

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
   * 获取存储路径
   */
  getStoragePath(): string {
    const config = vscode.workspace.getConfiguration('myLastChat');
    const storageLocation = config.get<string>('storageLocation', 'workspace');

    if (storageLocation === 'global') {
      const globalPath = config.get<string>('globalStoragePath');
      if (globalPath && globalPath.trim() !== '') {
        return path.join(globalPath, '.myLastChat');
      }
      // 使用VSCode的全局存储路径
      return path.join(this.context.globalStorageUri.fsPath, '.myLastChat');
    }

    // 工作区存储
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return path.join(workspaceFolders[0].uri.fsPath, '.myLastChat');
    }

    // 回退到全局存储
    return path.join(this.context.globalStorageUri.fsPath, '.myLastChat');
  }

  /**
   * 确保存储目录存在
   */
  async ensureStorageDirectory(): Promise<void> {
    const storagePath = this.getStoragePath();
    try {
      await fs.promises.mkdir(storagePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  /**
   * 获取所有聊天摘要文件
   */
  async getAllChatSummaries(): Promise<ChatSummary[]> {
    const storagePath = this.getStoragePath();
    const summaries: ChatSummary[] = [];

    try {
      await this.ensureStorageDirectory();
      const files = await fs.promises.readdir(storagePath);
      const mdFiles = files.filter(file => file.endsWith('.md'));

      for (const file of mdFiles) {
        const filePath = path.join(storagePath, file);
        const summary = await this.parseChatFile(filePath);
        if (summary) {
          summaries.push(summary);
        }
      }
    } catch (error) {
      console.error('Failed to read chat summaries:', error);
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

      const metadata: ChatMetadata = {
        title: parsed.data.title || path.basename(filePath, '.md'),
        description: parsed.data.description || '',
        workplace: parsed.data.workplace || '',
        project: parsed.data.project,
        type: parsed.data.type,
        solved_lists: parsed.data.solved_lists,
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
  async searchByTitle(keywords: string[], feedbackLevel: FeedbackLevel = 'DESCRIPTION'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries();
    const results: SearchResult[] = [];

    for (const summary of summaries) {
      const title = summary.metadata.title.toLowerCase();
      const matched = keywords.some(keyword => 
        title.includes(keyword.toLowerCase())
      );

      if (matched) {
        results.push(this.formatResult(summary, feedbackLevel));
      }
    }

    return results;
  }

  /**
   * 通过元数据搜索
   */
  async searchByMeta(keywords: string[], feedbackLevel: FeedbackLevel = 'META'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries();
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
        results.push(this.formatResult(summary, feedbackLevel));
      }
    }

    return results;
  }

  /**
   * 获取聊天列表
   */
  async getLastChatsList(feedbackLevel: FeedbackLevel = 'DESCRIPTION'): Promise<SearchResult[]> {
    const summaries = await this.getAllChatSummaries();
    return summaries.map(summary => this.formatResult(summary, feedbackLevel));
  }

  /**
   * 创建新的聊天摘要文件
   */
  async createNewChatSummary(): Promise<string | null> {
    const storagePath = this.getStoragePath();
    await this.ensureStorageDirectory();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `chat-${timestamp}.md`;
    const filePath = path.join(storagePath, fileName);

    const workspaceFolders = vscode.workspace.workspaceFolders;
    const defaultWorkplace = workspaceFolders && workspaceFolders.length > 0 
      ? workspaceFolders[0].uri.fsPath 
      : '';

    const template = `---
title: 新聊天摘要
description: 请填写聊天描述
workplace: ${defaultWorkplace}
project: 
type: 
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
}
