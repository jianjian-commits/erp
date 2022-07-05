import React from 'react'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo, Price } from '@gm-pc/react'
import { Table, BatchActionDefault, TableXUtil, Column } from '@gm-pc/table-x'
import Big from 'big.js'
import { observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import { toFixed } from '@/common/util'
import HeaderTip from '@/common/components/header_tip'
import store from '../store'
import type { ListOption } from '../store'

const List = () => {
  const { meals_settlement_list } = store
  const columns: Column<ListOption>[] = [
    {
      Header: t('学校编码'),
      accessor: 'customized_code',
      minWidth: 100,
    },
    {
      Header: t('学校名称'),
      accessor: 'name',
      minWidth: 100,
    },
    {
      Header: (
        <HeaderTip
          header={t('用餐人次')}
          tip={t('汇总展示当前筛选条件下的团餐订单总数')}
        />
      ),
      accessor: 'order_id_count',
      minWidth: 100,
    },
    {
      Header: t('销售额'),
      accessor: 'sale_price_sum',
      minWidth: 100,
      Cell: (cellProps) => {
        const { sale_price_sum } = cellProps.original
        return (
          toFixed(Big(Number(sale_price_sum) || 0)) + Price.getUnit() || '-'
        )
      },
    },
    {
      Header: t('联系人'),
      accessor: 'contact',
      minWidth: 100,
      Cell: (cellProps) => {
        const { settlement } = cellProps.original
        return (
          <div>
            {settlement?.china_vat_invoice?.financial_contact_name || '-'}
          </div>
        )
      },
    },
    {
      Header: t('联系人电话'),
      accessor: 'phone',
      minWidth: 100,
      Cell: (cellProps) => {
        const { settlement } = cellProps.original
        return (
          <div>
            {settlement?.china_vat_invoice?.financial_contact_phone || '-'}
          </div>
        )
      },
    },
  ]

  // 批量打印
  const handleBatchPrint = (selected: string[]) => {
    const { begin, end } = store.filter
    const URL = `#/financial_manage/meals_settlement/meals_settlement/print`
    window.open(
      `${URL}?query=${JSON.stringify({
        selected,
        begin_time: `${+begin}`,
        end_time: `${+end}`,
      })}`,
    )
  }

  return (
    <BoxTable
      info={
        store.selected!.length ? (
          <TableXUtil.BatchActionBar
            pure
            onClose={() => {
              store.reSetSelected()
            }}
            batchActions={[
              {
                children: (
                  <BatchActionDefault>{t('批量打印对账单')}</BatchActionDefault>
                ),
                onAction: () => {
                  handleBatchPrint(store.selected)
                },
              },
            ]}
            count={store.selected!.length}
            selected={store.selected}
          />
        ) : (
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('对账单总数'),
                  content: meals_settlement_list.length,
                },
              ]}
            />
          </BoxTableInfo>
        )
      }
    >
      <Table
        isIndex
        isSelect
        id='meal_times_list'
        keyField='customer_id_l1'
        data={meals_settlement_list.slice()}
        columns={columns}
        selected={store.selected}
        onSelect={(selected: string[]) => {
          store.setSelected(selected)
        }}
      />
    </BoxTable>
  )
}

export default observer(List)
