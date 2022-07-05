import React from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import {
  UnitValueExpand,
  CustomerTurnoverStock,
} from '@/pages/sales_invoicing/interface'
import { toFixedByType, toFixedSalesInvoicing } from '@/common/util'
import SvgPickReturn from '@/svg/picking_return.svg'
import { Modal, Price } from '@gm-pc/react'
import TurnModal from '../../components/turnModal'
import store from '../stores/all_customer_store'
import return_store from '../../loan_and_return_log/stores/return_store'

const { OperationDetail, OperationCell, OperationIcon } = TableXUtil

const sumResult = (
  stocks: CustomerTurnoverStock[],
  parm: keyof UnitValueExpand,
) => {
  return toFixedSalesInvoicing(
    _.reduce(stocks, (result, { base_unit }) => result + +base_unit![parm]!, 0),
  )
}

const List = observer(() => {
  const { list } = store
  const columnCustomerDetail: Column[] = [
    {
      Header: t('客户编码'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { customer_info } = cellProps.original
        return customer_info?.customized_code || ''
      },
    },
    {
      Header: t('客户名称'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { customer_info } = cellProps.original
        return customer_info?.name || ''
      },
    },
    {
      Header: t('未归还数'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { stocks } = cellProps.original
        return sumResult(stocks, 'quantity')
      },
    },
    {
      Header: t('未归还货值'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const { stocks } = cellProps.original
        return (
          toFixedByType(
            +sumResult(stocks, 'total_price'),
            'dpInventoryAmount',
          ) + Price.getUnit()
        )
      },
    },
  ]

  const columnSkuDetail: Column[] = [
    {
      Header: t('周转物名称'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          skuInfo: { sku },
        } = cellProps.original
        return sku?.name || ''
      },
    },
    {
      Header: t('未归还数'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          base_unit_name,
          base_unit: { quantity },
        } = cellProps.original
        return toFixedSalesInvoicing(quantity) + base_unit_name
      },
    },
    {
      Header: t('未归还货值'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          base_unit: { total_price },
        } = cellProps.original
        return toFixedByType(total_price, 'dpInventoryAmount') + Price.getUnit()
      },
    },
    {
      Header: t('操作'),
      diyGroupName: t('基础字段'),
      Cell: (cellProps) => {
        const {
          sku_id,
          customer_id,
          customer_info: { warehouse_id },
        } = cellProps.original

        return (
          <OperationCell>
            <OperationIcon
              tip={t('周转物归还')}
              onClick={() => {
                store.changeSheet(cellProps.original)
                Modal.render({
                  title: t('周转物归还'),
                  size: 'md',
                  children: (
                    <TurnModal
                      sheetInfo={return_store.sheetInfo}
                      createSheetInfo={return_store.createSheetInfo}
                      createSheet={return_store.createSheet}
                      doRequest={return_store.doRequest}
                      clearSheet={return_store.clearSheet}
                      type='log_return'
                    />
                  ),
                  onHide: () => {
                    Modal.hide()
                    return_store.clearSheet()
                  },
                })
              }}
            >
              <SvgPickReturn />
            </OperationIcon>
            <OperationDetail
              href={`#/sales_invoicing/turnover/customer_loan_log/customer_log?customer_id=${customer_id}&sku_id=${sku_id}&warehouse_id=${warehouse_id}`}
            />
          </OperationCell>
        )
      },
    },
  ]
  return (
    <Table
      isExpand
      data={list.slice()}
      columns={columnCustomerDetail}
      SubComponent={({ original }) => (
        <Table isSub data={original.stocks} columns={columnSkuDetail} />
      )}
    />
  )
})

export default List
