import { makeAutoObservable } from 'mobx'
import {
  ListStockSheetRequest,
  ListStockSheet,
  ExportStockSheet,
  ListShelf,
  Shelf,
  UpdateStockSheet,
  DeleteStockSheet,
} from 'gm_api/src/inventory'
import moment from 'moment'

import _ from 'lodash'
import {
  ComShelf,
  ComSupplier,
  SalesInvoicingSheet,
  TableRequestParams,
} from '../../../interface'
import { RECEIPT_STATUS, RECEIPT_TYPE } from '../../../enum'
import {
  adapterMoreSelectComData,
  formatDataToTree,
  getTimestamp,
  isValid,
} from '@/common/util'
import {
  CustomerLabel,
  ListCustomerLabel,
  ListSupplier,
  GroupUser,
} from 'gm_api/src/enterprise'
import { ListDataItem, Tip } from '@gm-pc/react'
import {
  getDisabledShelfData,
  getSalesInvoicingSheetData,
  getStockSheetData,
} from '@/pages/sales_invoicing/util'
import { t } from 'gm-i18n'
import { SelectType } from '../interface'
import { PagingResult } from 'gm_api/src/common'
import globalStore from '@/stores/global'

interface Filter
  extends Omit<
    ListStockSheetRequest,
    'paging' | 'begin_time' | 'end_time' | 'time_type' | 'is_printed'
  > {
  begin_time: Date
  end_time: Date
  time_type: number
  customer_label_selected?: any
  searchType: SelectType // 控制搜索类型，0 : 按: 按计划编号搜索
  creator_ids?: any
  warehouse_id?: string
}

type PDetail = SalesInvoicingSheet.StockInProductDetail

interface RDetail
  extends Omit<SalesInvoicingSheet.StockInReceiptDetail, 'details'> {
  isEdit: boolean
  details: PDetail[]
  customer_delete_time?: string
  customer_name?: string
  customer_customized_code?: string
}

const initFilter: Filter = {
  stock_sheet_type: RECEIPT_TYPE.saleRefundIn,
  time_type: 1,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  stock_sheet_status: 0,
  customer_label_selected: [],
  with_additional: true,
  searchType: 'q',
  creator_ids: undefined,
  warehouse_id: undefined,
}
class Store {
  filter: Filter = { ...initFilter }
  list: Array<RDetail> = []

  activeType = 'all'
  allShelfResponse: Shelf[] = []
  shelfList: ComShelf[] = []
  supplierList: ComSupplier[] = []

  customerLabelList: (CustomerLabel & ListDataItem<string>)[] = []
  groupUsers: { [key: string]: GroupUser } | undefined = {}

  paging: PagingResult = { count: 0 }

  doRequest = _.noop

  setDoRequest(func: any) {
    this.doRequest = func
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  changeActiveType(type: string) {
    this.activeType = type
  }

  changeListItem<T extends keyof RDetail>(
    key: T,
    value: RDetail[T],
    index: number,
  ) {
    this.list[index][key] = value
  }

  changeDetailItem(index: number, changeData: Partial<PDetail>) {
    Object.assign(this.list[index].details[0], { ...changeData })
  }

  getSearchData() {
    const {
      begin_time,
      end_time,
      customer_label_selected,
      searchType,
      q,
      order_serial_no_q,
      creator_ids,
      warehouse_id,
      ...rest
    } = this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    const target = {
      ...rest,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),

      customer_label_ids: _.map(
        customer_label_selected,
        (item) => item.customer_label_id,
      ),
      creator_ids: creatorIds,
      warehouse_id: warehouse_id,
    }

    target[searchType] = q

    return target
  }

  fetchShelf() {
    return ListShelf({ with_deleted: true }).then((json) => {
      this.allShelfResponse = json.response.shelves
      this.shelfList = formatDataToTree(
        getDisabledShelfData(
          _.filter(json.response.shelves!, (item) => {
            return item.delete_time === '0'
          }), // 去掉删除
        ),
        'shelf_id',
        'name',
      )
      return json
    })
  }

