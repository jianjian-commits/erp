import { toFixed } from '@/pages/production/util'
import { Button, Flex, RightSideModal, Tip } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  map_Sku_NotPackageSubSkuType,
  map_Sku_PackageSubSkuType,
} from 'gm_api/src/merchandise'
import { map_Task_State } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useMemo } from 'react'
import CellFull from '../../../components/table_cell_full'
import type { TaskSkuInfo } from '../../interface'
import store from '../../store'
import CellAmount from './cell_amount'
import Header from './output_header'

const BatchOutput: FC = observer(() => {
  const { outputTaskList } = store

  const columns: Column<TaskSkuInfo>[] = useMemo(
    () => [
      {
        Header: t('计划编号'),
        accessor: 'serial_no',
        minWidth: 80,
      },
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
        width: 100,
        Cell: (cellProps) => {
          const { skus } = cellProps.original
          return <CellFull list={skus} renderItem={(v) => v.sku_name || '-'} />
        },
      },
      {
        Header: t('商品类型'),
        accessor: 'sku_type',
        minWidth: 80,
        Cell: (cellProps) => {
          const { skus } = cellProps.original
          // 包装任务中除了第一个是非包材成品，其余的是包材
          return (
            <CellFull
              list={skus}
              renderItem={(v, i: number) => (
                <div>
                  {i === 0
                    ? map_Sku_NotPackageSubSkuType[v.sku_type!] || '-'
                    : map_Sku_PackageSubSkuType[v.sku_type] || '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('计划生产数'),
        accessor: 'plan_amount',
        minWidth: 80,
        Cell: (cellProps) => {
          const { skus } = cellProps.original
          // 副产品没有计划生产数
          return (
            <CellFull
              list={skus}
              renderItem={(v) => (
                <div>
                  {v.plan_amount
                    ? `${toFixed(v.plan_amount || '0')}${v.unit_name}`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('已产出数(基本单位)'),
        accessor: 'pack_base_finish_amount',
        minWidth: 80,
        Cell: (cellProps) => {
          const { skus } = cellProps.original
          return (
            <CellFull
              list={skus}
              renderItem={(v) => (
                <div>
                  {v.pack_base_finish_amount
                    ? `${toFixed(v.pack_base_finish_amount || '0')}${
                        v.pack_base_unit_name
                      }`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('已产出数(包装单位)'),
        accessor: 'pack_finish_amount',
        minWidth: 80,
        Cell: (cellProps) => {
          const { skus } = cellProps.original
          return (
            <CellFull
              list={skus}
              renderItem={(v) => (
                <div>
                  {v.pack_finish_amount
                    ? `${toFixed(v.pack_finish_amount || '0')}${
                        v.pack_unit_name
                      }`
                    : '-'}
                </div>
              )}
            />
          )
        },
      },
      {
        Header: t('产出数(基本单位)'),
        accessor: 'pack_base_output_amount',
        width: 120,
        Cell: (cellProps) => {
          return <CellAmount index={cellProps.index} isBaseUnit />
        },
      },
      {
        Header: t('产出数(包装单位)'),
        accessor: 'pack_output_amount',
        width: 120,
        Cell: (cellProps) => {
          return <CellAmount index={cellProps.index} isBaseUnit={false} />
        },
      },
      {
        Header: t('计划状态'),
        accessor: 'state',
        Cell: (cellProps) => {
          const { state } = cellProps.original
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
    const { outputTaskList } = store
    if (!outputTaskList.length) {
      Tip.danger(t('未下达计划不可产出'))
      return false
    }
    const noValidSkus = _.filter(outputTaskList, (t) => {
      const pack_base_output_amount: string =
        t.skus[0].pack_base_output_amount || ''
      const pack_output_amount: string = t.skus[0].pack_output_amount || ''
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

  const handleOK = () => {
    if (handleCheck()) {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(false, true)
    }
  }

  const handleFinish = () => {
    if (handleCheck()) {
      RightSideModal.hide()
      store.batchUpdateTaskOutput(true, true)
    }
  }

  const handleChange = (checked: boolean) => {
    // 更新数据
    store.updateOutputTask(checked)
  }

  return (
    <div className='gm-padding-10'>
      <Header onChange={handleChange} />
      <Table tiled border data={outputTaskList.slice()} columns={columns} />
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
          disabled={outputTaskList.length === 0}
        >
          {t('确定并标记完工')}
        </Button>
      </Flex>
    </div>
  )
})

export default BatchOutput
