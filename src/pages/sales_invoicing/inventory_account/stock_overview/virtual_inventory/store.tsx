import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  CreateReplaceStockSheet,
  CreateReplaceBatch,
  ListVirtualStock,
} from 'gm_api/src/inventory'
import { BatchDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import {
  SkuStockExpand,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'

import { RECEIPT_TYPE, BATCH_STATUS } from '@/pages/sales_invoicing/enum'
import { toSheetF } from '@/pages/sales_invoicing/components/toSheet'

import {
  getSearchCategory,
  getStockAdditional,
} from '@/pages/sales_invoicing/util'
import { FilterType, ChoseSelect } from '../interface'

interface FtType extends Omit<FilterType, 'sku_id' | 'sku_unit_id'> {
  batch_typ?: number
  warehouse_id?: string
}

interface ReplaceStock {
  list_batch_request?: FtType
  batch_ids?: string[]
  sheet_type: number
}

const initChoseList: ChoseSelect = {
  select_all: [], // 当前所选的所有字母key
  select_tree: {}, // 子母树
  select_batch: [], // 所选中的虚拟批次
}

class Store {
  filter: FtType = {
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    q: '',
    with_additional: true,
    batch_type: BATCH_STATUS.vir,
    warehouse_id: undefined,
  }

  list: SkuStockExpand[] = []

  choseList: ChoseSelect = { ...initChoseList }
  list_select_all: string[] = [] // 用于全选list
  list_select_tree: { [key: string]: string[] } = {} // 用于全选list的后续判断

  replaceStock: ReplaceStock = {
    sheet_type: RECEIPT_TYPE.purchaseIn, // 入库类型
  }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  handleChangeStorage = (value: number) => {
    this.replaceStock.sheet_type = value
  }

  getListSelectAll = () => {
    this.list_select_tree = _.reduce(
      this.list,
      (result, v) => {
        result[v.sku_id] = _.map(v.batches, ({ batch_id }) => batch_id)
        return result
      },
      {} as { [key: string]: any },
    )

    this.list_select_all = _.reduce(
      this.list_select_tree,
      (result, value, key) => _.concat(result, key, value),
      [] as string[],
    )
  }

  handleSelectAll = () => {
    this.handleChangeListTree(this.list_select_all, this.list_select_tree)
  }

  handleChangeListTree = (
    select: string[],
    selectTree: { [key: string]: string[] },
  ) => {
    this.choseList.select_all = select
    this.choseList.select_tree = selectTree
    this.choseList.select_batch = _.reduce(
      selectTree,
      (result, v) => _.concat(result, v),
      [] as string[],
    )
  }

  handleClearSelect = () => {
    this.choseList = { ...initChoseList }
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { begin_time, end_time, warehouse_id, ...other } = this.filter

    return {
      begin_time: moment(begin_time).format('x'),
      end_time: moment(end_time).format('x'),
      // category_ids: getSearchCategory(category_ids!),
      warehouse_id,
      ...other,
    }
  }

  getListVirtual = (req: TableRequestParams) => {
    const data = Object.assign(this.getSearchData(), { paging: req.paging })
    return ListVirtualStock(data).then((json) => {
      const { sku_stocks, additional } = json.response
      this.list = getStockAdditional(sku_stocks!, additional!)
      _.each(this.list, (item) => {
        Object.assign(item, {
          warehouse_name:
            (item.warehouse_id &&
              additional?.warehouses?.[item.warehouse_id]?.name) ||
            '',
        })
      })
      this.getListSelectAll()
      return json.response
    })
  }

  createReplaceStock = (
    batch_ids: string[] = [],
    isSelectAll: boolean,
    warehouse_id: string | undefined,
  ) => {
    const req = _.clone(this.replaceStock)
    Object.assign(
      req,
      isSelectAll
        ? { list_batch_request: this.getSearchData() }
        : { batch_ids },
      { warehouse_id: warehouse_id },
    )
    return CreateReplaceStockSheet(req).then((json) => {
      const { sheet_type, stock_sheet_id } = json.response.stock_sheet!
      toSheetF(sheet_type, stock_sheet_id)
      return json.response.stock_sheet!
    })
  }

  createReplaceBatch = (req: SkuStockExpand, select: BatchDetail[]) => {
    // 若有分页需要重写
    const selectSkuAll = req?.batches!.length === req?.batchArray!.length
    const data = {
      sku_id: selectSkuAll ? req.sku_id : '0',
      batch_ids: selectSkuAll
        ? []
        : _.map(req.batches, ({ batch_id }) => batch_id),
      list_virtual_stock_request: selectSkuAll ? this.getSearchData() : {},
      replace_details: _.map(
        select,
        ({ parent_id, shelf_id, stock, sku_base_quantity, ssu_quantity }) => {
          stock!.base_unit!.quantity = '' + sku_base_quantity
          stock!.sku_unit!.quantity = '' + ssu_quantity
          return {
            const_batch_id: parent_id,
            shelf_id,
            stock,
          }
        },
      ),
      warehouse_id: this.filter?.warehouse_id,
    }
    return CreateReplaceBatch(data).then((json) => {
      return json.response
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }

  // export = () => {
  //   return ExportStockSheet({
  //     list_stock_sheet_request: Object.assign(this.getSearchData(), {
  //       paging: {
  //         limit: 0,
  //       },
  //     }),
  //   })
  // }
}

export default new Store()
export type { FtType }
