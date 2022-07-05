import React, { FC, useMemo } from 'react'
import { TableXUtil, BatchActionDefault, Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import { observer } from 'mobx-react'
import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import {
  RECEIPT_STATUS,
  STOCK_IN_RECEIPT_STATUS_NAME,
  STOCK_IN_RECEIPT_TABS,
} from '../../../enum'
import {
  BoxTableInfo,
  BoxTable,
  Button,
  Price,
  RightSideModal,
  BoxTableProps,
} from '@gm-pc/react'
import { history } from '@/common/service'
import TableTotalText from '@/common/components/table_total_text'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import { canDeleteReceipt } from '@/pages/sales_invoicing/util'
import {
  getFormatTimeForTable,
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/produce/produce_stock_in/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_PRODUCT_IN}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建生产入库')}
      </Button>
    </PermissionJudge>
  )
})

const ListTable = observer((props: ListProps) => {
  const { list, paging, groupUsers } = store

  const _columns: Column[] = useMemo(() => {
    return [
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        minWidth: 100,
        Cell: (cellProps) => {
          const { create_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD', create_time)
        },
      },
      {
        Header: t('入库时间'),
        accessor: 'submit_time',
        minWidth: 100,
        Cell: (cellProps) => {
          const { submit_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time)
        },
      },
      {
        Header: t('仓库'),
        accessor: 'warehouse_name',
        minWidth: 110,
        Cell: (cellProps: any) => {
          const { warehouse_name } = cellProps.original
          return getUnNillText(warehouse_name)
        },
      },
      {
        Header: t('生产入库单号'),
        accessor: 'stock_sheet_id',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            stock_sheet_id,
            stock_sheet_serial_no,
            sheet_status,
            status,
          } = cellProps.original
          return (
            <StockSheetLink
              url='/sales_invoicing/produce/produce_stock_in'
              sheetStatus={sheet_status}
              showText={stock_sheet_serial_no}
              stockSheetId={stock_sheet_id}
              status={status!}
            />
          )
        },
      },
      {
        Header: t('单据金额'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: ({ original: { total_price } }) => {
          return isValid(total_price)
            ? toFixedByType(total_price, 'dpInventoryAmount') + Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('单据状态'),
        accessor: 'sheet_status',
        minWidth: 100,
        Cell: (cellProps) => {
          return STOCK_IN_RECEIPT_STATUS_NAME[cellProps.original.sheet_status]
        },
      },
      {
        Header: t('单据备注'),
        accessor: 'remark',
        minWidth: 100,
        Cell: ({ original: { remark } }) => {
          return isValid(remark) ? remark : '-'
        },
      },
      {
        Header: t('建单人'),
        accessor: 'creator_id',
        minWidth: 100,
        Cell: (cellProps) => {
          const { creator_id } = cellProps.original
          return groupUsers![creator_id]?.name ?? ''
        },
      },
      {
        Header: OperationHeader,
        accessor: 'operate',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        diyItemText: t('操作'),
        Cell: (cellProps) => {
          return (
            <OperationCell>
              {canDeleteReceipt(cellProps.original.sheet_status) && (
                <OperationDelete
                  disabled={
                    !globalStore.hasPermission(
                      Permission.PERMISSION_INVENTORY_DELETE_PRODUCT_IN,
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
              )}
            </OperationCell>
          )
        },
      },
    ]
  }, [groupUsers])

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
      type: PrintingTemplate_Type.TYPE_IN_STOCK,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='purchase_stock_in_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/stock_in_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
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

  return (
    <BoxTable
      pagination={props.pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: props.pagination?.paging?.count,
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
        id='produce_stock_in_list'
        keyField='stock_sheet_id'
        fixedSelect
        loading={props.loading}
        columns={_columns}
        data={list.slice()}
        batchActions={[
          {
            children: <BatchActionDefault>{t('批量打印')}</BatchActionDefault>,
            onAction: handlePopupPrintModal,
          },
          {
            children: <BatchActionDefault>{t('批量提交')}</BatchActionDefault>,
            onAction: handleBatchSubmit,
          },
          {
            children: (
              <BatchActionDefault>{t('批量审核通过')}</BatchActionDefault>
            ),
            onAction: handleBatchApproval,
          },
        ]}
      />
    </BoxTable>
  )
})

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}
const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList, loading, pagination } = props

  const handleChange = (type: ReceiptStatusAllKey) => {
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    store.changeActiveType(type)
    onFetchList()
  }

  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      tabComponent={
        <ListTable
          onFetchList={onFetchList}
          loading={loading}
          pagination={pagination}
        />
      }
      tabData={STOCK_IN_RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
