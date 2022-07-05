import TableTotalText from '@/common/components/table_total_text'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Dialog,
  Flex,
  Modal,
  Price,
  RightSideModal,
  Tip,
  BoxTableProps,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useMemo } from 'react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import _ from 'lodash'

import store from '../store'
import { getFormatTimeForTable, openNewTab, toFixedByType } from '@/common/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'
import { RECEIPT_TYPE, RECEIPT_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { OperationHeader } from '@gm-pc/table-x/src/components'
import PaymentSlipTable from './payment_slip_table'
import SVGPrint from '@/svg/print.svg'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { PrintModal } from '@/pages/sales_invoicing/components'

const List: FC<
  { onFetchList: () => any } & Pick<BoxTableProps, 'pagination'>
> = (props) => {
  const { list, paging } = store

  const _columns: Column[] = useMemo(() => {
    return [
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
        Header: t('单据编号'),
        accessor: 'stock_sheet_serial_no',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            stock_sheet_id,
            stock_sheet_serial_no,
            sheet_status,
            sheet_type,
          } = cellProps.original

          const targetUrl =
            sheet_type === RECEIPT_TYPE.purchaseIn
              ? '/sales_invoicing/purchase/stock_in'
              : '/sales_invoicing/purchase/stock_out'
          return (
            <StockSheetLink
              url={targetUrl}
              sheetStatus={sheet_status}
              showText={stock_sheet_serial_no}
              stockSheetId={stock_sheet_id}
            />
          )
        },
      },
      {
        Header: t('单据类型'),
        accessor: 'sheet_type',
        minWidth: 100,
        Cell: (cellProps) => {
          return RECEIPT_TYPE_NAME[cellProps.original.sheet_type]
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
        Header: t('单据总金额'),
        accessor: 'tax_total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            toFixedByType(
              cellProps.original.tax_total_price,
              'dpInventoryAmount',
            ) + Price.getUnit()
          )
        },
      },
      {
        Header: t('商品总金额'),
        accessor: 'product_total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            toFixedByType(
              cellProps.original.product_total_price,
              'dpInventoryAmount',
            ) + Price.getUnit()
          )
        },
      },
      {
        Header: t('不含税商品总金额'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            toFixedByType(cellProps.original.total_price, 'dpInventoryAmount') +
            Price.getUnit()
          )
        },
      },
      {
        Header: t('税额'),
        accessor: 'total_price',
        minWidth: 100,
        Cell: (cellProps) => {
          const { total_price, product_total_price } = cellProps.original
          return (
            toFixedByType(
              Math.abs(product_total_price - total_price),
              'dpInventoryAmount',
            ) + Price.getUnit()
          )
        },
      },
      {
        Header: t('入库/出库时间'),
        accessor: 'submit_time',
        minWidth: 110,
        Cell: (cellProps) => {
          const { submit_time } = cellProps.original
          return getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time)
        },
      },
      {
        Header: OperationHeader,
        accessor: 'operate',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        diyItemText: t('操作'),
        Cell: (cellProps) => {
          return (
            <TableXUtil.OperationCell>
              <span
                className='gm-text-14 gm-text-hover-primary gm-cursor'
                onClick={() => handlePopupPrintModal(cellProps.original)}
              >
                <SVGPrint />
              </span>
            </TableXUtil.OperationCell>
          )
        },
      },
    ]
  }, [])

  const handlePopupPrintModal = (data: any) => {
    const req = {
      sheet_ids: [data.stock_sheet_id],
      stock_sheet_type: data.sheet_type,
    }
    const isStockIn = data.sheet_type === RECEIPT_TYPE.purchaseIn
    const type = isStockIn
      ? PrintingTemplate_Type.TYPE_IN_STOCK
      : PrintingTemplate_Type.TYPE_OUT_STOCK

    const name = isStockIn
      ? 'purchase_stock_in_print'
      : 'purchase_stock_out_print'
    return ListPrintingTemplate({
      paging: { limit: 999 },
      type: type,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name={name}
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/${
                  isStockIn ? 'stock_in_template' : 'stock_out_template'
                }/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
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

  const handleEnsureAdd = (isSelectAll: boolean, selectedIds: string[]) => {
    store.createSettleSheet(isSelectAll, selectedIds).then(() => {
      props.onFetchList()
      Modal.hide()
      return null
    })
  }

  const renderPaymentSlipTableModal = (
    isSelectAll: boolean,
    selected: string[],
  ) => {
    Modal.hide()

    Modal.render({
      title: t('加入结款单'),
      onHide: Modal.hide,
      children: (
        <PaymentSlipTable
          cancelFunc={Modal.hide}
          ensureFunc={(settleSelectedId) => {
            store
              .postAddInExistPaymentSlip(
                isSelectAll,
                settleSelectedId,
                selected,
              )
              .then(() => {
                Modal.hide()
                return null
              })
          }}
        />
      ),
    })
  }

  const handleBatchAdd = (selected: string[], isSelectAll: boolean) => {
    const selectedData = _.filter(store.list, (item) =>
      selected.includes(item.stock_sheet_id),
    )

    const group = _.groupBy(selectedData, (value) => {
      return value.target_id
    })

    if (_.keys(group).length > 1) {
      Tip.danger(t('只有相同的供应商单据才能加入结款单'))
      return false
    }

    return store
      .getAlreadyExistPaymentSlip(
        isSelectAll,
        // isSelectAll ? undefined : selectedData[0].target_id,
        selectedData[0].target_id,
      )
      .then(() => {
        const { paymentSlipList } = store

        if (paymentSlipList.length > 0) {
          Modal.render({
            children: (
              <div>
                <span>
                  {t('当前供应商已有待提交结款单，是否加入已有结款单?')}
                </span>
                <Flex
                  className='gm-margin-top-10'
                  style={{ flexDirection: 'row-reverse' }}
                >
                  <Button
                    type='primary'
                    onClick={() =>
                      renderPaymentSlipTableModal(isSelectAll, selected)
                    }
                  >
                    {t('加入已有结款单')}
                  </Button>
                  <Button
                    className='gm-margin-right-5'
                    onClick={() => handleEnsureAdd(isSelectAll, selected)}
                  >
                    {t('新建结款单')}
                  </Button>
                </Flex>
              </div>
            ),
            title: t('加入结款单'),
            onHide: Modal.hide,
            size: 'sm',
          })
        } else {
          Dialog.render({
            children: <span>{t('是否将所选单据加入结款单?')}</span>,
            title: t('加入结款单'),
            size: 'sm',
            buttons: [
              { text: t('取消'), onClick: Dialog.hide, btnType: 'default' },
              {
                text: t('确定'),
                onClick: () => handleEnsureAdd(isSelectAll, selected),
                btnType: 'primary',
              },
            ],
          })
        }
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
                content: paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table
        isBatchSelect
        isDiy
        id='un_handle_receipt_table'
        keyField='stock_sheet_id'
        columns={_columns}
        fixedSelect
        data={list.slice()}
        batchActions={[
          {
            children: t('批量加入结款单'),
            onAction: handleBatchAdd,
          },
        ]}
      />
    </BoxTable>
  )
}

export default List
