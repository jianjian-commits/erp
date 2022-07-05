import ByProductFlag from '@/pages/production/components/by_product_flag'
import CellFull from '@/pages/production/components/table_cell_full'
import { toFixed } from '@/pages/production/util'
import { Button, Flex, InputNumber, RightSideModal } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { map_Task_State } from 'gm_api/src/production'
import { observer, Observer } from 'mobx-react'
import React, { FC, useMemo } from 'react'
import type { TaskSkuInfo } from '../../interface'
import store from '../../store'
import Header from './output_header'

interface BatchOutputProps {
  /** 单品默认自动产出 */
  isSingleAutoOutput: boolean
  /** 组合默认自动产出 */
  isComboAutoOutput: boolean
}

const BatchOutput: FC<BatchOutputProps> = observer(
  ({ isSingleAutoOutput, isComboAutoOutput }) => {
    const { outputTaskList } = store

    const handleAmountChange = (
      tIndex: number,
      value: number | null,
      bIndex: number,
    ) => {
      const new_value = value === null ? '' : Big(value).toFixed(2)
      store.updateOutputTaskItem(tIndex, new_value, bIndex, 'output_amount')
    }

    const columns: Column<TaskSkuInfo>[] = useMemo(
      () => [
        {
          Header: t('计划编号'),
          accessor: 'serial_no',
        },
        {
          Header: t('生产成品'),
          accessor: 'sku_name',
          width: 120,
          Cell: (cellProps: {
            row: { index: number; original: TaskSkuInfo }
          }) => {
            const { skus } = cellProps.row.original
            return (
              <CellFull
                list={skus}
                renderItem={(v, index: number) => (
                  <Flex alignCenter>
                    {v.sku_name || '-'}
                    {index !== 0 && <ByProductFlag />}
                  </Flex>
                )}
              />
            )
          },
        },
        {
          Header: t('商品类型'),
          accessor: 'sku_type',
          Cell: (cellProps: {
            row: { index: number; original: TaskSkuInfo }
          }) => {
            const { skus } = cellProps.row.original
            return (
              <CellFull
                list={skus}
                renderItem={(v) =>
                  v.sku_type
                    ? map_Sku_NotPackageSubSkuType[v.sku_type!] || '-'
                    : '-'
                }
              />
            )
          },
        },
        {
          Header: t('计划生产数(基本单位)'),
          accessor: 'plan_amount',
          Cell: (cellProps: {
            row: { index: number; original: TaskSkuInfo }
          }) => {
            const { skus } = cellProps.row.original
            // 副产品没有计划生产数
            return (
              <CellFull
                list={skus}
                renderItem={(v) =>
                  v.plan_amount
                    ? `${toFixed(v.plan_amount || '0')}${v.unit_name}`
                    : '-'
                }
              />
            )
          },
        },
        {
          Header: t('已产出数(基本单位)'),
          accessor: 'finish_amount',
          Cell: (cellProps: {
            row: { index: number; original: TaskSkuInfo }
          }) => {
            const { skus } = cellProps.row.original
            return (
              <CellFull
                list={skus}
                renderItem={(v) =>
                  v.finish_amount
                    ? `${toFixed(v.finish_amount || '0')}${v.unit_name}`
                    : '-'
                }
              />
            )
          },
        },
        {
          Header: t('产出数(基本单位)'),
          accessor: 'output_amount',
          width: 140,
          Cell: (cellProps: {
            row: { index: number; original: TaskSkuInfo }
          }) => {
            const { skus } = cellProps.row.original
            /**
             * 产出数 = 默认计划生产数 - 已产出数
             * 若产出数计算后小于0，默认展示0，且限制只能填写大于0的数
             */
            return (
              <Observer>
                {() => (
                  <CellFull
                    list={skus}
                    renderItem={(v, index: number) => {
                      const amount =
                        v.output_amount === ''
                          ? null
                          : parseFloat(v.output_amount) < 0
                          ? 0
                          : parseFloat(v.output_amount)

                      return (
                        <Flex alignCenter>
                          <InputNumber
                            min={0}
                            style={{ width: '80px' }}
                            value={amount}
                            onChange={(value) =>
                              handleAmountChange(
                                cellProps.row.index,
                                value,
                                index,
                              )
                            }
                            precision={4}
                          />
                          {v.unit_name}
                        </Flex>
                      )
                    }}
                  />
                )}
              </Observer>
            )
          },
        },
        {
          Header: t('计划状态'),
          accessor: 'state',
          Cell: (cellProps: { row: { original: any } }) => {
            const { state } = cellProps.row.original
            return <div>{map_Task_State[state!]}</div>
          },
        },
      ],
      [],
    )

    const validateTasks = () => {
      return (
        outputTaskList.length > 0 &&
        outputTaskList.every((task) => {
          return task.skus.every(
            (sku) => sku.output_amount && +sku.output_amount > 0,
          )
        })
      )
    }

    const handleCancel = () => {
      RightSideModal.hide()
    }

    const handleOK = () => {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(false, false)
    }

    const handleFinish = () => {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(true, false)
    }

    const handleChange = (checked: boolean) => {
      // 更新数据
      store.updateOutputTask(checked)
    }

    return (
      <div className='gm-padding-10'>
        <Header
          isSingleAutoOutput={isSingleAutoOutput}
          isComboAutoOutput={isComboAutoOutput}
          onChange={handleChange}
        />
        <Table tiled border data={outputTaskList.slice()} columns={columns} />
        <Flex justifyEnd className='gm-padding-tb-20'>
          <Button className='gm-margin-right-10' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button
            plain
            type='primary'
            className='gm-margin-right-10'
            disabled={!validateTasks()}
            onClick={handleOK}
          >
            {t('确定')}
          </Button>
          <Button
            type='primary'
            disabled={!validateTasks()}
            onClick={handleFinish}
          >
            {t('确定并标记完工')}
          </Button>
        </Flex>
      </div>
    )
  },
)

export default BatchOutput
