import { makeAutoObservable } from 'mobx'
import { Task } from '../../../../interface'
import { NumberTableList, TableList } from './interface'
import {
  SplitPurchaseTask,
  SplitPurchaseTaskRequest_SplitType,
  PurchaseTask,
  PurchaseTask_RequestSource,
} from 'gm_api/src/purchase'
import _ from 'lodash'
export const initNumberTable = {
  supplier_id: '0',
  need_value: undefined as unknown as string,
}
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** @description 选中的拆分数据 按单拆分 */
  chooseSplitTask: Partial<Task> = {}

  /** @description 关于选中单据的那个表格 */
  tableList: TableList[] = []

  /** @description 选中的拆分计划 按单拆分 */
  setChooseSplitTask(chooseSplitTask: Task) {
    this.chooseSplitTask = chooseSplitTask
    this.tableList = _.map(
      chooseSplitTask.request_details.request_details,
      (item, index) => ({
        ...item,
        table_id: index,
        supplier_id: '0',
        sku: chooseSplitTask.sku,
      }),
    )
  }

  setTableList(value: string, key: string, index: number) {
    _.set(this.tableList[index], key, value)
    this.tableList = _.cloneDeep(this.tableList)
  }

  /** @description 按照数量拆分 */
  numberTable: NumberTableList[] = [initNumberTable]

  updateNumberTable(numberTable: NumberTableList[]) {
    this.numberTable = [...numberTable]
  }

  /** @description 按照单据拆分的逻辑 */
  splitBillPurchaseTask(split_type: SplitPurchaseTaskRequest_SplitType) {
    const { purchase_time, sku_id, status, type, purchase_task_id } =
      this.chooseSplitTask
    const purchase_tasks = _.map(this.tableList, (item) => {
      const request_details = {
        request_details: [
          {
            ..._.omit(item, ['table_id', 'sku', 'val']),
          },
        ],
      }
      return {
        request_details,
        purchase_time,
        request_source: item.request_source,
        sku_id,
        status,
        supplier_id: item.supplier_id,
        type,
      }
    }) as unknown as PurchaseTask[]
    return SplitPurchaseTask({
      split_type,
      purchase_task_id: purchase_task_id!,
      purchase_tasks,
    })
  }

  /** @description 按照数量拆分的逻辑 */
  splitAmountPurchaseTask(split_type: SplitPurchaseTaskRequest_SplitType) {
    const {
      purchase_time,
      sku_id,
      status,
      type,
      sku,
      purchase_task_id,
      serial_no,
    } = this.chooseSplitTask
    const purchase_tasks = _.map(this.numberTable, (item) => {
      const request_details = {
        request_details: [
          {
            request_source: PurchaseTask_RequestSource.PURCHASE_TASK,
            unit_id: sku?.purchase_unit_id,
            sku_revision: sku?.revision,
            request_sheet_serial_no: serial_no,
            sheet_value: {
              input: {
                unit_id: sku?.purchase_unit_id,
                quantity: '' + item.need_value,
                price: '',
              },
              calculate: {
                unit_id: sku?.purchase_unit_id,
                quantity: '' + item.need_value,
                price: '',
              },
            },
          },
        ],
      }
      return {
        request_details,
        plan_value: {
          input: {
            unit_id: sku?.purchase_unit_id,
            quantity: '' + item.need_value,
            price: '',
          },
          calculate: {
            unit_id: sku?.purchase_unit_id,
            quantity: '' + item.need_value,
            price: '',
          },
        },
        request_source: PurchaseTask_RequestSource.PURCHASE_TASK,
        purchase_time,
        sku_id,
        status,
        supplier_id: item.supplier_id,
        type,
      }
    }) as unknown as PurchaseTask[]

    return SplitPurchaseTask({
      split_type,
      purchase_task_id: purchase_task_id!,
      purchase_tasks,
    })
  }

  init() {
    this.chooseSplitTask = {}
    this.tableList = []
    this.numberTable = [initNumberTable]
  }
}
export default new Store()
