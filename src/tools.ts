import * as vscode from 'vscode';
import { ChatStorageService } from './storage';
import { 
  GetLastChatsListInput, 
  SearchByTitleInput, 
  SearchByMetaInput,
  FeedbackLevel,
  StorageScope
} from './types';

/**
 * 获取聊天列表工具
 */
export class GetLastChatsListTool implements vscode.LanguageModelTool<GetLastChatsListInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<GetLastChatsListInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const storageService = ChatStorageService.getInstance();
    const feedbackLevel: FeedbackLevel = options.input.feedbackLevel || 'DESCRIPTION';
    const scope: StorageScope = options.input.scope || 'all';
    
    try {
      const results = await storageService.getLastChatsList(feedbackLevel, scope);
      
      if (results.length === 0) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart('没有找到任何聊天摘要。')
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`获取聊天列表失败: ${error}`)
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel): string {
    let output = `找到 ${results.length} 个聊天摘要:\n\n`;
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += `文件: ${result.fileName}\n`;
      if (result.scope) {
        output += `范围: ${result.scope === 'workspace' ? '工作区' : '全局'}\n`;
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += `描述: ${result.description}\n`;
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += `工作区: ${result.metadata.workplace}\n`;
        if (result.metadata.project) {
          output += `项目: ${result.metadata.project}\n`;
        }
        if (result.metadata.type) {
          output += `类型: ${result.metadata.type}\n`;
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += `完成任务:\n`;
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += `\n内容:\n${result.content}\n`;
      }
      
      output += '\n---\n\n';
    }
    
    return output;
  }
}

/**
 * 通过标题搜索工具
 */
export class SearchByTitleTool implements vscode.LanguageModelTool<SearchByTitleInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SearchByTitleInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const storageService = ChatStorageService.getInstance();
    const { keywords, feedbackLevel = 'DESCRIPTION', scope = 'all' } = options.input;
    
    if (!keywords || keywords.length === 0) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart('请提供至少一个搜索关键词。')
      ]);
    }

    try {
      const results = await storageService.searchByTitle(keywords, feedbackLevel, scope);
      
      if (results.length === 0) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(`没有找到标题包含关键词 "${keywords.join(', ')}" 的聊天摘要。`)
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel, keywords);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`搜索失败: ${error}`)
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel, keywords: string[]): string {
    let output = `搜索关键词: ${keywords.join(', ')}\n`;
    output += `找到 ${results.length} 个匹配的聊天摘要:\n\n`;
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += `文件: ${result.fileName}\n`;
      if (result.scope) {
        output += `范围: ${result.scope === 'workspace' ? '工作区' : '全局'}\n`;
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += `描述: ${result.description}\n`;
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += `工作区: ${result.metadata.workplace}\n`;
        if (result.metadata.project) {
          output += `项目: ${result.metadata.project}\n`;
        }
        if (result.metadata.type) {
          output += `类型: ${result.metadata.type}\n`;
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += `完成任务:\n`;
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += `\n内容:\n${result.content}\n`;
      }
      
      output += '\n---\n\n';
    }
    
    return output;
  }
}

/**
 * 通过元数据搜索工具
 */
export class SearchByMetaTool implements vscode.LanguageModelTool<SearchByMetaInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SearchByMetaInput>,
    _token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const storageService = ChatStorageService.getInstance();
    const { keywords, feedbackLevel = 'META', scope = 'all' } = options.input;
    
    if (!keywords || keywords.length === 0) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart('请提供至少一个搜索关键词。')
      ]);
    }

    try {
      const results = await storageService.searchByMeta(keywords, feedbackLevel, scope);
      
      if (results.length === 0) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(`没有找到元数据包含关键词 "${keywords.join(', ')}" 的聊天摘要。`)
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel, keywords);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`搜索失败: ${error}`)
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel, keywords: string[]): string {
    let output = `搜索关键词: ${keywords.join(', ')}\n`;
    output += `找到 ${results.length} 个匹配的聊天摘要:\n\n`;
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += `文件: ${result.fileName}\n`;
      if (result.scope) {
        output += `范围: ${result.scope === 'workspace' ? '工作区' : '全局'}\n`;
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += `描述: ${result.description}\n`;
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += `工作区: ${result.metadata.workplace}\n`;
        if (result.metadata.project) {
          output += `项目: ${result.metadata.project}\n`;
        }
        if (result.metadata.type) {
          output += `类型: ${result.metadata.type}\n`;
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += `完成任务:\n`;
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += `\n内容:\n${result.content}\n`;
      }
      
      output += '\n---\n\n';
    }
    
    return output;
  }
}

/**
 * 注册所有LM工具
 */
export function registerTools(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.lm.registerTool('myLastChat_getLastChatsList', new GetLastChatsListTool())
  );
  
  context.subscriptions.push(
    vscode.lm.registerTool('myLastChat_searchByTitle', new SearchByTitleTool())
  );
  
  context.subscriptions.push(
    vscode.lm.registerTool('myLastChat_searchByMeta', new SearchByMetaTool())
  );
}
