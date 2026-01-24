/**
 * Webview 模块导出
 * 
 * 此文件重新导出所有 webview 相关的类和函数，保持向后兼容性
 */

// 导出侧边栏视图
export { ChatListViewProvider } from './chatListView';

// 导出编辑器面板
export { ChatListPanel } from './chatListPanel';

// 导出共享模板函数（如果其他模块需要）
export {
  generateWebviewHtml,
  getSharedStyles,
  getSharedScript,
  getControlsHtml,
  getNonce,
  getCodiconsUri,
  WebviewDataItem
} from './webviewTemplate';
