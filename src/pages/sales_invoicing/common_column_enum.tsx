import React from 'react'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { Column } from '@gm-pc/table-x'
import { getUnNillText, toFixedSalesInvoicing } from '@/common/util'
import {
  MutiUnitDisplay,
  ColumnSortHeader,
  CommonBaseaQuantityCell,
  CommonBaseaQuantitySecCell,
} from '@/pages/sales_invoicing/components'
import { Observer, observer } from 'mobx-react'
import { isInShareV2 } from '@/pages/sales_invoicing/util'
import _ from 'lodash'

/**
 * 存放仓储下的一些多地方用到的公共Columns
 */
type ColumnsType = 'MUTI_UNIT_DISPLAY' | 'CURRENT_STOCK' | 'SECOND_QUANTITY'

export const LOCAL_MODULE_COMMON_COLUMN: Record<ColumnsType, Function> = {
  MUTI_UNIT_DISPLAY: (params = {}, columnConfig = {}): Column => {
    return {
      Header: t('出库数(多单位汇总)'),
      diyEnable: false,
      isKeyboard: true,
      accessor: 'base_quantity',
      width: 190,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const data = cellProps.original
        const second_base_unit_id = data?.second_base_unit_id
        if (
          second_base_unit_id &&
          second_base_unit_id !== '0' &&
          second_base_unit_id !== 'undefined'
        ) {
          // 如果同时开了辅助单位，则不展示多单位
          return <>{getUnNillText('')}</>
        }
        return (
          <MutiUnitDisplay
            index={cellProps.index}
            data={cellProps.original}
            accessor='base_quantity'
            {...params}
          />
        )
      },

      ...columnConfig,
    }
  },
  CURRENT_STOCK: (params = {}, columnConfig = {}): Column => {
    return {
      Header: t('当前库存(多单位汇总)'),
      diyEnable: false,
      isKeyboard: true,
      accessor: 'current_stock',
      width: 190,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        const data = cellProps.original
        const second_base_unit_id = data?.second_base_unit_id
        if (
          second_base_unit_id &&
          second_base_unit_id !== '0' &&
          second_base_unit_id !== 'undefined'
        ) {
          // 如果同时开了辅助单位，则不展示多单位
          return <>{getUnNillText('')}</>
        }
        return (
          <MutiUnitDisplay
            index={cellProps.index}
            data={cellProps.original}
            accessor='current_stock'
            {...params}
          />
        )
      },

      ...columnConfig,
    }
  },
  SECOND_QUANTITY: (params = {}, columnConfig = {}): Column => {
    return {
      Header: t('入库数（辅助单位）'),
      diyEnable: false,
      accessor: 'base_quantity',
      minWidth: 150,
      hide: globalStore.isLite,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { second_base_unit_id, second_base_unit_quantity } =
                cellProps.original
              const second_base_unit_name =
                globalStore.getUnitName(second_base_unit_id)
              // 没有辅助单位，不显示
              if (!_.toNumber(second_base_unit_id)) {
                return <span>-</span>
              }
              return (
                <span>
                  {toFixedSalesInvoicing(second_base_unit_quantity) +
                    second_base_unit_name}
                </span>
              )
            }}
          </Observer>
        )
      },
      ...columnConfig,
    }
  },
}

/**
 * @description 多单位汇总column展示
 * @params params 给子组件的props
 * @params columnConfig tableColumn的可选项
 */
export const quoteCommonColumn = (
  type: ColumnsType,
  params = {},
  columnConfig = {},
) => {
  return LOCAL_MODULE_COMMON_COLUMN[type](params, columnConfig)
}

/**
 * @description 表头添加排序的表头
 * @param colConf 表头需要自定义的字段
 * @param store 当前的store
 * @returns ReactNode
 */
export const sortHeader = (
  colConf: { title: string; field?: string },
  store: any,
) => {
  return observer(() => {
    const { sortItem, sortProductList } = store
    return (
      <ColumnSortHeader
        {...colConf}
        sortItem={sortItem}
        sortProductList={sortProductList}
      />
    )
  })
}

/**
 * @description 仓储模块下入库数(基本单位)和入库数(辅助单位)联动处理，作为公共抽出
 * @param { title, is_replace } title表头名称, is_replace
 * @param apportionList 分摊列表
 * @param changeProductItemByStore Function 更新store的出入库数
 */
interface CustomizeProps {
  title: string
  keyField?: 'input_stock' | 'input_in_stock' | 'input_out_stock'
  is_replace: boolean
}
export const BaseQuantityColumn = (
  { title, is_replace, keyField }: CustomizeProps = {
    title: '入库数',
    keyField: 'input_stock',
    is_replace: false,
  },
  changeProductItemByStore: Function,
  apportionList: any[] = [],
) => {
  return [
    {
      Header: t(`${globalStore.isLite ? title : title + '（基本单位）'}`),
      diyEnable: false,
      isKeyboard: !is_replace,
      accessor: 'base_quantity',
      minWidth: 140,
      Cell: (cellProps) => {
        const { index, original } = cellProps
        return (
          <Observer>
            {() => {
              const { sku_id } = original
              const changeProductItem = (changeContent = {}) => {
                changeProductItemByStore(index, {
                  ...changeContent,
                  // 特殊值处理
                  // ...
                })
              }
              /** 是否加入了分摊 */
              const isInShare = isInShareV2(apportionList, sku_id)
              return (
                <CommonBaseaQuantityCell
                  is_replace={is_replace}
                  isInShare={isInShare}
                  index={index}
                  keyField={keyField}
                  data={original}
                  changeProductItem={changeProductItem}
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: t(`${globalStore.isLite ? title : title + '（辅助单位）'}`),
      diyEnable: false,
      isKeyboard: !is_replace,
      accessor: 'base_quantity_second',
      minWidth: 140,
      Cell: (cellProps) => {
        const { index, original } = cellProps
        return (
          <Observer>
            {() => {
              const { sku_id } = original
              const changeProductItem = (changeContent = {}) => {
                changeProductItemByStore(index, {
                  ...changeContent,
                  // 特殊值处理
                  // ...
                })
              }
              /** 是否加入了分摊 */
              const isInShare = isInShareV2(apportionList, sku_id)
              return (
                <CommonBaseaQuantitySecCell
                  is_replace={is_replace}
                  isInShare={isInShare}
                  index={index}
                  keyField={keyField}
                  data={original}
                  changeProductItem={changeProductItem}
                />
              )
            }}
          </Observer>
        )
      },
    },
  ]
}
