import { t } from 'gm-i18n'
import React, { useMemo, FC } from 'react'
import { observer } from 'mobx-react'
import { Column, Table } from '@gm-pc/table-x'
import { Task_Type, TaskInput, TaskInput_Type } from 'gm_api/src/production'
import _ from 'lodash'
import Big from 'big.js'

import HeaderTip from '@/common/components/header_tip'
import CellFull from '../../../components/table_cell_full'
import store from '../../store'
import { toFixed, numMinus, getUnitInfo } from '@/pages/production/util'
import { dpProduction } from '@/pages/production/enum'

interface ProductDetailProps {
  type?: Task_Type
}

interface ProductDetailInfo {
  sku_name?: string
  plan_amount?: string
  output_amount?: string
  output_amount_rate?: string
  usage_amount_rate?: string
  unit_name?: string
  materials: TaskInput[]
  base_unit_id?: string
}

const ProductDetail: FC<ProductDetailProps> = observer(({ type }) => {
  // 需要 task + task_input 拼接数据, task有成品信息，task_input有物料信息
  const { task, task_inputs, units, skus } = store.taskDetails
  const materials = _.remove(
    _.map(task_inputs?.slice() || [], (i) => ({
      ...i,
      unit_name: getUnitInfo({ units: units!, unit_id: i.unit_id || '' })
        .unitName,
    })),
    ({ type, receive_amount }) =>
      !(
        type === TaskInput_Type.TYPE_SUBSTITUTE_MATERIAL &&
        Big(receive_amount || 0).eq(0)
      ),
  )
  let unit_name = ''
  if (type !== Task_Type.TYPE_PACK) {
    unit_name = getUnitInfo({ units: units!, unit_id: task.unit_id }).unitName
  } else {
    const { sku_id, unit_id } = task
    unit_name = getUnitInfo({ sku_id, unit_id, skus, units: units! }).unitName
  }
  const product_detail: ProductDetailInfo = {
    sku_name: task.sku_name || '-',
    plan_amount: task.plan_amount || '',
    output_amount: task.output_amount || '',
    unit_name,
    output_amount_rate: '-',
    usage_amount_rate: '-',
    base_unit_id: task.base_unit_id,
    materials,
  }
  const list: ProductDetailInfo[] = task ? [{ ...product_detail }] : []
  const columns = useMemo(
    (): Column<ProductDetailInfo>[] => [
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
      },
      {
        Header: t(
          `计划生产数(${
            type === Task_Type.TYPE_PACK ? '包装单位' : '基本单位'
          })`,
        ),
        accessor: 'plan_amount',
        Cell: (cellProps) => {
          const { plan_amount, unit_name } = cellProps.original
          return (
            <div>
              {plan_amount ? `${toFixed(plan_amount)}${unit_name}` : '-'}
            </div>
          )
        },
      },
      {
        Header: t(
          `产出数量(${type === Task_Type.TYPE_PACK ? '包装单位' : '基本单位'})`,
        ),
        accessor: 'output_amount',
        Cell: (cellProps) => {
          const { output_amount, unit_name } = cellProps.original
          return (
            <div>
              {output_amount ? `${toFixed(output_amount)}${unit_name}` : '-'}
            </div>
          )
        },
      },
      {
        Header: (
          <HeaderTip
            header={t('出成率')}
            tip={t(
              '出成率=成品产出数量/物料实际用料之和。当生产成品单位和物料单位不同且不能换算时，出成率不做计算',
            )}
          />
        ),
        show: type === Task_Type.TYPE_PRODUCE_CLEANFOOD,
        accessor: 'output_amount_rate',
        Cell: () => {
          const rate = store.getFinishProductRate('output')
          return <div>{rate === '-' ? rate : `${rate}%`}</div>
        },
      },
      {
        Header: t('物料名称'),
        accessor: 'material_name',
        width: 150,
        Cell: (cellProps) => {
          const {
            original: { materials },
          } = cellProps
          return (
            <CellFull
              list={materials}
              renderItem={(v: TaskInput) => (
                <div>
                  <div>{v.sku_name}</div>
                  {v.type === TaskInput_Type.TYPE_SUBSTITUTE_MATERIAL && (
                    <div className='gm-text-red'>{t('非当前计划原料')}</div>
                  )}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('理论用料数量(基本单位)'), // 即计划用料数量
        accessor: 'plan_usage_amount',
        Cell: (cellProps) => {
          const {
            original: { materials },
          } = cellProps
          return (
            <CellFull
              list={materials}
              renderItem={(v) => (
                <div>
                  {v.type === TaskInput_Type.TYPE_UNSPECIFIED &&
                  v.plan_usage_amount
                    ? `${toFixed(v.plan_usage_amount)}${v.unit_name}`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('领料数量(基本单位)'),
        accessor: 'receive_amount',
        Cell: (cellProps) => {
          const {
            original: { materials },
          } = cellProps
          return (
            <CellFull
              list={materials}
              renderItem={(v) => (
                <div>
                  {v.receive_amount
                    ? `${toFixed(v.receive_amount)}${v.unit_name}`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('退料数量(基本单位)'),
        accessor: 'return_amount',
        Cell: (cellProps) => {
          const {
            original: { materials },
          } = cellProps
          return (
            <CellFull
              list={materials}
              renderItem={(v) => (
                <div>
                  {v.return_amount
                    ? `${toFixed(v.return_amount)}${v.unit_name}`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('实际用料(基本单位)'),
        accessor: 'actual_usage_amount',
        Cell: (cellProps) => {
          const {
            original: { materials },
          } = cellProps
          // 实际用料 = 领料数量 - 退料数量
          return (
            <CellFull
              list={materials}
              renderItem={(v) => {
                return (
                  <div>
                    {v.receive_amount && v.return_amount
                      ? `${toFixed(
                          numMinus(
                            Big(v.receive_amount || '0').toFixed(dpProduction),
                            Big(v.return_amount || '0').toFixed(dpProduction),
                          ),
                        )}${v.unit_name}`
                      : '-'}
                  </div>
                )
              }}
            />
          )
        },
      },
    ],
    [type, units, skus],
  )

  return <Table data={list} columns={columns} border />
})

export default ProductDetail
