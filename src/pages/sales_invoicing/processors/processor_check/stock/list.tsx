import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableProps, Button, Modal } from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { formatDay, formatSecond } from '@/pages/sales_invoicing/util'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import BatchCheck from '../../components/batch_check'
import store from '../store'
import { toFixed, toFixedByType } from '@/common/util'
import globalStore from '@/stores/global'
import Big from 'big.js'

const { OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  useEffect(() => {
    store.fetchStockList()
    return store.init()
  })

  const handleBatchCheck = () => {
    Modal.render({
      children: <BatchCheck onHide={Modal.hide} />,
      title: t('批量盘点'),
      onHide: Modal.hide,
    })
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_INVENTORY_SHEET}
    >
      <Button
        type='primary'
        className='gm-margin-left-10'
        onClick={handleBatchCheck}
      >
        {t('批量盘点')}
      </Button>
    </PermissionJudge>
  )
})

const List = observer(
  (
    props: { onFetchList: () => any; loading: boolean } & Pick<
      BoxTableProps,
      'pagination'
    >,
  ) => {
    const { processor } = store
    const columns: Column[] = [
      {
        Header: t('录入时间'),
        accessor: 'create_time',
        diyEnable: true,
        diyItemText: t('录入时间'),
        Cell: (cellProps) => {
          const { create_time } = cellProps.original
          return formatSecond(create_time)
        },
      },
      {
        Header: t('盘点日期'),
        accessor: 'check_time',
        diyEnable: true,
        diyItemText: t('盘点日期'),
        Cell: (cellProps) => {
          const { check_time } = cellProps.original
          return formatDay(check_time)
        },
      },
      {
        Header: t('车间信息'),
        accessor: 'processorDetail_name',
        diyEnable: true,
        diyItemText: t('车间信息'),
        Cell: (cellProps) => {
          const { processor_id } = cellProps.original
          const processorDetail = _.filter(processor, (item) => {
            return item?.processor_id === processor_id
          })
          return processorDetail[0]?.name || '-'
        },
      },
      {
        Header: t('商品编号'),
        accessor: 'customize_code',
        diyEnable: true,
        diyItemText: t('商品编号'),
        Cell: (cellProps) => {
          const { customize_code } = cellProps.original
          return customize_code || '-'
        },
      },
      {
        Header: t('商品名称'),
        accessor: 'sku_name',
        diyEnable: true,
        diyItemText: t('商品名称'),
        Cell: (cellProps) => {
          const { sku_name } = cellProps.original
          return sku_name || '-'
        },
      },
      {
        Header: t('基本单位'),
        accessor: 'base_unit_name',
        diyEnable: true,
        diyItemText: t('基本单位'),
        Cell: (cellProps) => {
          const { base_unit_name } = cellProps.original
          return base_unit_name || '-'
        },
      },
      {
        Header: t('盘点数量'),
        accessor: 'quantity',
        diyEnable: true,
        diyItemText: t('盘点数量'),
        Cell: (cellProps) => {
          const { quantity, base_unit_name } = cellProps.original
          return toFixed(Big(Number(quantity))) + base_unit_name || '-'
        },
      },
      {
        Header: t('不含税单价'),
        accessor: 'base_unit_price',
        diyEnable: true,
        diyItemText: t('不含税单价'),
        Cell: (cellProps) => {
          const { price, base_unit_name } = cellProps.original
          return price + '元' + '/' + base_unit_name || '-'
        },
      },
      {
        Header: t('不含税金额'),
        accessor: 'amount',
        diyEnable: true,
        diyItemText: t('不含税金额'),
        Cell: (cellProps) => {
          const { amount } = cellProps.original
          return toFixedByType(amount, 'dpInventoryAmount') + '元' || '-'
        },
      },
      {
        Header: t('操作'),
        id: 'op',
        diyItemText: t('操作'),
        Cell: (cellProps) => {
          return (
            <OperationCell>
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_SALE_OUT_SHEET,
                  )
                }
                title={t('确认删除')}
                onClick={() => {
                  store.deleteReceipt(cellProps.index).then(() => {
                    props.onFetchList()
                    return null
                  })
                }}
              >
                {t('确认删除该单据？')}
              </OperationDelete>
            </OperationCell>
          )
        },
      },
    ]
    const { list } = store

    return (
      <>
        <BoxTable pagination={props.pagination} action={<ListRight />}>
          <Table
            isDiy
            id='processor_check_id'
            data={list.slice()}
            columns={columns}
            keyField='processor_check_id'
          />
        </BoxTable>
      </>
    )
  },
)

export default List
