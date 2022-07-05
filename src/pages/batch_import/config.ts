import { BatchImportConfigInterface } from '@/pages/batch_import/type'
import { FileType } from 'gm_api/src/cloudapi'

export const BatchImportConfig: { [key: string]: BatchImportConfigInterface } =
  {
    merchandise_add: {
      titleTwo: '导入商品',
      fileMaxCount: 1,
      fileMaxSize: 10,
      fileFormat: '.xlsx, .xls',
      fileType: FileType.FILE_TYPE_MERCHANDISE_SKU_IMPORT,
      templateUrl:
        'https://file.guanmai.cn/merchandise/import-template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E5%95%86%E5%93%81%E6%A8%A1%E6%9D%BF%28lite%29.xlsx',
      liteTemplateUrl:
        'https://gmfiles-1251112841.cos.ap-guangzhou.myqcloud.com/merchandise/import-template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E5%95%86%E5%93%81%E6%A8%A1%E6%9D%BF-%E8%BD%BB%E5%B7%A7%E7%89%88.xlsx',
      successTip: '导入{#success}商品',
      failureTip: '失败{#failure}行',
      pageTitle: '商品列表',
    },
    merchandise_edit: {
      titleTwo: '修改商品',
      fileMaxCount: 1,
      fileMaxSize: 10,
      fileFormat: '.xlsx, .xls',
      fileType: FileType.FILE_TYPE_MERCHANDISE_SKU_IMPORT,
      successTip: '修改{#success}商品',
      failureTip: '失败{#failure}行',
      pageTitle: '商品列表',
    },
    price_add: {
      titleTwo: '导入报价单',
      fileMaxCount: 1,
      fileMaxSize: 10,
      fileFormat: '.xlsx, .xls',
      fileType: FileType.FILE_TYPE_MERCHANDISE_SKU_IMPORT,
      successTip: '导入{#success}商品销售信息',
      failureTip: '失败{#failure}行',
      pageTitle: '客户报价单',
      templateUrl:
        'https://file.guanmai.cn/%E5%95%86%E5%93%81%E9%94%80%E5%94%AE%E4%BF%A1%E6%81%AF%E6%A8%A1%E6%9D%BF.xlsx',
    },
    purchase_rules: {
      titleTwo: '导入采购规则',
      fileMaxCount: 1,
      fileMaxSize: 10,
      fileFormat: '.xlsx, .xls',
      fileType: FileType.FILE_TYPE_PURCHASE_RULE_IMPORT,
      successTip: '导入{#success}采购规则',
      failureTip: '失败{#failure}行',
      pageTitle: '采购规则',
      templateUrl:
        'https://gmfiles-1251112841.cos.ap-guangzhou.myqcloud.com/purchase/import_template/%E9%87%87%E8%B4%AD%E8%AE%A1%E5%88%92%E8%A7%84%E5%88%99%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx',
    },
  }
