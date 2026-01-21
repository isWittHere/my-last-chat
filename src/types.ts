/**
 * 聊天摘要的元数据接口
 */
export interface ChatMetadata {
  /** 标题（必填） */
  title: string;
  /** 描述（必填） */
  description: string;
  /** 适用的工作区路径（必填） */
  workplace: string;
  /** 项目名称（可选） */
  project?: string;
  /** 聊天任务类型（可选） */
  type?: 'coding' | 'debug' | 'planning' | 'spec';
  /** 完成的任务列表（可选） */
  solved_lists?: string[];
}

/**
 * 完整的聊天摘要数据
 */
export interface ChatSummary {
  /** 文件路径 */
  filePath: string;
  /** 文件名 */
  fileName: string;
  /** 元数据 */
  metadata: ChatMetadata;
  /** 正文内容 */
  content: string;
}

/**
 * 反馈详细程度
 */
export type FeedbackLevel = 'TITLE_ONLY' | 'DESCRIPTION' | 'META' | 'ALL';

/**
 * 搜索结果项
 */
export interface SearchResult {
  filePath: string;
  fileName: string;
  title: string;
  description?: string;
  metadata?: ChatMetadata;
  content?: string;
}

/**
 * 工具输入参数类型定义
 */
export interface GetLastChatsListInput {
  feedbackLevel?: FeedbackLevel;
}

export interface SearchByTitleInput {
  keywords: string[];
  feedbackLevel?: FeedbackLevel;
}

export interface SearchByMetaInput {
  keywords: string[];
  feedbackLevel?: FeedbackLevel;
}
