import { toFixed } from '@/pages/production/util'
import { Button, Flex, InputNumber, RightSideModal, Tip } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { map_Task_State } from 'gm_api/src/production'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import React, { FC, useMemo } from 'react'
import CellFull from '@/pages/production/components/table_cell_full'
import planStore from '@/pages/production/plan_management/plan/store'
import store from '@/pages/production/plan_management/plan/task/store'
import Header from './output_header'
import { TaskSkuInfo } from '@/pages/production/plan_management/plan/task/interface'

import Big from 'big.js'

const BatchOutput: FC = observer(() => {
  const { OutputTaskList } = store
  const handleAmountChange = (
    tIndex: number,
    value: number | null,
    bIndex: number,
  ) => {
    const new_value = value === null ? '' : Big(value).toFixed(4)
    store.updateOutputTaskItem(tIndex, new_value, bIndex, 'output_amount')
  }
  const columns = useMemo(
    () => [
      {
        Header: t('指令编号'),
        accessor: 'task_command_no',
        width: 170,
      },
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
        width: 170,
        Cell: (cellProps: {
          row: { index: number; original: TaskSkuInfo }
        }) => {
          const { sku } = cellProps.row.original
          return <CellFull list={sku} renderItem={(v) => v.sku_name || '-'} />
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'sku_type',
        minWidth: 80,
        Cell: (cellProps: {
          row: { index: number; original: TaskSkuInfo }
        }) => {
          const { sku } = cellProps.row.original
          // 包装任务中除了第一个是非包材成品，其余的是包材
          return (
            <CellFull
              list={sku}
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
        Header: t('计划生产数'),
        accessor: 'plan_amount',
        minWidth: 80,
        Cell: (cellProps: {
          row: { index: number; original: TaskSkuInfo }
        }) => {
          const { sku } = cellProps.row.original

          // 副产品没有计划生产数
          return (
            <CellFull
              list={sku}
              renderItem={(v) => (
                <div>
                  {v.plan_amount === '-'
                    ? '-'
                    : `${toFixed(v.plan_amount || '0')}${v.base_unit_name}`}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('已产出数(基本单位)'),
        accessor: 'acutal_amount',
        minWidth: 80,
        Cell: (cellProps: {
          row: { index: number; original: TaskSkuInfo }
        }) => {
          const { sku } = cellProps.row.original
          return (
            <CellFull
              list={sku}
              renderItem={(v) =>
                `${toFixed(v.actual_amount || '0')}${v.base_unit_name}`
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
          const { sku } = cellProps.row.original
          /**
           * 产出数 = 默认计划生产数 - 已产出数
           * 若产出数计算后小于0，默认展示0，且限制只能填写大于0的数
           */
          return (
            <Observer>
              {() => (
                <CellFull
                  list={sku}
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
                        {v.base_unit_name}
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
        width: 90,
        accessor: 'state',
        Cell: (cellProps: { row: { original: any } }) => {
          const { state } = cellProps.row.original
          return <div>{map_Task_State[state!]}</div>
        },
      },
    ],
    [],
  )

  const handleCancel = () => {
    RightSideModal.hide()
  }

  // 产出校验规则: 生产成品包装单位与基本单位只要其中一个单位填了数值，另外一个必须填
  const handleCheck = () => {
    const { OutputTaskList } = store
    if (!OutputTaskList.length) {
      Tip.danger(t('未下达计划不可产出'))
      return false
    }
    const noValidSkus = _.filter(OutputTaskList, (t) => {
      const pack_base_output_amount: string =
        t.sku[0].pack_base_output_amount || ''
      const pack_output_amount: string = t.sku[0].pack_output_amount || ''
      return (
        (pack_base_output_amount === '' && pack_output_amount !== '') ||
        (pack_base_output_amount !== '' && pack_output_amount === '')
      )
    })

    if (noValidSkus.length) {
      Tip.tip(
        t(
          '成品中填写了包装单位或基本单位的产出数，另一个单位的产出数不可为空，请检查！',
        ),
      )
      return false
    }

    return true
  }
  // 确认回调事件
  const handleOK = () => {
    if (handleCheck()) {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(false, false)
      planStore.HandleProductionOrder()
    }
  }
  // 标记完工回调事件
  const handleFinish = () => {
    if (handleCheck()) {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(true, false)
      planStore.HandleProductionOrder()
    }
  }

  const handleChange = (checked: boolean) => {
    // 更新数据
    store.updateOutputTask(checked)
  }

  return (
    <div className='gm-padding-10'>
      <Header
        onChange={handleChange}
        isSingleAutoOutput={false}
        isComboAutoOutput={false}
      />
      <Table tiled border data={OutputTaskList.slice()} columns={columns} />
      <Flex justifyEnd className='gm-padding-tb-20'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button
          plain
          type='primary'
          className='gm-margin-right-10'
          onClick={handleOK}
        >
          {t('确定')}
        </Button>
        <Button
          type='primary'
          onClick={handleFinish}
          disabled={OutputTaskList.length === 0}
        >
          {t('确定并标记完工')}
        </Button>
      </Flex>
    </div>
  )
})

export default BatchOutput
