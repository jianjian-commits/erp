import {
  useTableModalSelected,
  UseTableModalSelectedOptions,
} from '@/common/hooks'
import React, { FC, useState, useEffect, useRef } from 'react'
import {
  ListBatch,
  ListMaterialInBatches,
  ListShelf,
  Shelf,
} from 'gm_api/src/inventory'
import { Flex, Button } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'

import SelectedTable from './selected_table'
import Filter from './filter'
import UnselectedTable from './un_selected_table'
import { useAsync } from '@gm-common/hooks'
import type { FilterType, BatchLogFilterType, BatchFilterType } from './filter'

import {
  adapterBatch,
  adapterBatchLog,
  BatchData,
  mergeData,
  getRouteCustomerInfo,
} from './util'
import { isValid, toFixedSalesInvoicing } from '@/common/util'
import { Sku_SkuType } from 'gm_api/src/merchandise'
import { backEndDp } from '../../util'
import { ListRoute } from 'gm_api/src/delivery'
import { ListCustomer } from 'gm_api/src/enterprise'

interface BatchSelectProps
  extends Omit<UseTableModalSelectedOptions<BatchData>, 'defaultSelectedData'> {
  productInfo: {
    skuInfo: {
      /** 搜索sku_id的批次 */
      sku_id: string
      /** 需求数单位名 */
      skuBaseUnitName: string
      /** 需求数，基本单位 */
      skuBaseCount?: number
      /** todo 废弃 */
      sku_type: Sku_SkuType
      /** 搜索规格批次 */
      sku_base_unit_id: string
    }
    ssuInfo: { ssu_unit_id: string }
  }
  defaultFilter?: Partial<FilterType>
  onEnsure: (data: BatchData[]) => void
  onCancel: () => void
  /** 是否需要规格 */
  hasSkuUnit?: boolean
  /** 是否需要货位 */
  hasTarget?: boolean
  /** 是否需要生产对象 */
  hasCustomer?: boolean
  /** 用来操作数据 */
  adapterDataFunc?: (data: BatchData[]) => BatchData[]
  type?: 'inventory' | 'refund_stock_in' | 'virtual'
  filterInfo?: { maxTime?: Date }
  needInputLimit?: boolean
  needSsuInputLimit?: boolean
  disabledSsu?: boolean
  selected: BatchData[]
  /** 是否允许包装单位(废弃)联动 */
  canPackage?: boolean
  free?: boolean
  warehouseId?: string
}
const formType = [{ value: 1, text: 'inventory' }]

interface ContextContent
  extends Pick<
    BatchSelectProps,
    | 'selectKey'
    | 'type'
    | 'needInputLimit'
    | 'hasSkuUnit'
    | 'hasCustomer'
    | 'hasTarget'
    | 'needSsuInputLimit'
    | 'disabledSsu'
  > {
  unAssignedAmount?: number
}

export const BatchSelectContext = React.createContext<ContextContent>({
  selectKey: 'batch_id',
})

