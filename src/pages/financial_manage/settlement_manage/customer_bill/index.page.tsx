import React, { useEffect, useMemo } from 'react'
import { TableList } from '@gm-pc/business'
import type { Column } from '@gm-pc/table-x/src/table/types'
import { t } from 'gm-i18n'
import { Price } from '@gm-pc/react'
import HeaderTip from '@/common/components/header_tip'
import { Link } from 'react-router-dom'
import { Bill } from './interface'
import FilterBar from './filter'
import store from './store'
import { observer } from 'mobx-react'

const CustomerBill: React.VFC = observer(() => {
  const columns = useMemo<Column<Bill>[]>(() => {
    return [
      {
        Header: t('客户编码'),
        id: 'customerCode',
        accessor: 'customerCode',
      },
      {
        Header: t('客户名称'),
        id: 'customerName',
        accessor: 'customerName',
      },
      {
        Header: `${t('应付金额')}（${Price.getUnit()}）`,
        diyItemText: t('应付金额'),
        show: false,
        id: 'amountPayable',
        accessor: 'amountPayable',
      },
      {
        Header: `${t('已付金额')}（${Price.getUnit()}）`,
        diyItemText: t('已付金额'),
        show: false,
        id: 'amountPaid',
        accessor: 'amountPaid',
      },
      {
        Header: (
          <HeaderTip
            header={`${t('未付金额')}（${Price.getUnit()}）`}
            tip={t('仅为销售订单的未付金额，不包含售后金额')}
          />
        ),
        diyItemText: t('未付金额'),
        id: 'outstandingAmount',
        accessor: 'outstandingAmount',
      },
      {
        Header: `${t('售后金额')}（${Price.getUnit()}）`,
        diyItemText: t('售后金额'),
        id: 'amountAfterSale',
        accessor: 'amountAfterSale',
      },
      {
        Header: (
          <HeaderTip
            header={`${t('待结金额')}（${Price.getUnit()}）`}
            tip={t('待结算金额 = 订单未付金额 - 订单售后金额')}
          />
        ),
        diyItemText: t('待结金额'),
        id: 'amountToBeSettled',
        accessor: 'amountToBeSettled',
      },
      {
        Header: t('操作'),
        id: 'action',
        width: 200,
        Cell(row) {
          const { customerId } = row.original
          return (
            <Link
              rel='noopener noreferrer'
              target='_blank'
              to={{
                pathname:
                  '/financial_manage/settlement_manage/customer_bill/detail',
                search: `?customerId=${customerId}&${store.filterTimeParams}`,
              }}
            >
              {t('查看')}
            </Link>
          )
        },
      },
    ]
  }, [])

  useEffect(() => store.clear, [])

  return (
    <>
      <FilterBar
        defaultValue={store.filterParams}
        onSubmit={store.setFilterParams}
      />
      <TableList<Bill>
        id='financial_customer_bill_list'
        isDiy
        isUpdateEffect={false}
        headerProps={{ className: 'tw-hidden' }}
        keyField='customerId'
        filter={store.filterParams}
        data={store.list}
        columns={columns}
        service={store.getList}
        paginationOptions={{
          paginationKey: 'financial_customer_bill_list_pagination',
          defaultPaging: { need_count: true },
        }}
      />
    </>
  )
})

CustomerBill.displayName = 'CustomerBill'

export default CustomerBill
