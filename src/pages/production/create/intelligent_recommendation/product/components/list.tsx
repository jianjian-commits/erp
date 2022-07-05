import React, { useMemo } from 'react'
import { t } from 'gm-i18n'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { KCInputNumber } from '@gm-pc/keyboard'
import { observer, Observer } from 'mobx-react'

import store from '../../store'
import _ from 'lodash'

const { TABLE_X } = TableXUtil

const List = () => {
  const { selectedRecommendSkus, recommendSkuList } = store
  const columns: Column[] = useMemo(
    () => [
      {
        Header: t('序号'),
        id: 'index',
        fixed: 'left',
        width: TABLE_X.WIDTH_NO,
        Cell: (cellProps) => {
          return <div>{cellProps.index + 1}</div>
        },
      },
      {
        Header: t('规格名称'),
        accessor: 'form_name',
      },
      {
        Header: t('分类'),
        accessor: 'category_name_1',
        Cell: (cellProps) => {
          const { category_name_1, category_name_2, sku_name } =
            cellProps.original
          return `${category_name_1}/${category_name_2}/${sku_name}`
        },
      },
      {
        Header: t('规格'),
        accessor: 'suggest_plan_production',
        Cell: (cellProps) => {
          const { form, form_unit } = cellProps.original
          return `${form}/${form_unit}`
        },
      },
      {
        Header: t('成品库存数'),
        accessor: 'finished_goods_inventory',
      },
      {
        Header: t('建议计划生产数（包装单位）'),
        accessor: 'suggest_plan_product_inventory_box',
        isKeyboard: true,
        width: TABLE_X.WIDTH_SEARCH,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const {
                  original: { suggest_plan_product_inventory_box },
                  index,
                } = cellProps
                return (
                  <KCInputNumber
                    value={suggest_plan_product_inventory_box}
                    onChange={(value: number) => {
                      store.updateRecommendSkuList(
                        index,
                        'suggest_plan_product_inventory_box',
                        value,
                      )
                    }}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('建议计划生产数（基本单位）'),
        accessor: 'suggest_plan_product_inventory_base',
        width: TABLE_X.WIDTH_SEARCH,
        Cell: (cellProps) => {
          const { suggest_plan_product_inventory_base, form_unit } =
            cellProps.original
          return `${suggest_plan_product_inventory_base}/${form_unit}`
        },
      },
    ],
    [],
  )

  return (
    <Table
      isKeyboard
      isSelect
      id='recommend_product_id'
      keyField='form_id'
      columns={columns}
      onAddRow={_.noop}
      data={recommendSkuList.slice()}
      selected={selectedRecommendSkus.slice()}
      onSelect={(selected: any) => {
        store.updateSelectedRecommendSkus(selected)
      }}
    />
  )
}
export default observer(List)
