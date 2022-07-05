// 关联商户使用的是request_details
import { toFixed } from '@/common/util'
import globalStore from '@/stores/global'
import { Flex } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { PurchaseTask_RequestSource } from 'gm_api/src/purchase'
import _ from 'lodash'
import React, { FC, useState } from 'react'
import { TableData } from '../interface'
import store, { Task } from '../store'
import MerchantSplitPurchaseTask from './merchant_split_purchase_task'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { ConsoleSqlOutlined } from '@ant-design/icons'

export interface MerchantsProps {
  task: Task
}
const Merchants: FC<MerchantsProps> = ({ task }) => {
  const [visible, setVisible] = useState(false)
  const [chooseSplitMerchants, setChooseSplitMerchants] = useState(
    {} as TableData,
  )
  const [index, setIndex] = useState(0)

  const {
    request_details,
    sku_id,
    sku_level_filed_id,
    purchase_time,
    purchaser_id,
    status,
    type,
    purchase_task_id,
  } = task
  const { skuSnaps, customers, rateMap } = store

  const list = _.map(request_details?.request_details, (rd) => {
    // 判断这个采购计划的来源是不是来自于订单的来源说明拥有关联商户
    if (rd?.request_source === PurchaseTask_RequestSource.ORDER) {
      const purchase_sku = skuSnaps[rd.product_sku_id!] || {}
      const sku = skuSnaps[sku_id] || {}
      const rate = rateMap[sku_id]
      const levelName =
        _.find(
          sku.sku_level?.sku_level!,
          (i) => i.level_id === sku_level_filed_id,
        )?.name || '-'
      return {
        sku: {
          ...sku,
          unit_name:
            globalStore.getUnitName(sku?.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              sku.units?.units,
              sku?.purchase_unit_id!,
            ) ||
            '-',
        },
        purchase_sku: {
          ...purchase_sku,
          unit_name:
            globalStore.getUnitName(purchase_sku.purchase_unit_id!) ||
            globalStore.getPurchaseUnitName(
              purchase_sku.units?.units,
              purchase_sku?.purchase_unit_id!,
            ) ||
            '-',
        },
        ...rd,
        purchase_time,
        purchaser_id,
        purchase_task_id,
        status,
        type,
        rate,
        levelName,
        sku_level_filed_id,
        customer_name: customers[rd?.customer_id!]?.name || '-',
      }
    }
  }).filter((_) => _) as TableData[]

  const handleSplit = (index: number) => {
    setChooseSplitMerchants(list[index])

    // task 是哪一个任务
    const findIndex = _.findIndex(
      task.request_details.request_details,
      (i) => i.request_sheet_serial_no === list[index].request_sheet_serial_no,
    )
    /** @ description 后台需要我的request_details 的index */
    setIndex(findIndex)
    setVisible(true)
  }
  return (
    <>
      <Flex flex column className='gm-padding-20'>
        <Table<TableData>
          style={{ width: '100%' }}
          data={list}
          columns={[
            {
              Header: t('客户名'),
              accessor: 'customer_name',
              minWidth: 120,
            },
            {
              Header: t('订单号'),
              minWidth: 120,
              accessor: 'request_sheet_serial_no',
              Cell: (cellProps) =>
                cellProps.original.request_sheet_serial_no! || '-',
            },
            {
              Header: t('商品'),
              accessor: 'sheet_unit_id',
              minWidth: 100,
              Cell: (cellProps) => cellProps.original.sku?.name || '-',
            },
            {
              Header: t('采购单位'),
              accessor: 'unit_name',
              minWidth: 100,
              Cell: (cellProps) => cellProps.original.sku?.unit_name || '-',
            },
            {
              Header: t('商品等级'),
              accessor: 'levelName',
              minWidth: 100,
              Cell: (cellProps) => cellProps.original?.levelName! || '-',
            },
            {
              Header: t('需求数'),
              minWidth: 90,
              accessor: 'quantity',
              Cell: (cellProps) => {
                const {
                  rate,
                  sku: { unit_name },
                } = cellProps.original
                const unitValue = cellProps.original.val?.calculate!
                return (
                  <span>
                    {unitValue?.quantity
                      ? toFixed(Big(unitValue?.quantity).div(+rate || 1))
                      : '-'}
                    {unit_name}
                  </span>
                )
              },
            },
            { Header: t('商品备注'), minWidth: 90, accessor: 'remark' },
            // TODO: 后端没有解决 暂时屏蔽 后期要上
            // {
            //   Header: t('操作'),
            //   minWidth: 90,
            //   accessor: 'op',
            //   Cell: (cellProps) => (
            //     <PermissionJudge
            //       permission={
            //         Permission.PERMISSION_PURCHASE_SPLIT_CUSTOMER_DEMAND
            //       }
            //     >
            //       <a onClick={() => handleSplit(cellProps.index)}>
            //         {t('拆分')}
            //       </a>
            //     </PermissionJudge>
            //   ),
            // },
          ]}
        />
      </Flex>
      {visible && (
        <MerchantSplitPurchaseTask
          index={index}
          chooseSplitMerchants={chooseSplitMerchants}
          visible={visible}
          handleCancel={() => {
            setVisible(false)
          }}
        />
      )}
    </>
  )
}

export default Merchants
