import globalStore from '@/stores/global'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  ListSkuV2Request,
  ListSkuV2Request_RequestData,
  ListUnit,
} from 'gm_api/src/merchandise'
import {
  AppointTimePair,
  AppointTimeSettings_Type,
} from 'gm_api/src/preference'
import {
  CreatePlanTask,
  ListBomSku,
  TaskMergeMode,
  Task_Type,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { CreateTaskInfo, ProductDetailInfo } from './interface'

export const initProductDetail: ProductDetailInfo = {
  sku_id: '',
  unit_id: '',
  order_amount: '',
  sku_name: '',
  category_name: '-',
  suggest_amount: '',
  stock_amount: '',
  unit_name: '',
  unit_ids: [],
  customized_code: '',
}

const defaultTime = `${+moment().add(1, 'd').startOf('day').toDate()}`
const initTaskInfo: CreateTaskInfo = {
  productionOrderId: '',
  delivery_time: {
    [AppointTimeSettings_Type.CLEANFOOD_PRODUCE_TIME_BEFORE_PACK]: defaultTime,
    [AppointTimeSettings_Type.PRODUCE_TIME_BEFORE_PACK]: defaultTime,
    [AppointTimeSettings_Type.PROCESSED_PACK_TIME_BEFORE_ORDER_RECV]:
      defaultTime,
  },
  batch: {
    [AppointTimeSettings_Type.PURCHASE_TIME_BEFORE_PACK]: '',
    [AppointTimeSettings_Type.PRODUCE_TIME_BEFORE_PACK]: '',
    [AppointTimeSettings_Type.PROCESSED_PACK_TIME_BEFORE_ORDER_RECV]: '',
  },
  target_customer_id: '',
  target_customer: undefined,
  target_router: undefined,
  product_details: [{ ...initProductDetail }],
}

class Store {
  // 创建计划需要提交的数据
  taskInfo: CreateTaskInfo = {
    ...initTaskInfo,
  }

  // boms: { [key: string]: Bom } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateCreateTaskInfo<T extends keyof CreateTaskInfo>(
    key: T,
    value: CreateTaskInfo[T],
  ) {
    this.taskInfo[key] = value
  }

  updateListItem<T extends ProductDetailInfo>(index: number, item: T) {
    this.taskInfo.product_details![index] = item
  }

  addProductItem() {
    this.taskInfo.product_details!.push({ ...initProductDetail })
  }

  batchImportProductItem(data: ProductDetailInfo[]) {
    this.taskInfo.product_details = [
      ..._.filter(this.taskInfo.product_details, (v) => !!v.sku_id),
      ...data,
    ]
  }

  deleteProductItem(index: number) {
    this.taskInfo.product_details!.splice(index, 1)
  }

  clearTaskInfo() {
    this.taskInfo = {
      ...initTaskInfo,
    }
  }

  getTaskInfo() {
    const product_details = _.filter(
      _.map(this.taskInfo.product_details, (p) => {
        const { bom_id, base_unit_id, revision } = p.bomInfo!
        return {
          sku_id: p.sku_id,
          order_amount: p.order_amount,
          unit_id: base_unit_id,
          bom_id: bom_id,
          bom_revision: revision,
        }
      }),
      (item) => item.sku_id !== '',
    )

    const { target_customer, delivery_time, batch, productionOrderId } =
      this.taskInfo

    return {
      appoint_time_pairs: _.map(
        delivery_time,
        (value, key: AppointTimeSettings_Type) => ({
          type: key,
          batch: batch?.[key],
          rsp_time: value,
          production_order_id: productionOrderId,
        }),
      ) as AppointTimePair[],
      target_customer_id: target_customer?.value,
      product_details,
    }
  }

  createTask() {
    const info = this.getTaskInfo()

    // 创建预生产计划是异步任务
    return CreatePlanTask({
      ...info,
      task_type: Task_Type.TYPE_PACK,
      task_merge_mode: TaskMergeMode.MERGE_MODE_NOT,
    }).then((json) => {
      if (json) {
        Tip.success(t('发布成功!'))
      }
      return json
    })
  }

  fetchSkuUnitList(related_unit_id: string) {
    // 获取当前单位相同type下的所有单位
    return ListUnit({ related_unit_id }).then((json) => {
      const list = _.map(json.response.units, (unit) => {
        return {
          value: unit.unit_id,
          text: unit.name,
          parent_id: unit.parent_id,
        }
      })
      return list
    })
  }

  // 获取 base_unit_id production_unit_id second_base_unit_id units单位组
  getAllUnits(skuInfo) {
    const getUnitsWithSameGroup = (unitId?: string) => {
      const targetUnit = globalStore.getUnit(unitId || '')
      if (!targetUnit) {
        return []
      }

      return globalStore.unitList.filter((unit) => {
        if (targetUnit.parent_id === '0') {
          return unit.unit_id === unitId || unit.parent_id === unitId
        } else {
          return (
            unit.unit_id === unitId || unit.parent_id === targetUnit.parent_id
          )
        }
      })
    }

    const { base_unit_id, production_unit_id, second_base_unit_id, units } =
      skuInfo || {}
    const baseUnits = getUnitsWithSameGroup(base_unit_id).map((unit) => {
      return {
        ...unit,
        value: unit.unit_id,
        text: unit.name,
        tag: t('基本单位'),
      }
    })
    const productionUnits = getUnitsWithSameGroup(production_unit_id).map(
      (unit) => {
        return {
          ...unit,
          value: unit.unit_id,
          text: unit.name + '（生产单位）',
          tag: t('生产单位'),
        }
      },
    )
    const secondUnits = getUnitsWithSameGroup(second_base_unit_id).map(
      (unit) => {
        return {
          ...unit,
          value: unit.unit_id,
          text: unit.name,
          tag: t('辅助单位'),
        }
      },
    )
    const customUnits =
      units?.units.map((unit) => {
        return {
          ...unit,
          value: unit.unit_id,
          text: unit.name,
          tag: t('自定义单位'),
        }
      }) || []
    const unit_ids = [
      ...baseUnits,
      ...productionUnits,
      ...secondUnits,
      ...customUnits,
    ]
    return unit_ids
  }

  getListBomSku(selectItem = this.taskInfo.target_customer!) {
    // 商品总数列表中的sku_id
    const skuIds = this.taskInfo.product_details
      ?.map((item) => item.sku_id)
      .filter((sku_id) => sku_id !== '')
    if (!skuIds?.length) return

    const params: ListSkuV2Request = {
      filter_params: {
        sku_ids: skuIds,
      },
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }
    const targetCustomerId = selectItem ? selectItem.value : undefined

    return ListBomSku({
      list_sku_v2_request: params,
      target_customer_id: targetCustomerId,
    }).then((json) => {
      const { list_sku_v2_response } = json.response
      const { skus } = list_sku_v2_response!
      // 拿到返回skus里每一个sku的sku_id
      const skuIdsList = skus.map((item) => item.sku_id)

      const copiedList = this.taskInfo.product_details?.slice()
      const filteredList = copiedList?.filter((item) => {
        return item.sku_id === '' || skuIdsList.includes(item.sku_id)
          ? item
          : null
      })
      this.taskInfo.product_details = filteredList

      // 筛选之后如果列表为空则新增一个
      if (this.taskInfo.product_details?.length === 0) {
        this.addProductItem()
      }
    })
  }
}

export default new Store()
