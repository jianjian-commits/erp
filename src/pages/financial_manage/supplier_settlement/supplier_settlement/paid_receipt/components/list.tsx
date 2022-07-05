import TableTotalText from '@/common/components/table_total_text'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Flex,
  Modal,
  Price,
  RightSideModal,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC, useMemo } from 'react'
import { Table, Column, TableXUtil } from '@gm-pc/table-x'

import store from '../store'
import {
  getEnumText,
  getFormatTimeForTable,
  openNewTab,
  toFixedByType,
} from '@/common/util'

import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'

import { OperationHeader } from '@gm-pc/table-x/src/components'
import AddPaidModal from './add_paid_modal'

import { history } from '@/common/service'

import { observer } from 'mobx-react'
import SVGPrint from '@/svg/print.svg'
import PrintModal from './print_modal'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import ListStatusTabs from './list_status_tabs'
import { SETTLE_SHEET_STATUS, SUPPLIER_CREDIT_TYPE } from '../../enum'
import globalStore from '@/stores/global'

const ListTable: FC<{ loading: boolean } & Pick<BoxTableProps, 'pagination'>> =
  observer((props) => {
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
          Header: t('结款单号'),
          accessor: 'settle_sheet_serial_no',
          minWidth: 100,
          Cell: (cellProps) => {
            const { settle_sheet_serial_no, settle_sheet_id } =
              cellProps.original
            return (
              <a
                onClick={(e) => {
                  e.preventDefault()
                  history.push(
                    '/financial_manage/supplier_settlement/supplier_settlement/paid_receipt/detail?sheet_id=' +
                      settle_sheet_id,
                  )
                }}
                className='gm-cursor'
              >
                {settle_sheet_serial_no}
              </a>
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
          Header: t('应付金额'),
          accessor: 'should_amount',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              toFixedByType(
                cellProps.original.should_amount,
                'dpSupplierSettle',
              ) + Price.getUnit()
            )
          },
        },
        {
          Header: t('应付金额(不含税)'),
          accessor: 'should_amount_no_tax',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              toFixedByType(
                cellProps.original.should_amount_no_tax,
                'dpSupplierSettle',
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
                'dpSupplierSettle',
              ) + Price.getUnit()
            )
          },
        },
        {
          Header: t('商品总金额(不含税)'),
          accessor: 'product_total_price_no_tax',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              toFixedByType(
                cellProps.original.product_total_price_no_tax,
                'dpSupplierSettle',
              ) + Price.getUnit()
            )
          },
        },
        {
          Header: t('税额'),
          accessor: 'tax_price',
          minWidth: 100,
          Cell: (cellProps) => {
            const { tax_price } = cellProps.original
            return (
              toFixedByType(tax_price, 'dpSupplierSettle') + Price.getUnit()
            )
          },
        },
        {
          Header: t('结算周期'),
          accessor: 'payment_method',
          minWidth: 110,
          Cell: (cellProps) => {
            const { credit_type } = cellProps.original

            return getEnumText(SUPPLIER_CREDIT_TYPE, credit_type) ?? '-'
          },
        },
        {
          Header: t('结款单状态'),
          accessor: 'payment_status',
          minWidth: 110,
          Cell: (cellProps) => {
            const { sheet_status } = cellProps.original
            return getEnumText(SETTLE_SHEET_STATUS, sheet_status)
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
        settle_sheet_id: data.settle_sheet_id,
      }
      return ListPrintingTemplate({
        paging: { limit: 999 },
        type: PrintingTemplate_Type.TYPE_SETTLEMENT,
      }).then((json) => {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          style: { width: '300px' },
          children: (
            <PrintModal
              name='produce_stock_out_print'
              onPrint={({ printing_template_id }: any) => {
                const settle_sheet_req = JSON.stringify(req)
                openNewTab(
                  `#system/template/print_template/supplier_settle_template/print?tpl_id=${printing_template_id}&settle_sheet_req=${settle_sheet_req}`,
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

    const handleEnsureBatchPaid = (
      code: string,
      selected: string[],
      isSelectedAll: boolean,
    ) => {
      store.batchSettle(code, selected, isSelectedAll).then(() => {
        globalStore.showTaskPanel('1')
        store.listRequest()
        return null
      })
    }

    const handleBatchPaid = (selected: string[], isSelectedAll: boolean) => {
      Modal.render({
        children: (
          <AddPaidModal
            onEnsure={(code) =>
              handleEnsureBatchPaid(code, selected, isSelectedAll)
            }
            onCancel={() => Modal.hide()}
          />
        ),
        title: t('批量结款'),
      })
    }

    const handleBatchSubmit = (selected: string[], isSelectedAll: boolean) => {
      store.batchSubmit(selected, isSelectedAll).then(() => {
        globalStore.showTaskPanel('1')
        store.listRequest()
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
          id='paid_receipt_table'
          keyField='settle_sheet_id'
          columns={_columns}
          fixedSelect
          data={list.slice()}
          loading={props.loading}
          batchActions={[
            {
              children: t('批量提交'),
              onAction: handleBatchSubmit,
            },
            {
              children: t('批量结款'),
              onAction: handleBatchPaid,
            },
          ]}
        />
      </BoxTable>
    )
  })

const List: FC<
  { loading: boolean; onFetchList: () => any } & Pick<
    BoxTableProps,
    'pagination'
  >
> = observer((props) => {
  const handleChange = (type: any) => {
    store.changeFilter('sheet_status', type)
    store.changeActiveType(type)
    props.onFetchList()
  }

  return (
    <ListStatusTabs
      tabData={SETTLE_SHEET_STATUS}
      onChange={handleChange}
      active={store.filter.sheet_status}
      tabComponent={
        <ListTable loading={props.loading} pagination={props.pagination} />
      }
    />
  )
})

export default List
