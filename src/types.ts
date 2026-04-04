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
  type?: 'coding' | 'debug' | 'planning' | 'spec' | 'knowledge';
  /** 完成的任务列表（可选） */
  solved_lists?: string[];
  /** 创建时间（ISO 8601格式） */
  createdAt?: string;
  /** 修改时间（ISO 8601格式） */
  updatedAt?: string;
  /** 是否收藏 */
  favorite?: boolean;
  /** 标签列表 */
  tags?: string[];
}

/**
 * 子工作区信息（含 .git 的子文件夹）
 */
export interface SubWorkspaceInfo {
  /** 子工作区名称（文件夹名） */
  name: string;
  /** 子工作区完整路径 */
  path: string;
  /** .myLastChat 文件夹路径 */
  chatStoragePath: string;
  /** 是否存在 .myLastChat 文件夹 */
  hasChatStorage: boolean;
}

/**
 * 反馈详细程度
 */
export type FeedbackLevel = 'TITLE_ONLY' | 'DESCRIPTION' | 'META' | 'ALL';

/**
 * 存储范围
 */
export type StorageScope = 'workspace' | 'global' | 'all';

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
  /** 存储范围 */
  scope?: StorageScope;
  /** 所属文件夹名称（仅子文件夹内的文件有此字段） */
  folderName?: string;
  /** 所属文件夹路径（仅子文件夹内的文件有此字段） */
  folderPath?: string;
  /** 所属子工作区名称 */
  workspaceName?: string;
  /** 所属子工作区路径 */
  workspacePath?: string;
}

/**
 * 子文件夹分组
 */
export interface FolderGroup {
  /** 文件夹名称 */
  folderName: string;
  /** 文件夹完整路径 */
  folderPath: string;
  /** 文件夹内的聊天记录 */
  items: ChatSummary[];
  /** 文件夹内最新文件的时间（用于时间分组） */
  latestTime: string;
  /** 存储范围 */
  scope?: StorageScope;
}

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
  scope?: StorageScope;
  /** 所属文件夹名称（仅子文件夹内的文件有此字段） */
  folderName?: string;
  /** 所属文件夹路径（仅子文件夹内的文件有此字段） */
  folderPath?: string;
  /** 所属子工作区名称 */
  workspaceName?: string;
  /** 所属子工作区路径 */
  workspacePath?: string;
}

/**
 * 工具输入参数类型定义
 */
export interface GetLastChatsListInput {
  feedbackLevel?: FeedbackLevel;
  scope?: StorageScope;
}

export interface SearchByTitleInput {
  keywords: string[];
  feedbackLevel?: FeedbackLevel;
  scope?: StorageScope;
}

export interface SearchByMetaInput {
  keywords: string[];
  feedbackLevel?: FeedbackLevel;
  scope?: StorageScope;
}
