import React, { FC, useMemo } from 'react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableInfo, Price, Tip, Tooltip } from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import moment from 'moment'
import { OperationHeader } from '@gm-pc/table-x/src/components'
import TableTotalText from '@/common/components/table_total_text'
import SVGPrint from '@/svg/print.svg'
import ListStatusTabs from './list_status_tabs'
import { SettleSheet_SheetStatus } from 'gm_api/src/finance'
import store from '../store'
import { ListOptions, SettlementStatusKey } from '../interface'
import {
  SETTLE_SHEET_STATUS,
  SETTLEMENT_STATUS,
  SETTLEMENT_TABS,
  COMPANY_TYPE,
} from '../enum'
import { CreditTypeMap } from '../../../enum'
import SVGDownload from '@/svg/download.svg'
import globalStore from '@/stores/global'

const { OperationCell } = TableXUtil

const ListTable: FC = observer(() => {
  const { list, paging, activeType } = store

  const handlePrint = (settle_sheet_id: string) => {
    const URL = `#/financial_manage/merchant_settlement/merchant_settlement/print`
    window.open(`${URL}?settle_sheet_id=${settle_sheet_id}`)
  }

  const handleExport = (settle_sheet_id: string) => {
    store.exportList(settle_sheet_id)
  }

  // 操作列
  const operateArray = [
    {
      tip: t('打印'),
      onClick: (settle_sheet_id: string) => handlePrint(settle_sheet_id),
      Icon: <SVGPrint />,
    },
    {
      tip: t('导出'),
      onClick: (settle_sheet_id: string) => handleExport(settle_sheet_id),
      Icon: <SVGDownload />,
    },
  ]

  const _columns: Column<ListOptions>[] = useMemo(() => {
    return [
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        minWidth: 100,
        fixed: 'left',
        Cell: (cellProps) =>
          moment(new Date(+cellProps?.original?.create_time!)).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
      },
      {
        Header: t('对账单号'),
        accessor: 'settle_sheet_serial_no',
        minWidth: 100,
        fixed: 'left',
        Cell: (cellProps) => {
          const {
            original: { settle_sheet_serial_no, settle_sheet_id },
          } = cellProps
          return (
            <a
              href={`#/financial_manage/merchant_settlement/merchant_settlement/detail?serial_no=${settle_sheet_id}`}
              className='gm-text-primary gm-cursor'
              rel='noopener noreferrer'
              // target='_blank'
              style={{ textDecoration: 'underline' }}
            >
              {settle_sheet_serial_no}
            </a>
          )
        },
      },
      {
        Header: t('公司名称'),
        accessor: 'company',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { company },
          } = cellProps
          return <span>{company || '-'}</span>
        },
      },
      {
        Header: t('公司类型'),
        accessor: 'company_type',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { company_type },
          } = cellProps
          return <span>{COMPANY_TYPE[company_type!] || '-'}</span>
        },
      },
      {
        Header: t('结款周期'),
        accessor: 'credit_type',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { credit_type },
          } = cellProps
          return <span>{CreditTypeMap[credit_type!] || '-'}</span>
        },
      },
      {
        Header: t('状态'),
        accessor: 'sheet_status',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { sheet_status },
          } = cellProps
          return <span>{SETTLE_SHEET_STATUS[sheet_status!] || '-'}</span>
        },
      },
      {
        Header: t('已结款金额'),
        accessor: 'actual_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          const { actual_amount } = cellProps.original
          return (
            Big(Number(actual_amount!) || 0).toFixed(2) + Price.getUnit() || '-'
          )
        },
      },
      {
        Header: t('待结款金额'),
        accessor: 'need_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          const { need_amount } = cellProps.original
          return (
            Big(Number(need_amount!) || 0).toFixed(2) + Price.getUnit() || '-'
          )
        },
      },
      {
        Header: t('应收金额'),
        accessor: 'should_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          const { should_amount } = cellProps.original
          return Big(should_amount || 0).toFixed(2) + Price.getUnit() || '-'
        },
      },
      {
        Header: t('不含税金额'),
        accessor: 'no_tax_total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          const { no_tax_total_price } = cellProps.original
          return (
            Big(no_tax_total_price || 0).toFixed(2) + Price.getUnit() || '-'
          )
        },
      },
      {
        Header: t('税额'),
        accessor: 'tax_price',
        minWidth: 100,
        Cell: (cellProps) => {
          const { tax_price } = cellProps.original
          return Big(tax_price || 0).toFixed(2) + Price.getUnit() || '-'
        },
      },
      {
        Header: OperationHeader,
        accessor: 'operate',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        diyItemText: t('操作'),
        Cell: (cellProps) => {
          const { settle_sheet_id } = cellProps.original

          return (
            <OperationCell>
              {operateArray.map((item, index) => {
                const { tip, onClick, Icon } = item

                return (
                  <Tooltip key={tip} popup={tip} top>
                    <span
                      className={`gm-cursor gm-text-16 gm-text-hover-primary 
                      ${index > 0 ? 'gm-margin-left-5' : ''}`}
                      onClick={() => onClick(settle_sheet_id)}
                      key={tip}
                    >
                      {Icon}
                    </span>
                  </Tooltip>
                )
              })}
            </OperationCell>
          )
        },
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBatchSubmit = (selected: string[], isSelectedAll: boolean) => {
    const selectedData = _.filter(store.list, (item) =>
      selected.includes(item.settle_sheet_id),
    )

    const noPassList = [
      SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
      SettleSheet_SheetStatus.SHEET_STATUS_PART_PAID,
      SettleSheet_SheetStatus.SHEET_STATUS_PAID,
      SettleSheet_SheetStatus.SHEET_STATUS_DELETED,
    ]
    const isNoPass = _.some(
      selectedData,
      (item) => noPassList.indexOf(item.sheet_status!) !== -1,
    )

    if (isNoPass) {
      Tip.danger(t('只有待提交或审核不通过的对账单才能提交'))
    } else {
      store.batchSubmit(selected, isSelectedAll).then(() => {
        globalStore.showTaskPanel('1')
        store.doRequest()
        return null
      })
      store.doRequest()
    }
  }

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('对账单总数'),
                content: paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table
        isBatchSelect
        id='supplier_settlement_id'
        keyField='settle_sheet_id'
        fixedSelect
        columns={_columns}
        data={list}
        batchActions={
          ['FAILED_TO_PASS', 'ALL', 'TO_BE_SUBMITTED'].indexOf(activeType) !==
          -1
            ? [
                {
                  children: t('批量提交'),
                  onAction: handleBatchSubmit,
                },
              ]
            : []
        }
      />
    </BoxTable>
  )
})

interface ListProps {
  onFetchList: () => any
}

const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList } = props
  const handleChange = (type: SettlementStatusKey) => {
    store.updateFilter('status', SETTLEMENT_STATUS[type])
    store.changeActiveType(type)
    onFetchList()
  }
  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      TabComponent={ListTable}
      tabData={SETTLEMENT_TABS}
    />
  )
})

export default List
