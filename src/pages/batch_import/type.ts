import { FileType } from 'gm_api/src/cloudapi'

export interface BatchImportConfigInterface {
  /** 第一步标题，默认为“选择文件” */
  titleOne?: string
  /** 第二步标题 */
  titleTwo: string
  /** 上传文件数量 */
  fileMaxCount: number
  /** 文件最大限制, 单位M */
  fileMaxSize: number
  /** 文件格式类型 */
  fileFormat: string
  /** 文件内容类型 */
  fileType: FileType
  /** 下载模板Url */
  templateUrl?: string
  /** 轻巧版模板 */
  liteTemplateUrl?: string
  /** 上传组件提示 */
  uploadBoxTips?: string
  /** 底部提示, 形如：['1、...', '2、...'] */
  uploadingTips?: string[]
  /** 异步任务完成成功数提示, 形如：成功{#success}条 */
  successTip: string
  /** 异步任务完成失败数提示, 形如：失败{#failure}条 */
  failureTip?: string
  /** 页面标题 */
  pageTitle: string
}
