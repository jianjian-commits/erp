import React, { FC, useMemo } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Button,
  Price,
  RightSideModal,
} from '@gm-pc/react'
import { BatchActionDefault, Table, TableXUtil, Column } from '@gm-pc/table-x'

import { Permission } from 'gm_api/src/enterprise'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'

import PermissionJudge from '@/common/components/permission_judge'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'
import {
  getFormatTimeForTable,
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'

import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import { canDeleteReceipt } from '@/pages/sales_invoicing/util'

import {
  RECEIPT_STATUS,
  STOCK_OUT_RECEIPT_STATUS_NAME,
  STOCK_OUT_RECEIPT_TABS,
} from '../../../enum'

import globalStore from '@/stores/global'
import { ListSotre } from '../stores/index'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/produce/picking_stock_out/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_MATERIAL_OUT}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建领料出库')}
      </Button>
    </PermissionJudge>
  )
})

const ListTable = observer((props: ListProps) => {
  const {
    filter,
    list,
    groupUsers,
    deleteReceipt,
    getSearchData,
    batchUpdateReceipt,
  } = ListSotre

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
        Header: t('仓库'),
        accessor: 'warehouse_name',
        minWidth: 110,
        Cell: (cellProps: any) => {
          const { warehouse_name } = cellProps.original
          return getUnNillText(warehouse_name)
        },
      },
      {
        Header: t('出库时间'),
        accessor: 'out_stock_time',
        minWidth: 100,
        Cell: (cellProps) => {
          const { out_stock_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD HH:mm', out_stock_time)
        },
      },
      {
        Header: t('领料出库单号'),
        accessor: ' material_out_stock_sheet_id',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            material_out_stock_sheet_id,
            material_out_stock_sheet_serial_no,
            sheet_status,
          } = cellProps.original
          return (
            <StockSheetLink
              url='/sales_invoicing/produce/picking_stock_out'
              sheetStatus={sheet_status}
              showText={material_out_stock_sheet_serial_no}
              stockSheetId={material_out_stock_sheet_id}
            />
          )
        },
      },
      {
        Header: t('领用部门'),
        accessor: ({ processor_name }) => processor_name || t('未指定'),
        minWidth: 100,
      },
      {
        Header: t('单据金额'),
        accessor: 'amount',
        minWidth: 100,
        Cell: ({ original: { amount } }) => {
          return isValid(amount)
            ? toFixedByType(amount, 'dpInventoryAmount') + Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('单据状态'),
        accessor: 'sheet_status',
        minWidth: 100,
        Cell: (cellProps) => {
          return STOCK_OUT_RECEIPT_STATUS_NAME[cellProps.original.sheet_status]
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
                      Permission.PERMISSION_INVENTORY_DELETE_MATERIAL_OUT,
                    )
                  }
                  title={t('确认删除')}
                  onClick={() => {
                    deleteReceipt(cellProps.index).then(() => {
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
  }, [deleteReceipt, groupUsers, props])

  const handlePopupPrintModal = (
    selected: string[],
    isSelectedAll: boolean,
  ) => {
    const req = isSelectedAll
      ? getSearchData()
      : {
          sheet_ids: selected,
          stock_sheet_type: filter.stock_sheet_type,
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
            name='produce_stock_out_print'
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

  const handleCheckStock = (
    selected: string[],
    isSelectedAll: boolean,
    onEnsure: (selected: string[], isSelectedAll: boolean) => any,
  ) => {
    onEnsure(selected, isSelectedAll)
  }

  const handleBatchSubmit = (selected: string[], isSelectedAll: boolean) => {
    batchUpdateReceipt(selected, isSelectedAll, 'submitted').then(() => {
      globalStore.showTaskPanel('1')
      return null
    })
  }

  const handleBatchApproval = (selected: string[], isSelectedAll: boolean) => {
    batchUpdateReceipt(selected, isSelectedAll, 'approved').then(() => {
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
        id='picking_stock_out_list'
        keyField='material_out_stock_sheet_id'
        fixedSelect
        loading={props.loading}
        columns={_columns}
        data={list.slice()}
        batchActions={_.without(
          [
            {
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
          ],
          false,
        )}
      />
    </BoxTable>
  )
})

const List: FC<ListProps> = observer((props) => {
  const { activeType, changeFilter, changeActiveType } = ListSotre
  const { onFetchList, loading, pagination } = props

  const handleChange = (type: ReceiptStatusAllKey) => {
    changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
    changeActiveType(type)
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
      tabData={STOCK_OUT_RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
