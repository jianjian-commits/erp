import React from 'react'
import { t } from 'gm-i18n'
import { BoxTable, Button, Price, BoxTableProps } from '@gm-pc/react'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import moment from 'moment'
import { gmHistory as history } from '@gm-common/router'
import store from '../store'
import {
  list_PurchaseSheet_Source,
  map_PurchaseSheet_Status,
} from 'gm_api/src/purchase'
import Operation from './operation'
import type { PurchaseSheet } from '../../../../interface'
import { toFixed } from '@/common/util'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { App_Type } from 'gm_api/src/common'
import { Popover } from 'antd'

const source_Map = {
  1: '采购小程序',
  2: '采购计划',
}
/**
 * @description 采购单据列表
 */
const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { list } = store

  const sourceAccessor = (d: PurchaseSheet) => {
    if (!d.app_type || !d.source) return '-'

    /** 根据后端要求: “
        如果app_type 为1或0、source 为1就是手工新建
        app_type为7 source为1就是采购小程序
        source 为2采购计划
        搜索相反 ”
    * **/
    if (d.app_type === App_Type.TYPE_PURCHASE) return source_Map[d.source]

    if (
      [App_Type.TYPE_UNSPECIFIED, App_Type.TYPE_STATION].includes(d.app_type)
    ) {
      return (
        list_PurchaseSheet_Source.find((s) => s.value === d.source)?.text || '-'
      )
    }
    return '-'
  }

  return (
    <BoxTable
      pagination={pagination}
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_SHEET}
        >
          <Button
            type='primary'
            onClick={() => {
              history.push('/purchase/manage/bills/create')
            }}
          >
            {t('新建采购单据')}
          </Button>
        </PermissionJudge>
      }
    >
      <Table<PurchaseSheet>
        isDiy
        id='purchaseBills'
        data={list}
        keyField='purchase_sheet_id'
        fixedSelect
        columns={[
          {
            Header: t('建单日期'),
            id: 'create_time',
            minWidth: 100,
            accessor: (d) =>
              moment(new Date(+d.create_time!)).format('YYYY-MM-DD HH:mm'),
          },
          {
            Header: t('预计到货时间'),
            id: 'receive_time',
            minWidth: 120,
            accessor: (d) => (
              <>
                {Number(d.receive_time)
                  ? moment(new Date(+d.receive_time!)).format(
                      'YYYY-MM-DD HH:mm',
                    )
                  : '-'}
              </>
            ),
          },
          {
            Header: t('采购单据号'),
            id: 'serial_no',
            minWidth: 140,
            diyEnable: false,
            accessor: (d) => (
              <Link
                className='gm-text-primary'
                to={`/purchase/manage/bills/detail?id=${d.purchase_sheet_id}`}
                target='_blank'
              >
                {d.serial_no}
              </Link>
            ),
          },
          {
            Header: t('任务数'),
            id: 'purchase_sku_num',
            minWidth: 80,
            accessor: (d) =>
              // 后端要求有raw_details先用raw_details，否则用details
              d.raw_details?.details?.length
                ? d.raw_details.details.length
                : d.details.details?.length || 0,
          },
          {
            Header: t('采购金额'),
            minWidth: 100,
            id: 'amount',
            accessor: (d) => {
              return toFixed(+d.tax_amount! || 0, 2) + Price.getUnit()
            },
          },
          {
            Header: t('不含税金额'),
            minWidth: 100,
            id: 'tax_amount',
            hide: globalStore.isLite,
            accessor: (d) => {
              return toFixed(+d.amount! || 0, 2) + Price.getUnit()
            },
          },
          {
            Header: t('税额'),
            minWidth: 100,
            id: 'tax_money',
            hide: globalStore.isLite,
            accessor: (d) => {
              return (
                toFixed(+Math.abs(+d?.amount! - +d?.tax_amount!) || 0, 2) +
                Price.getUnit()
              )
            },
          },
          {
            Header: t('供应商'),
            minWidth: 120,
            id: 'supplier_id',
            accessor: (d) => d.supplier?.name || '-',
          },
          {
            Header: t('采购员'),
            id: 'purchaser_id',
            hide: globalStore.isLite,
            minWidth: 120,
            accessor: (d) => d.purchaser?.name || '-',
          },
          {
            Header: t('创建人'),
            id: 'creator_id',
            minWidth: 120,
            accessor: (d) => d.creator?.name || '-',
          },
          {
            Header: t('单据状态'),
            id: 'status',
            minWidth: 100,
            accessor: (d) => map_PurchaseSheet_Status[d.status] || '-',
          },
          {
            Header: t('单据来源'),
            id: 'source',
            minWidth: 100,
            hide: globalStore.isLite,
            accessor: sourceAccessor,
          },
          {
            Header: t('单据备注'),
            id: 'remark',
            diyEnable: false,
            minWidth: 100,
            Cell: (props) => {
              const { remark } = props.original
              return (
                <Popover
                  placement='bottom'
                  content={remark}
                  trigger='hover'
                  overlayStyle={{ width: '200px' }}
                >
                  <span className='b-span-overflow'>{remark || '-'}</span>
                </Popover>
              )
            },
          },
          {
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            Header: TableXUtil.OperationHeader,
            diyEnable: false,
            id: 'action',
            diyItemText: '操作',
            Cell: (props) => (
              <Operation
                index={props.index}
                deleteDisabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_PURCHASE_DELETE_PURCHASE_SHEET,
                  )
                }
              />
            ),
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