  fetchList(params: TableRequestParams) {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())

    return ListStockSheet(req as any).then((json) => {
      this.list = _.map(json.response.stock_sheets, (item) => {
        const data = getSalesInvoicingSheetData(
          { stock_sheet: item, additional: json.response.additional! },
          'stockIn',
          {
            shelfList: this.allShelfResponse,
          },
        )
        const customer =
          item.customer_id !== '0'
            ? json.response.additional!.customers![item.customer_id]
            : undefined // list数据会过滤已删除的，因此从additional取delete_time
        const supplier =
          item.target_id !== '0'
            ? json.response.additional!.suppliers![item.target_id!]
            : undefined // list数据会过滤已删除的，因此从additional取delete_time
        const warehouse_name =
          json.response.additional?.warehouses?.[item?.warehouse_id]?.name // 仓库名

        const sku_base_unit_name = globalStore.getUnitName(
          item.details[0]?.base_unit_id!,
        )

        return {
          ...data,
          target_delete_time: supplier?.delete_time!,
          target_customized_code: supplier?.customized_code,
          target_name: supplier ? supplier.name : data.target_name,
          customer_delete_time: customer?.delete_time ?? '0',
          customer_name: customer?.name,
          customer_customized_code: customer?.customized_code,
          details: [
            {
              ...data.details[0],
              warehouse_name,
              warehouse_id: item?.warehouse_id,
            },
          ],
          warehouse_name,
          sku_base_unit_name,
          isEdit: false,
        }
      })

      this.groupUsers = json.response.additional?.group_users
      this.paging = json.response.paging
      return json.response
    })
  }

  fetchCustomerLabelList() {
    return ListCustomerLabel({ paging: { limit: 999 } }).then((json) => {
      this.customerLabelList = adapterMoreSelectComData(
        json.response.customer_labels,
        'customer_label_id',
      )

      return json
    })
  }

  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
      )

      return json
    })
  }

  export() {
    return ExportStockSheet({
      list_stock_sheet_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }

  /**
   * 校验数据
   * @returns {{canSubmitType: number}} 0: 不允许提交， 1: 可提交
   */
  verifyData(index: number) {
    let canSubmitType = 1
    const { second_base_unit_id, second_base_unit_quantity } =
      this.list[index].details[0]
    // 状态修改为入库才校验
    if (this.list[index].sheet_status === RECEIPT_STATUS.approved) {
      if (!isValid(this.list[index].details[0].ssu_base_quantity)) {
        canSubmitType = 0
        Tip.danger(t('请填写入库数量（基本单位）'))
      } else if (
        !!_.toNumber(second_base_unit_id) &&
        !isValid(second_base_unit_quantity)
      ) {
        // 开启了辅助单位且辅助单位没有值
        Tip.danger(t('请填写入库数(辅助单位)后再提交'))
        canSubmitType = 0
      }
    }

    return canSubmitType
  }

  updateListItem(index: number) {
    if (!this.verifyData(index)) {
      return Promise.reject(new Error('校验单据提交错误'))
    }
    this.list[index].total_price =
      this.list[index].details[0].amount?.toString()
    const data = this.list[index]
    const params = {
      stock_sheet: {
        ...getStockSheetData(data, { type: 'stockIn' }),
        warehouse_id: data.details[0].warehouse_id,
      },
      stock_sheet_id: this.list[index].stock_sheet_id,
    }
    return UpdateStockSheet(params).then((json) => {
      Tip.success(t('修改成功'))
      return json
    })
  }

  deleteStockSheet(index: number) {
    return DeleteStockSheet({
      stock_sheet_id: this.list[index].stock_sheet_id,
    }).then(() => Tip.success(t('删除单据成功')))
  }
}

export default new Store()
export type { PDetail, RDetail }
