import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { TableXUtil, BatchActionDefault, Table, Column } from '@gm-pc/table-x'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  RightSideModal,
  BoxTableProps,
} from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'

import { formatSecond, canDeleteReceipt } from '@/pages/sales_invoicing/util'
import {
  TRANSFER_TABS,
  RECEIPT_STATUS,
  STOCK_TRANSFER_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import store from '../stores/store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import _ from 'lodash'
import { BatchActionBarItem } from '@gm-pc/table-x/src/components'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { openNewTab } from '@/common/util'

interface InComing extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => {}
}

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push(`/sales_invoicing/inventory_check/transfer/create`)
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_INVENTORY_SHEET}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建移库单')}
      </Button>
    </PermissionJudge>
  )
})

const TabList: FC<InComing> = observer((props) => {
  const { paging, groupUsers } = store
  const { onFetchList, pagination } = props

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
      Header: t('移库时间'),
      accessor: 'update_time',
      Cell: (cellProps) => {
        const { update_time } = cellProps.original
        return formatSecond(update_time)
      },
    },
    {
      Header: t('移库单号'),
      accessor: 'stock_sheet_id',
      Cell: (cellProps) => {
        const { stock_sheet_id, stock_sheet_serial_no, sheet_status } =
          cellProps.original
        return (
          <StockSheetLink
            url='/sales_invoicing/inventory_check/transfer'
            sheetStatus={sheet_status}
            showText={stock_sheet_serial_no}
            stockSheetId={stock_sheet_id}
          />
        )
      },
    },
    {
      Header: t('单据状态'),
      accessor: 'sheet_status',
      Cell: (cellProps) => {
        const { sheet_status } = cellProps.original
        return STOCK_TRANSFER_RECEIPT_STATUS_NAME[sheet_status]
      },
    },
    {
      Header: t('单据备注'),
      accessor: 'remark',
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
      Header: OperationHeader,
      accessor: 'operate',
      diyItemText: t('操作'),
      Cell: (cellProps) => {
        return (
          <OperationCell>
            {canDeleteReceipt(cellProps.original.sheet_status) ? (
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_INVENTORY_SHEET,
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
      type: PrintingTemplate_Type.TYPE_TRANSFER,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='purchase_cannibalize_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/cannibalize_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
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
        id='purchase_stock_in_list'
        keyField='stock_sheet_id'
        data={store.list.slice()}
        columns={columns}
        fixedSelect
        batchActions={_.filter(
          [
            globalStore.hasPermission(
              Permission.PERMISSION_INVENTORY_PRINT_INVENTORY_SHEET,
            ) && {
              children: (
                <BatchActionDefault>{t('批量打印')}</BatchActionDefault>
              ),
              onAction: handlePopupPrintModal,
            },
          ] as BatchActionBarItem[],
          Boolean,
        )}
      />
    </BoxTable>
  )
})

const List: FC<InComing> = observer((props) => {
  const { onFetchList, pagination } = props
  const activeChange = (type: ReceiptStatusAllKey) => {
    store.changeTab(type)
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    onFetchList()
  }

  return (
    <ListStatusTabs
      tabComponent={
        <TabList onFetchList={onFetchList} pagination={pagination} />
      }
      active='all'
      onChange={activeChange}
      tabData={TRANSFER_TABS}
      omitTabs={['cancelApproval']}
    />
  )
})

export default List
