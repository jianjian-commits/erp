import React, { FC } from 'react'
import { TableXUtil, BatchActionDefault, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import { observer } from 'mobx-react'
import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import {
  RECEIPT_STATUS,
  STOCK_IN_RECEIPT_TABS,
  STOCK_IN_RECEIPT_STATUS_NAME,
  HIDE_STOCK_IN_OR_OUT_RECEIPT_TABS_WITH_LITE,
} from '../../../enum'
import {
  BoxTableInfo,
  BoxTable,
  Button,
  Flex,
  Price,
  RightSideModal,
  BoxTableProps,
} from '@gm-pc/react'
import { history } from '@/common/service'
import TableTotalText from '@/common/components/table_total_text'
import {
  getFormatTimeForTable,
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import { canDeleteReceipt, handlePayStatus } from '@/pages/sales_invoicing/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import type { Warehouse } from 'gm_api/src/inventory'
import type { Supplier, GroupUser } from 'gm_api/src/enterprise'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/purchase/stock_in/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_PURCHASE_IN_SHEET}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建入库单')}
      </Button>
    </PermissionJudge>
  )
})

const ListTable = observer((props: ListProps) => {
  const { list, getAdditionInfo } = store

  const _columns: Column[] = [
    {
      Header: t('建单时间'),
      accessor: 'create_time',
      minWidth: 100,
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time)
      },
    },
    {
      Header: t('预计到货时间'),
      accessor: 'estimated_time',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { estimated_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD HH:mm', estimated_time)
      },
    },
    {
      Header: t('入库时间'),
      accessor: 'in_stock_time',
      minWidth: 110,
      Cell: (cellProps) => {
        const { in_stock_time } = cellProps.original
        return getFormatTimeForTable('YYYY-MM-DD HH:mm', in_stock_time)
      },
    },
    {
      Header: t('仓库'),
      accessor: 'warehouse_name',
      minWidth: 110,
      show: !globalStore.isLite,
      Cell: (cellProps: any) => {
        const { warehouse_id } = cellProps.original
        const warehouse = getAdditionInfo<Warehouse>('warehouses', warehouse_id)
        return getUnNillText(warehouse?.name)
      },
    },
    {
      Header: t('采购入库单号'),
      accessor: 'stock_sheet_serial_no',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          purchase_in_stock_sheet_id,
          purchase_in_stock_sheet_serial_no,
          sheet_status,
          status,
        } = cellProps.original
        return (
          <StockSheetLink
            url='/sales_invoicing/purchase/stock_in'
            sheetStatus={sheet_status}
            showText={purchase_in_stock_sheet_serial_no}
            stockSheetId={purchase_in_stock_sheet_id}
            status={status!}
          />
        )
      },
    },
    {
      Header: t('供应商'),
      accessor: 'target_name',
      minWidth: 140,
      Cell: (cellProps) => {
        const { supplier_id } = cellProps.original
        const supplier = getAdditionInfo<Supplier>('suppliers', supplier_id)

        return supplier?.name ? (
          <Flex alignCenter>
            {supplier?.delete_time !== '0' && <SupplierDeletedSign />}
            {`${supplier?.name}(${supplier?.customized_code})`}
          </Flex>
        ) : (
          '-'
        )
      },
    },
    {
      Header: t('采购员'),
      accessor: 'purchaser_id',
      hide: globalStore.isLite,
      minWidth: 110,
      Cell: (cellProps) => {
        const { purchaser_id } = cellProps.original
        const groupUser = getAdditionInfo<GroupUser>(
          'group_users',
          purchaser_id,
        )
        return groupUser?.name ? (
          <Flex alignCenter>
            {groupUser?.delete_time !== '0' && <SupplierDeletedSign />}
            {groupUser?.name}
          </Flex>
        ) : (
          '-'
        )
      },
    },
    {
      Header: t('单据金额'),
      accessor: 'total_price',
      minWidth: 100,
      hide: !globalStore.hasPermission(
        Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
      ),
      Cell: (cellProps) => {
        const { amount_tax_discount } = cellProps?.original
        return isValid(amount_tax_discount)
          ? toFixedByType(amount_tax_discount, 'dpInventoryAmount') +
              Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('商品总金额'),
      accessor: 'no_tax_total_price',
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      minWidth: 100,
      Cell: ({ original: { amount_tax } }) => {
        return isValid(amount_tax)
          ? toFixedByType(amount_tax, 'dpInventoryAmount') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('不含税商品总金额'),
      accessor: 'no_tax_total_price_copy',
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { amount } = cellProps.original
        return isValid(amount)
          ? toFixedByType(amount, 'dpInventoryAmount') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('税额'),
      accessor: 'tax_money',
      hide:
        !globalStore.hasPermission(
          Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_MONEY,
        ) || globalStore.isLite,
      diyEnable: false,
      minWidth: 100,
      Cell: (cellProps) => {
        const { amount, amount_tax } = cellProps.original
        const value = Math.abs(amount_tax - amount)
        return isValid(value)
          ? toFixedByType(value, 'dpInventoryAmount') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('单据状态'),
      accessor: 'sheet_status',
      minWidth: 100,
      Cell: (cellProps) => {
        const { sheet_status } = cellProps.original
        return STOCK_IN_RECEIPT_STATUS_NAME[sheet_status]
      },
    },
    {
      Header: t('支付状态'),
      accessor: 'pay_status',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { pay_status } = cellProps.original
        return handlePayStatus(pay_status).name
      },
    },
    {
      Header: t('建单人'),
      accessor: 'creator_id',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { creator_id } = cellProps.original
        const groupUser = getAdditionInfo<GroupUser>('group_users', creator_id)
        return getUnNillText(groupUser?.name)
      },
    },
    {
      Header: t('单据备注'),
      accessor: 'remark',
      hide: globalStore.isLite,
      minWidth: 100,
      Cell: (cellProps) => {
        const { remark } = cellProps.original
        return getUnNillText(remark)
      },
    },
    {
      Header: t('关联采购单'),
      accessor: 'related_sheet_serial_no',
      minWidth: 100,
      Cell: (cellProps) => {
        const { purchase_sheet_serial_no, purchase_sheet_id } =
          cellProps.original
        return (
          <div>
            <a
              href={`/#/purchase/manage/bills/detail?id=${purchase_sheet_id}`}
              className='gm-text-primary'
              rel='noopener noreferrer'
              target='_blank'
            >
              {purchase_sheet_serial_no}
            </a>
          </div>
        )
      },
    },
    {
      Header: OperationHeader,
      accessor: 'operate',
      hide: globalStore.isLite,
      minWidth: TableXUtil.TABLE_X.WIDTH_OPERATION,
      diyItemText: t('操作'),
      Cell: (cellProps) => {
        const { sheet_status } = cellProps.original
        return (
          <OperationCell>
            {canDeleteReceipt(sheet_status) && (
              <OperationDelete
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_INVENTORY_DELETE_PURCHASE_IN_SHEET,
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

  const handlePopupPrintModal = (
    selected: string[],
    isSelectedAll: boolean,
  ) => {
    const req = isSelectedAll
      ? store.getSearchData()
      : {
          sheet_ids: selected,
          with_details: true,
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
            onPrint={({ printing_template_id }) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/stock_in_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}&type=purchase_in`,
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
                content: props.pagination?.paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        isBatchSelect={!globalStore.isLite}
        isDiy
        id='purchase_stock_in_list'
        keyField='purchase_in_stock_sheet_id'
        columns={_columns}
        fixedSelect
        data={list}
        loading={props.loading}
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
  if (globalStore.isLite)
    return (
      <ListTable
        onFetchList={onFetchList}
        loading={loading}
        pagination={pagination}
      />
    )
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
      omitTabs={
        globalStore.isLite ? HIDE_STOCK_IN_OR_OUT_RECEIPT_TABS_WITH_LITE : []
      }
    />
  )
})

export default List
export { ListTable }
