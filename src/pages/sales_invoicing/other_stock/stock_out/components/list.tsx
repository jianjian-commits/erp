import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BatchActionDefault,
  TableXUtil,
  Column,
  TableProps,
  Table,
} from '@gm-pc/table-x'
import {
  BoxTableInfo,
  BoxTable,
  Button,
  Price,
  RightSideModal,
  BoxTableProps,
} from '@gm-pc/react'
import {
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'

import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import {
  STOCK_OUT_RECEIPT_TABS,
  RECEIPT_STATUS,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import ListStatusTabs from '@/pages/sales_invoicing/components/list_status_tabs'
import { formatSecond, canDeleteReceipt } from '@/pages/sales_invoicing//util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import store from '../stores/store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import { PrintModal } from '@/pages/sales_invoicing/components'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'

interface InComing extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => {}
  loading: boolean
}

const { OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/other_stock/stock_out/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_OTHER_OUT}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建其他出库')}
      </Button>
    </PermissionJudge>
  )
})

const TabList: FC<InComing> = observer((props) => {
  const { paging, groupUsers } = store
  const { onFetchList, loading, pagination } = props
  const columns: Column[] = [
    {
      Header: t('建单时间'),
      accessor: 'create_time',
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return formatSecond(create_time)
      },
    },
    {
      Header: t('出库时间'),
      accessor: 'submit_time',
      Cell: (cellProps) => {
        const { submit_time } = cellProps.original
        return Number(submit_time) ? formatSecond(submit_time) : '-'
      },
    },
    // TODO：4.7-9 其他出库 列表
    {
      Header: t('仓库'),
      accessor: 'warehouse_name',
      Cell: (cellProps: any) => {
        const { warehouse_name } = cellProps.row.original
        return getUnNillText(warehouse_name)
      },
    },
    {
      Header: t('其他出库单号'),
      accessor: 'stock_sheet_id',
      Cell: (cellProps) => {
        const { stock_sheet_id, stock_sheet_serial_no, sheet_status } =
          cellProps.original
        return (
          <StockSheetLink
            url='/sales_invoicing/other_stock/stock_out'
            sheetStatus={sheet_status}
            showText={stock_sheet_serial_no}
            stockSheetId={stock_sheet_id}
          />
        )
      },
    },
    {
      Header: t('单据金额'),
      accessor: 'total_price',
      Cell: ({ original: { total_price } }) => {
        return isValid(total_price)
          ? toFixedByType(total_price, 'dpInventoryAmount') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('单据状态'),
      accessor: t('sheet_status'),
      Cell: (cellProps) => {
        const { sheet_status } = cellProps.original
        return STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status]
      },
    },
    {
      Header: t('单据备注'),
      accessor: 'remark',
      Cell: ({ original: { remark } }) => {
        return isValid(remark) ? remark : '-'
      },
    },
    {
      Header: t('建单人'),
      accessor: 'creator_id',
      Cell: (cellProps) => {
        const { creator_id } = cellProps.original
        return groupUsers![creator_id]?.name ?? ''
      },
    },
    {
      Header: t('操作'),
      accessor: '',
      Cell: (cellProps) => {
        return (
          <OperationCell>
            {canDeleteReceipt(cellProps.original.sheet_status) ? (
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_OTHER_OUT,
                  )
                }
                title={t('确认删除')}
                onClick={() => {
                  store.deleteReceipt(cellProps.index).then(() => {
                    onFetchList()
                    return null
                  })
                }}
              >
                {t('确认删除该单据？')}
              </OperationDelete>
            ) : (
              '-'
            )}
          </OperationCell>
        )
      },
    },
  ]

  const handlePopupPrintModal = (
    selected: string[],
    isSelectedAll: boolean,
  ) => {
    const req = isSelectedAll
      ? store.getSearchData()
      : {
          sheet_ids: selected,
          stock_sheet_type: store.filter.stock_sheet_type,
        }
    return ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_OUT_STOCK,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='other_stock_out_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/stock_out_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
              )
              RightSideModal.hide()
            }}
            templates={json.response.printing_templates}
          />
        ),
      })
      return json
    })
  }

  const handleBatchSubmit = (selected: string[], isSelectedAll: boolean) => {
    store.batchUpdateReceipt(selected, isSelectedAll, 'submitted').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const handleBatchApproval = (selected: string[], isSelectedAll: boolean) => {
    store.batchUpdateReceipt(selected, isSelectedAll, 'approved').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const handleCheckStock = (
    selected: string[],
    isSelectedAll: boolean,
    onEnsure: (selected: string[], isSelectedAll: boolean) => any,
  ) => {
    onEnsure(selected, isSelectedAll)
  }

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: pagination?.paging?.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        isBatchSelect
        isDiy
        data={store.list.slice()}
        columns={columns}
        keyField='stock_sheet_id'
        loading={loading}
        batchActions={
          [
            globalStore.hasPermission(
              Permission.PERMISSION_INVENTORY_PRINT_OTHER_OUT,
            ) && {
              children: (
                <BatchActionDefault>{t('批量打印')}</BatchActionDefault>
              ),
              onAction: handlePopupPrintModal,
            },
            globalStore.hasPermission(
              Permission.PERMISSION_INVENTORY_SUBMIT_MATERIAL_OUT,
            ) && {
              children: (
                <BatchActionDefault>{t('批量提交')}</BatchActionDefault>
              ),
              onAction: (selected: any[], isSelectedAll: boolean) =>
                handleCheckStock(selected, isSelectedAll, handleBatchSubmit),
            },
            globalStore.hasPermission(
              Permission.PERMISSION_INVENTORY_APPROVE_MATERIAL_OUT,
            ) && {
              children: (
                <BatchActionDefault>{t('批量审核通过')}</BatchActionDefault>
              ),
              onAction: (selected: any[], isSelectedAll: boolean) =>
                handleCheckStock(selected, isSelectedAll, handleBatchApproval),
            },
          ].filter(Boolean) as TableProps['batchActions']
        }
      />
    </BoxTable>
  )
})

const List: FC<InComing> = observer((props) => {
  const { onFetchList, loading, pagination } = props
  const activeChange = (type: ReceiptStatusAllKey) => {
    store.changeTab(type)
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    onFetchList()
  }

  return (
    <ListStatusTabs
      tabComponent={
        <TabList
          onFetchList={onFetchList}
          loading={loading}
          pagination={pagination}
        />
      }
      active='all'
      onChange={activeChange}
      tabData={STOCK_OUT_RECEIPT_TABS}
    />
  )
})

export default List
