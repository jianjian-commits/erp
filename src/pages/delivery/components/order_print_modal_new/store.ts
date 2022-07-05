import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'
import { Storage } from '@gm-pc/react'
import { openNewTab } from '@/common/util'
import { PrintingTemplate } from 'gm_api/src/preference'
import { childType, orderTypeLists } from './enum'
import qs from 'query-string'

// to_print_task: false,    // 司机任务单
// to_print_sku: false,   // 司机装车单
// to_print_checklist: false,   // 分拣核查单
const printModalOptions = {
  orderType: ['delivery_task'], // 单据类型多选
  deliveryType: '1', // 栏目二：模板类型
  printType: '1', // 打印类型
  templateId: 'customer_config', // 模板ID
  needPopUp: false, // 是否需要弹出窗口
  childTypeValue: 0,
  showRise: false,
}

type PrintModalOptionsType = {
  orderType: Array<string>
  deliveryType: string
  printType: string
  templateId: string
  needPopUp: boolean
  childTypeValue?: childType
  showRise?: boolean
}

class Store {
  templateList: PrintingTemplate[] = []
  modalTitle = ''

  printModalOptions: PrintModalOptionsType = {
    ...printModalOptions,
    ...Storage.get('printModalOptions'),
  }

  constructor() {
    makeAutoObservable(this)
  }

  // 保存modal options到localStorage
  savePrintOptions = <T extends keyof PrintModalOptionsType>(
    key: T,
    value: PrintModalOptionsType[T],
  ) => {
    this.printModalOptions = {
      ...this.printModalOptions,
      [key]: value,
    }
    Storage.set('printModalOptions', this.printModalOptions)
  }

  // 去打印
  goToPrint = (query: string | undefined, sortBy?: string | undefined) => {
    const { orderType, deliveryType, templateId, childTypeValue, showRise } =
      this.printModalOptions
    const selectOrderTypes: { [key: string]: boolean } = {}
    // 选中的单据类型进行拼接
    _.forEach(orderTypeLists, (orderTypeItem) => {
      if (orderType.includes(orderTypeItem.value)) {
        selectOrderTypes[orderTypeItem.value] = true
      }
    })
    const queryString = qs.stringify(selectOrderTypes)

    const printType = deliveryType === '2' ? 'mergeKid' : 'print'
    const templateType = deliveryType === '3' ? 'account' : 'delivery'
    const URL = `#/system/template/print_template/${templateType}_template/${printType}`

    openNewTab(
      `${URL}?query=${query}&sort_by=${
        sortBy ?? JSON.stringify({})
      }&template_id=${templateId}&${queryString}&showRise=${showRise}&childTypeValue=${childTypeValue}`,
    )
  }

  setModalTitle = (value: string) => {
    this.modalTitle = value
  }

  // 更新属性
  handleChangeParams = (key: 'modalTitle' | 'templateList', value: any) => {
    runInAction(() => {
      this[key] = value
    })
  }
}

export default new Store()
