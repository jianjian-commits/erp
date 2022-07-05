import React, { FC, useEffect, useMemo } from 'react'
import { t } from 'gm-i18n'
import { Column, Table } from '@gm-pc/table-x'
import { Flex } from '@gm-pc/react'

import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import { Task_Type } from 'gm_api/src/production'
import moment from 'moment'
import Big from 'big.js'

import store from './store'
import HeaderTip from '@/pages/production/components/header_tip'
import CellFull from '@/pages/production/components/table_cell_full'
import ByProductFlag from '@/pages/production/components/by_product_flag'
import MaterialItem from './material_item'
import { numMinus, toFixed } from '@/pages/production/util'
import { toFixedZero, dpProduction } from '@/pages/production/enum'
import type { ReportDetailInfo } from '../interface'
import globalStore from '@/stores/global'

interface Props {
  type: Task_Type
}

interface Query {
  task_ids: string
}

const ProductionList: FC<Props> = observer(({ type }) => {
  const location = useGMLocation<Query>()
  const is_pack = type === Task_Type.TYPE_PACK
  useEffect(() => {
    store.getTasksOfSku((location.query.task_ids || '').split(','))
  }, [location.query.task_ids])

  const column = useMemo(
    (): Column<ReportDetailInfo>[] => [
      {
        Header: t('计划交期'),
        accessor: 'delivery_time',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <div>
              {moment(new Date(+cellProps.original.delivery_time!)).format(
                'YYYY-MM-DD HH:mm',
              )}
            </div>
          )
        },
      },
      {
        Header: t('计划编号'),
        accessor: 'serial_no',
        minWidth: 100,
      },
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const { by_products, sku_name } = cellProps.original
          if (is_pack || !by_products?.by_products?.length) {
            return <div>{sku_name || '-'}</div>
          }

          // 第一个一定为成品
          return (
            <CellFull
              list={[{ sku_name }, ...by_products.by_products]}
              renderItem={(v, index: number) => (
                <Flex>
                  {index !== 0 && <ByProductFlag />}
                  <span className='gm-padding-left-5'>{v.sku_name || '-'}</span>
                </Flex>
              )}
            />
          )
        },
      },
      {
        Header: t('规格'),
        accessor: 'spec',
        hide: !is_pack,
        minWidth: 100,
      },
      {
        Header: t('BOM名称'),
        accessor: 'bom_name',
        hide: is_pack,
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <MaterialItem
              original={cellProps.original}
              field='bom_name'
              value={cellProps.original.bom_name}
              taskType={type}
            />
          )
        },
      },
      {
        Header: t('基本单位'),
        accessor: 'base_unit_name',
        hide: is_pack,
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <MaterialItem
              original={cellProps.original}
              field='base_unit_name'
              value={cellProps.original.base_unit_name}
              taskType={type}
            />
          )
        },
      },
      {
        Header: t('包装单位'),
        accessor: 'pack_unit_name',
        hide: !is_pack,
        minWidth: 100,
      },
      {
        Header: !is_pack
          ? t('计划生产数（基本单位）')
          : t('计划包装数（包装单位）'),
        accessor: 'plan_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <MaterialItem
              original={cellProps.original}
              field='plan_amount'
              value={cellProps.original.plan_amount}
              taskType={type}
              isAmount
            />
          )
        },
      },
      {
        Header: !is_pack
          ? t('产出数量（基本单位）')
          : t('产出数量（包装单位）'),
        accessor: 'output_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <MaterialItem
              original={cellProps.original}
              field='output_amount'
              value={cellProps.original.output_amount}
              taskType={type}
              isAmount
            />
          )
        },
      },
      {
        Header: t('用料金额'),
        accessor: 'input_actual_usage_total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <MaterialItem
              original={cellProps.original}
              field='input_actual_usage_total_price'
              value={cellProps.original.input_actual_usage_total_price}
              taskType={type}
              isAmount
            />
          )
        },
      },
      {
        Header: t('平均成本'),
        accessor: 'avg_price',
        minWidth: 100,
        Cell: (cellProps) => {
          // 用料金额 / 产出数量
          const { input_actual_usage_total_price, output_amount } =
            cellProps.original

          const avg_price =
            toFixed(output_amount || '0') !== toFixedZero
              ? Big(toFixed(input_actual_usage_total_price || '0'))
                  .div(toFixed(output_amount || '0'))
                  .toFixed(dpProduction)
              : ''

          return (
            <MaterialItem
              original={cellProps.original}
              field='avg_price'
              value={avg_price}
              taskType={type}
              isAmount
            />
          )
        },
      },
      {
        Header: (
          <HeaderTip
            right
            header={t('实际出成率')}
            info={t('实际出成率=产出数量/实际用料数量')}
            tipStyle={{ width: '220px' }}
          />
        ),
        accessor: 'actual_product_percentage',
        hide: is_pack,
        minWidth: 100,
        Cell: (cellProps) => {
          // output_amount / actual_usage_amount
          /** 目前只计算单物料的实际出成率，多物料的不计算
           * 实际用料数量在task_input
           */
          let actual_product_percentage = ''
          const { output_amount, unit_id, task_inputs } = cellProps.original
          let actual_usage_amount
          if (task_inputs?.length === 1) {
            // 实际用料 = 领料 - 退料
            actual_usage_amount = numMinus(
              task_inputs[0].receive_amount,
              task_inputs[0].return_amount,
            )

            if (task_inputs[0].unit_id !== unit_id) {
              actual_usage_amount = globalStore
                .getUnitRate(task_inputs[0].unit_id!, unit_id)
                .times(actual_usage_amount)
                .toFixed()
            }

            actual_product_percentage =
              toFixed(actual_usage_amount) === toFixedZero
                ? ''
                : Big(output_amount)
                    .div(actual_usage_amount)
                    .times(100)
                    .toFixed(dpProduction)
          }

          return (
            <MaterialItem
              original={cellProps.original}
              field='actual_product_percentage'
              value={
                actual_product_percentage
                  ? `${actual_product_percentage}%`
                  : '-'
              }
              taskType={type}
            />
          )
        },
      },
    ],
    [type],
  )

  const { tasksOfSku } = store

  return <Table columns={column as any} data={tasksOfSku.slice()} border />
})

export default ProductionList