// 这里的复杂绝对是因为data的处理问题，选择的数据跟搜索的数据和输入的数据的处理太恶心了。
const BatchSelect: FC<BatchSelectProps> = (props) => {
  const {
    selected,
    selectKey,
    warehouseId,
    productInfo: {
      skuInfo: {
        skuBaseCount,
        skuBaseUnitName,
        sku_type,
        sku_id,
        sku_base_unit_id,
      },
      ssuInfo: { ssu_unit_id },
    },
    defaultFilter,
    onEnsure,
    onCancel,
    hasSkuUnit,
    hasCustomer,
    hasTarget,
    adapterDataFunc,
    type,
    filterInfo,
    needInputLimit,
    canPackage,
    needSsuInputLimit,
    disabledSsu,
    free,
  } = props

  const [data, setData] = useState<BatchData[]>([])
  const isInventory = _.find(formType, (v) => v.text === type!)?.value === 1
  const isRefundStockIn = type === 'refund_stock_in'
  const isVirtual = type === 'virtual'

  const shelfRef = useRef<Shelf[]>([])

  const isHandledRef = useRef(false) // 是否已经操作过selected，用来判断添加数据为selected还是selectedData

  const keyListFromFetchRef = useRef<string[]>([]) // 记录搜索的结果

  const fetchData = (filter: BatchLogFilterType | BatchFilterType) => {
    const shelfPro = ListShelf({ warehouse_id: warehouseId }).then((json) => {
      shelfRef.current = json.response.shelves

      return json
    })
    if (isRefundStockIn) {
      const batchLogPro = ListMaterialInBatches({
        material_order_id: filter?.material_order_id,
        sku_id: filter?.sku_id,
        with_additional: true,
        warehouse_id: warehouseId,
      })

      return Promise.all([shelfPro, batchLogPro]).then((res) => {
        const merge = mergeData(
          isHandledRef.current ? selectedData : selected,
          adapterBatchLog(res[1].response, { shelfList: shelfRef.current }),
          selectKey,
        )
        setData(adapterDataFunc ? adapterDataFunc(merge) : merge)
        keyListFromFetchRef.current = _.map(
          res[1].response.batch_logs,
          (item) => item[selectKey],
        )
        return res
      })
    }

    const batchPro = ListBatch({
      ...filter,
      warehouse_id: warehouseId,
    })
    if (hasCustomer) {
      const routeLst = ListRoute({ paging: { limit: 999 } })
      const customerList = ListCustomer({ paging: { limit: 999 } })

      // 使用addational 会拿不到已选的批次关联对象信息
      return Promise.all([shelfPro, batchPro, routeLst, customerList]).then(
        (res) => {
          const merge = mergeData(
            // 用于获取selected的关联对象
            getRouteCustomerInfo(
              isHandledRef.current ? selectedData : selected,
              {
                routeLst: res[2].response.routes,
                customerList: res[3].response.customers,
              },
            ),

            adapterBatch(res[1].response, {
              shelfList: shelfRef.current,
              routeLst: res[2].response.routes,
              customerList: res[3].response.customers,
            }),
            selectKey,
          )

          setData(adapterDataFunc ? adapterDataFunc(merge) : merge)
          keyListFromFetchRef.current = _.map(
            res[1].response.batches,
            (item) => item[selectKey],
          )
          return res
        },
      )
    }

    return Promise.all([shelfPro, batchPro]).then((res) => {
      const merge = mergeData(
        isHandledRef.current ? selectedData : selected,
        adapterBatch(res[1].response, {
          shelfList: shelfRef.current,
        }),
        selectKey,
      )
      setData(adapterDataFunc ? adapterDataFunc(merge) : merge)
      keyListFromFetchRef.current = _.map(
        res[1].response.batches,
        (item) => item[selectKey],
      )
      return res
    })
  }

  const { loading, run } = useAsync(fetchData)

  const selectedKeyList = _.map(selected, (item) => item[selectKey])

  const { selectedData, unSelectedData, onAdd, onDel, onChangeValue } =
    useTableModalSelected<BatchData>(data, {
      defaultSelectedData: selectedKeyList as any,
      selectKey,
    })

  const selectedRef = useRef(selectedData)
  const unSelectedRef = useRef(unSelectedData)
  const dataRef = useRef(data)
  dataRef.current = data
  useEffect(() => {
    selectedRef.current = selectedData
    unSelectedRef.current = unSelectedData
  }, [selectedData, unSelectedData])

  const handleInputChange = (id: string, name: any, value: any) => {
    onChangeValue(id, name, value)

    if (name === 'sku_base_quantity_show') {
      const all = selectedRef.current.concat(unSelectedRef.current)

      const currentData = _.find(all, (item) => item[selectKey] === id)

      const data = isValid(value)
        ? Big(value)
            .div(1)
            // .div(currentData!.ssu_unit_rate)
            .toFixed(backEndDp)
        : null
      let targetNum = data
      if (needSsuInputLimit) {
        const {
          sku_base_quantity_show,
          sku_base_material_out,
          sku_stock_base_quantity,
          ssu_base_unit_rate,
          ssu_unit_rate,
        } = currentData!
        const currentMax = +Big(unAssignedAmount ?? 0).plus(
          sku_base_quantity_show ?? 0,
        )

        const total =
          type === 'refund_stock_in'
            ? sku_base_material_out!
            : sku_stock_base_quantity
        const max = toFixedSalesInvoicing(
          Big(Big(currentMax).gt(total) ? +total : currentMax)
            .div(ssu_base_unit_rate)
            .div(ssu_unit_rate),
        )
        targetNum = Big(max).gt(targetNum ?? 0) ? targetNum : max
      }

      onChangeValue(id, 'ssu_quantity', targetNum)
      onChangeValue(
        id,
        'ssu_quantity_show',
        isValid(targetNum) ? toFixedSalesInvoicing(+targetNum!) : null,
      ) // 需要换算的地方就需要两份数据，因为后台需要的是backEndDp位小数，前端是dpSalesInvoicing位
    }

    if (canPackage && name === 'ssu_quantity_show') {
      const all = selectedRef.current.concat(unSelectedRef.current)

      const currentData = _.find(all, (item) => item[selectKey] === id)

      const data = isValid(value)
        ? Big(value)
            .times(currentData!.ssu_base_unit_rate)
            .times(currentData!.ssu_unit_rate)
            .toFixed(backEndDp)
        : null

      let targetNum = data
      if (needInputLimit) {
        const {
          sku_base_quantity_show,
          sku_base_material_out,
          sku_stock_base_quantity,
        } = currentData!
        const currentMax = +Big(unAssignedAmount ?? 0).plus(
          sku_base_quantity_show ?? 0,
        )

        const total =
          type === 'refund_stock_in'
            ? sku_base_material_out!
            : sku_stock_base_quantity
        const max = toFixedSalesInvoicing(
          Big(currentMax).gt(total) ? +total : currentMax,
        )
        targetNum = Big(max).gt(targetNum ?? 0) ? targetNum : max
      }

      onChangeValue(id, 'sku_base_quantity', data)
      onChangeValue(
        id,
        'sku_base_quantity_show',
        isValid(data) ? toFixedSalesInvoicing(+data!) : null,
      )
    }
  }

  const handleEnsure = () => {
    onEnsure(selectedData)
  }

  const unAssignedAmount: number | string = free
    ? Number.MAX_SAFE_INTEGER - 1000
    : !skuBaseCount
    ? Number.MAX_SAFE_INTEGER - 1000
    : skuBaseCount
  let unAssignedAmount2 = skuBaseCount ?? '0'
  if (!isInventory) {
    // 计算待分配出库数
    _.each(selectedData, (item) => {
      unAssignedAmount2 = toFixedSalesInvoicing(
        Big(unAssignedAmount2 || 0).minus(item.sku_base_quantity || 0),
      )
    })
  }

  const handleAdd = (addData: BatchData) => {
    const merge = mergeData(
      onAdd(addData).selected,
      _.filter(
        dataRef.current,
        (item) => keyListFromFetchRef.current.includes(item[selectKey]), // 已当前搜索条件的数据为准
      ),
      selectKey,
    )
    setData(adapterDataFunc ? adapterDataFunc(merge) : merge)

    isHandledRef.current = true
  }

  const handleDel = (id: string) => {
    const { selected: curSelected, unSelected: delUnSelected } = onDel(id)

    const data: BatchData[] = []
    _.each(
      dataRef.current,
      (item) => {
        if (keyListFromFetchRef.current.includes(item[selectKey])) {
          if (item[selectKey] !== id) {
            data.push(item)
          } else {
            data.push(_.find(delUnSelected, (item) => item[selectKey] === id)!) // 需要取在selected时输入的值
          }
        }
      }, // 已当前搜索条件的数据为准
    )

    const merge = mergeData(curSelected, data, selectKey)
    setData(adapterDataFunc ? adapterDataFunc(merge) : merge)

    isHandledRef.current = true
  }

  return (
    <Flex column>
      <BatchSelectContext.Provider
        value={{
          unAssignedAmount,
          needInputLimit,
          needSsuInputLimit,
          selectKey,
          hasSkuUnit,
          hasCustomer,
          hasTarget,
          type,
          disabledSsu,
        }}
      >
        {/* 已选择的表格数据 */}

        {isVirtual || (
          <Flex className='gm-margin-10'>
            <div className='gm-margin-right-10'>
              {`需求数 ${
                toFixedSalesInvoicing(Big(skuBaseCount || 0)) + skuBaseUnitName
              }`}
            </div>
            <div className='gm-margin-right-10'>
              {t('待分配超支数')}&nbsp;
              {toFixedSalesInvoicing(Big(unAssignedAmount2 || 0)) +
                skuBaseUnitName}
            </div>
          </Flex>
        )}
        {/* 虚拟库存批次 */}

        <SelectedTable
          data={selectedData}
          onInputChange={handleInputChange}
          onDel={handleDel}
        />

        {/* 筛选条件 */}
        <Filter
          onSearch={run}
          loading={loading}
          defaultProduct={{
            sku_id,
            ssu_unit_id,
            sku_base_unit_id,
            sku_type,
          }}
          warehouseId={warehouseId}
          defaultFilter={{ ...defaultFilter }}
          maxTime={filterInfo?.maxTime}
          shelf={shelfRef.current}
        />
        {/* 待选择的表格数据 */}
        <UnselectedTable
          data={unSelectedData}
          onAdd={handleAdd}
          onInputChange={handleInputChange}
        />
      </BatchSelectContext.Provider>
      <Flex justifyCenter className='gm-margin-top-20'>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleEnsure}>
          {t('确认')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default BatchSelect
