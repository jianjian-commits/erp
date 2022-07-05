import React, { FC, useMemo } from 'react'
import {
  TableXUtil,
  BatchActionDefault,
  Table,
  Column,
  TableProps,
} from '@gm-pc/table-x'
import { t } from 'gm-i18n'

import store from '../stores/list_store'
import { observer } from 'mobx-react'
import { ListStatusTabs, PrintModal } from '@/pages/sales_invoicing/components'
import {
  RECEIPT_STATUS,
  STOCK_OUT_RECEIPT_STATUS_NAME,
  STOCK_OUT_RECEIPT_TABS,
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
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import {
  getFormatTimeForTable,
  getUnNillText,
  isValid,
  openNewTab,
  toFixedByType,
} from '@/common/util'
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
import _ from 'lodash'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const ListRight = observer(() => {
  const handleCreate = () => {
    history.push('/sales_invoicing/purchase/stock_out/create')
  }

  return (
    <PermissionJudge
      permission={Permission.PERMISSION_INVENTORY_CREATE_REFUND_OUT_SHEET}
    >
      <Button type='primary' onClick={handleCreate}>
        {t('新建采购退货出库单')}
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
        Header: t('出库时间'),
        accessor: 'stock_sheet_id5',
        minWidth: 110,
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
          const { warehouse_name } = cellProps.row.original
          return getUnNillText(warehouse_name)
        },
      },
      {
        Header: t('采购退货出库单号'),
        accessor: 'stock_sheet_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { stock_sheet_id, stock_sheet_serial_no, sheet_status } =
            cellProps.original
          return (
            <StockSheetLink
              url='/sales_invoicing/purchase/stock_out'
              sheetStatus={sheet_status}
              showText={stock_sheet_serial_no}
              stockSheetId={stock_sheet_id}
            />
          )
        },
      },
      {
        Header: t('供应商'),
        accessor: 'target_name',
        minWidth: 100,
        Cell: (cellProps) => {
          const { target_delete_time, target_name, target_customized_code } =
            cellProps.original
          return (
            <Flex alignCenter>
              {target_delete_time !== '0' && <SupplierDeletedSign />}
              {`${target_name}(${target_customized_code})`}
            </Flex>
          )
        },
      },
      {
        Header: t('单据金额'),
        accessor: 'tax_total_price',
        minWidth: 100,
        Cell: ({ original: { tax_total_price } }) => {
          return isValid(tax_total_price)
            ? toFixedByType(tax_total_price, 'dpInventoryAmount') +
                Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('商品金额'),
        accessor: 'product_total_price',
        minWidth: 100,
        Cell: ({ original: { product_total_price } }) => {
          return isValid(product_total_price)
            ? toFixedByType(product_total_price, 'dpInventoryAmount') +
                Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('商品成本'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: ({ original: { total_price } }) => {
          return isValid(total_price)
            ? toFixedByType(total_price, 'dpInventoryAmount') + Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('税额'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: ({ original: { total_price, product_total_price } }) => {
          return isValid(total_price) && isValid(product_total_price)
            ? toFixedByType(
                Math.abs(product_total_price - total_price),
                'dpInventoryAmount',
              ) + Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('单据状态'),
        accessor: 'stock_sheet_id3',
        minWidth: 100,
        Cell: (cellProps) => {
          return STOCK_OUT_RECEIPT_STATUS_NAME[cellProps.original.sheet_status]
        },
      },
      {
        Header: t('支付状态'),
        accessor: 'pay_status',
        minWidth: 100,
        Cell: (cellProps) => {
          return handlePayStatus(cellProps.original.pay_status).name
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
          return groupUsers?.[creator_id]?.name ?? '-'
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
                      Permission.PERMISSION_INVENTORY_DELETE_REFUND_OUT_SHEET,
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
      type: PrintingTemplate_Type.TYPE_OUT_STOCK,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='purchase_stock_out_print'
            onPrint={({ printing_template_id }) => {
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
    // 以下目前不需要了，暂且保留两周
    // CheckOutStock(store.getBatchReq(selected, isSelectedAll)).then((json) => {
    //   if (json.response.lack_stock && json.response.lack_stock.length > 0) {
    //     if (globalStore.salesInvoicingSetting.allow_negative_stock) {
    //       Dialog.render({
    //         children: <div>{t('存在库存不足的商品，是否负库存出库')}</div>,
    //         onHide: Dialog.hide,
    //         buttons: [
    //           { onClick: Dialog.hide, text: t('取消') },
    //           {
    //             onClick: async () => {
    //               await onEnsure(selected, isSelectedAll)
    //               Dialog.hide()
    //             },
    //             text: t('确定'),
    //             btnType: 'primary',
    //           },
    //         ],
    //       })
    //     } else {
    //       Tip.danger(t('存在库存不足的商品，不允许出库'))
    //     }
    //   } else {
    //     onEnsure(selected, isSelectedAll)
    //   }

    //   return json
    // })
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
        id='purchase_stock_out_list'
        keyField='stock_sheet_id'
        loading={props.loading}
        fixedSelect
        columns={_columns}
        data={list.slice()}
        batchActions={
          _.filter(
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
                  handleCheckStock(
                    selected,
                    isSelectedAll,
                    handleBatchApproval,
                  ),
              },
            ],
            Boolean,
          ) as TableProps['batchActions']
        }
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
      tabData={STOCK_OUT_RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
