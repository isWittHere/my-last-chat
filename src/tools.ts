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
          new vscode.LanguageModelTextPart(vscode.l10n.t('No chat summaries found.'))
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(vscode.l10n.t('Failed to get chat list: {0}', String(error)))
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel): string {
    let output = vscode.l10n.t('Found {0} chat summaries:', results.length) + '\n\n';
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += vscode.l10n.t('File: {0}', result.fileName) + '\n';
      if (result.scope) {
        output += (result.scope === 'workspace' ? vscode.l10n.t('Scope: workspace') : vscode.l10n.t('Scope: global')) + '\n';
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += vscode.l10n.t('Description: {0}', result.description) + '\n';
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += vscode.l10n.t('Workspace: {0}', result.metadata.workplace) + '\n';
        if (result.metadata.project) {
          output += vscode.l10n.t('Project: {0}', result.metadata.project) + '\n';
        }
        if (result.metadata.type) {
          output += vscode.l10n.t('Type: {0}', result.metadata.type) + '\n';
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += vscode.l10n.t('Completed tasks:') + '\n';
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += '\n' + vscode.l10n.t('Content:') + '\n' + result.content + '\n';
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
        new vscode.LanguageModelTextPart(vscode.l10n.t('Please provide at least one search keyword.'))
      ]);
    }

    try {
      const results = await storageService.searchByTitle(keywords, feedbackLevel, scope);
      
      if (results.length === 0) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(vscode.l10n.t('No chat summaries matching the keywords were found.'))
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel, keywords);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(vscode.l10n.t('Failed to search: {0}', String(error)))
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel, keywords: string[]): string {
    let output = `Keywords: ${keywords.join(', ')}\n`;
    output += vscode.l10n.t('Found {0} chat summaries:', results.length) + '\n\n';
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += vscode.l10n.t('File: {0}', result.fileName) + '\n';
      if (result.scope) {
        output += (result.scope === 'workspace' ? vscode.l10n.t('Scope: workspace') : vscode.l10n.t('Scope: global')) + '\n';
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += vscode.l10n.t('Description: {0}', result.description) + '\n';
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += vscode.l10n.t('Workspace: {0}', result.metadata.workplace) + '\n';
        if (result.metadata.project) {
          output += vscode.l10n.t('Project: {0}', result.metadata.project) + '\n';
        }
        if (result.metadata.type) {
          output += vscode.l10n.t('Type: {0}', result.metadata.type) + '\n';
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += vscode.l10n.t('Completed tasks:') + '\n';
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += '\n' + vscode.l10n.t('Content:') + '\n' + result.content + '\n';
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
        new vscode.LanguageModelTextPart(vscode.l10n.t('Please provide at least one search keyword.'))
      ]);
    }

    try {
      const results = await storageService.searchByMeta(keywords, feedbackLevel, scope);
      
      if (results.length === 0) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(vscode.l10n.t('No chat summaries matching the keywords were found.'))
        ]);
      }

      const formattedResults = this.formatResults(results, feedbackLevel, keywords);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(formattedResults)
      ]);
    } catch (error) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(vscode.l10n.t('Failed to search: {0}', String(error)))
      ]);
    }
  }

  private formatResults(results: any[], level: FeedbackLevel, keywords: string[]): string {
    let output = `Keywords: ${keywords.join(', ')}\n`;
    output += vscode.l10n.t('Found {0} chat summaries:', results.length) + '\n\n';
    
    for (const result of results) {
      output += `## ${result.title}\n`;
      output += vscode.l10n.t('File: {0}', result.fileName) + '\n';
      if (result.scope) {
        output += (result.scope === 'workspace' ? vscode.l10n.t('Scope: workspace') : vscode.l10n.t('Scope: global')) + '\n';
      }
      
      if (level !== 'TITLE_ONLY' && result.description) {
        output += vscode.l10n.t('Description: {0}', result.description) + '\n';
      }
      
      if ((level === 'META' || level === 'ALL') && result.metadata) {
        output += vscode.l10n.t('Workspace: {0}', result.metadata.workplace) + '\n';
        if (result.metadata.project) {
          output += vscode.l10n.t('Project: {0}', result.metadata.project) + '\n';
        }
        if (result.metadata.type) {
          output += vscode.l10n.t('Type: {0}', result.metadata.type) + '\n';
        }
        if (result.metadata.solved_lists && result.metadata.solved_lists.length > 0) {
          output += vscode.l10n.t('Completed tasks:') + '\n';
          for (const task of result.metadata.solved_lists) {
            if (task) {
              output += `  - ${task}\n`;
            }
          }
        }
      }
      
      if (level === 'ALL' && result.content) {
        output += '\n' + vscode.l10n.t('Content:') + '\n' + result.content + '\n';
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
