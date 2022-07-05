import { makeAutoObservable } from 'mobx'
import {
  BulkCreateCategorySkuV2,
  BulkImportBasicPriceV2,
  BulkUpdateSkuByExcelV2,
} from 'gm_api/src/merchandise'
import { BatchImportConfigInterface } from '@/pages/batch_import/type'
import { BatchImportConfig } from '@/pages/batch_import/config'
import { ImportPurchaseRule } from 'gm_api/src/purchase'
const initPageConfig = {
  titleTwo: '',
  fileMaxCount: 1,
  fileMaxSize: 10,
  fileFormat: '.xlsx',
  fileType: 0,
  templateUrl: '',
  successTip: '',
  pageTitle: '',
}

class ImportStore {
  step = 0
  taskId = ''
  page = ''
  pageConfig: BatchImportConfigInterface = initPageConfig
  quotationId = ''
  importFunction: {
    [key: string]: Function
  } = {
    /** 导入商品 */
    merchandise_add: this.merchandiseAddImport,
    /** 修改商品 */
    merchandise_edit: this.merchandiseEditImport,
    /** 导入商品报价信息 */
    price_add: this.priceAddImport,
    /** 导入采购规则xlsx */
    purchase_rules: this.purchaseRulesImport,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setStep(step: number) {
    this.step = step
  }

  setPage(page: string) {
    this.page = page
    this.pageConfig = BatchImportConfig[page]
    window.document.title = this.pageConfig.pageTitle
  }

  setQuotationId(id: string) {
    this.quotationId = id
  }

  async import(downloadUrl: string) {
    if (this.page === 'price_add') {
      this.taskId = await this.importFunction[this.page](
        downloadUrl,
        this.quotationId,
      )
    } else {
      this.taskId = await this.importFunction[this.page](downloadUrl)
    }

    this.setStep(1)
    // 返回任意值，标记所有步骤都完成
    return true
  }

  merchandiseAddImport(downloadUrl: string) {
    return BulkCreateCategorySkuV2({ file_url: downloadUrl }).then((res) => {
      return res.response.task?.task_id || ''
    })
  }

  merchandiseEditImport(downloadUrl: string) {
    return BulkUpdateSkuByExcelV2({ file_url: downloadUrl }).then((res) => {
      return res.response.task?.task_id || ''
    })
  }

  priceAddImport(downloadUrl: string, quotation_id: string) {
    return BulkImportBasicPriceV2({
      file_url: downloadUrl,
      quotation_id,
    }).then((res) => {
      return res.response.task?.task_id || ''
    })
  }

  /** @description 导入采购规则的接口设置 */
  purchaseRulesImport(downloadUrl: string) {
    return ImportPurchaseRule({
      file_url: downloadUrl,
    }).then((res) => {
      return res.response.task?.task_id || ''
    })
  }

  clearStore() {
    this.step = 0
    this.taskId = ''
    this.page = ''
    this.pageConfig = initPageConfig
  }
}

export default new ImportStore()
