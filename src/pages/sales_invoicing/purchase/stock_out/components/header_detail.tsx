import React, { useRef, FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  MoreSelect,
  Input,
  MoreSelectDataItem,
  Modal,
  Flex,
  Dialog,
  RightSideModal,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import sale_store from '../../../store'
import moment from 'moment'
import _ from 'lodash'
import { defaultProductDetail } from '@/pages/sales_invoicing/receipt_base_data'

import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import {
  RECEIPT_STATUS_TAG,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '../../../enum'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
  getUnNillText,
  openNewTab,
} from '@/common/util'
import { history } from '@/common/service'
import {
  getMinStockTime,
  getReceiptActionableList,
  handlePayStatus,
} from '@/pages/sales_invoicing/util'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'

import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import { PrintModal } from '@/pages/sales_invoicing/components'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface ActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<ActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id, sheet_type, settle_sheet_serial_no } =
    store.receiptDetail

  const isAdd = props.type === 'add'

  const currentActionList =
    getReceiptActionableList(sheet_status, 'saleOut') ?? []

  const handlePrint = () => {
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
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify({
                sheet_ids: [stock_sheet_id],
                stock_sheet_type: sheet_type,
              })
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

  // const handleExport = () => {
  //   const {
  //     receiptDetail: { stock_sheet_id },
  //   } = store

  //   window.open(
  //     `/stock/in_stock_sheet/material/new_detail?id=${stock_sheet_id}&export=1`,
  //   )
  // }

  const handleNotApproved = () => {
    return store.updateAndGetReceipt('notApproved')
  }

  const handleDelete = () => {
    Modal.render({
      children: (
        <div>
          <span>{t('是否删除此单据？')}</span>
          <div className='gm-gap-10' />
          <Flex justifyEnd>
            <Button
              onClick={() => {
                Modal.hide()
              }}
            >
              {t('取消')}
            </Button>
            <div className='gm-gap-5' />
            <Button
              type='danger'
              onClick={() => {
                return store.updateAndGetReceipt('deleted').then(() => {
                  Modal.hide()
                  return null
                })
              }}
            >
              {t('删除')}
            </Button>
          </Flex>
        </div>
      ),
      style: { width: '300px' },
      title: t('删除单据'),
    })
  }

  const handleSaveDraft = () => {
    if (stock_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('toBeSubmitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/purchase/stock_out/detail?sheet_id=${json.response.stock_sheet?.stock_sheet_id}`,
          )
          return json
        })
        .catch(() => {
          store.changeReceiptLoading(false)
        })
    }
  }

  const handleSubmit = () => {
    if (store.receiptDetail.stock_sheet_id) {
      store.updateAndGetReceipt('submitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('submitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/purchase/stock_out/detail?sheet_id=${json.response.stock_sheet?.stock_sheet_id}`,
          )
          return json
        })
        .catch(() => {
          store.changeReceiptLoading(false)
        })
    }
  }

  const handleCancelApproved = () => {
    return store.updateAndGetReceipt('cancelApproval')
  }
  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
  }
  const { receiptLoading } = store

  const canCancelApproved =
    currentActionList.includes('cancelApproval') &&
    !isAdd &&
    !settle_sheet_serial_no // 已关联结款单则不能反审了

  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_REFUND_OUT_SHEET}
        >
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleSubmit}
            disabled={receiptLoading}
          >
            {t('提交')}
          </Button>
        </PermissionJudge>
      )}
      {currentActionList.includes('approved') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_APPROVE_REFUND_OUT_SHEET}
        >
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleApproved}
            disabled={receiptLoading}
          >
            {t('审核出库')}
          </Button>
        </PermissionJudge>
      )}
      {sheet_status === -1 && currentActionList.includes('toBeSubmitted') && (
        <>
          <div className='gm-gap-10' />
          <Button
            plain
            className='gm-margin-right-5'
            onClick={handleSaveDraft}
            disabled={receiptLoading}
          >
            {t('保存草稿')}
          </Button>
        </>
      )}

      {sheet_status !== -1 && (
        <FunctionSet
          right
          data={_.without(
            [
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_UPDATE_REFUND_OUT_SHEET,
              ) && {
                text: t('保存草稿'),
                onClick: handleSaveDraft,
                show: currentActionList.includes('toBeSubmitted'),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_REFUND_OUT_SHEET,
              ) && {
                text: t('反审核'),
                onClick: handleCancelApproved,
                show: canCancelApproved,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_REFUND_OUT_SHEET,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              {
                text: t('打印单据'),
                onClick: handlePrint,
                show: currentActionList.includes('print'),
              },
              // {
              //   text: t('导出单据'),
              //   onClick: handleExport,
              //   show: currentActionList.includes('export'),
              // },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_REFUND_OUT_SHEET,
              ) && {
                text: t('删除单据'),
                onClick: handleDelete,
                show: currentActionList.includes('deleted'),
              },
            ],
            false,
          )}
        />
      )}
    </>
  )
})

interface TimeProps {
  type: 'add' | 'detail'
}

const StockOutTime: FC<TimeProps> = observer((props) => {
  const { submit_time } = store.receiptDetail
  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const isAdd = props.type === 'add'

  const handleChangeDate = (selected: Date | null) => {
    store.changeReceiptDetail('submit_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={getDateByTimestamp(submit_time)}
          onChange={handleChangeDate}
          enabledTimeSelect
          style={{ width: '145px' }}
          min={new Date(Number(period_list[0]?.end_time)) || getMinStockTime()}
          max={new Date()}
          timeLimit={{
            disabledSpan: (time) => {
              return moment(time).isAfter(moment())
            },
          }}
        />
      ) : (
        <div className='b-stock-in-content'>
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time)}
        </div>
      )}
    </>
  )
})

interface RemarkProps {
  type: 'add' | 'detail'
}

const StockOutRemark: FC<RemarkProps> = observer(({ type }) => {
  // 确保在最后一行
  const { remark } = store.receiptDetail

  const isAdd = type === 'add'

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    store.changeReceiptDetail('remark', value)
  }

  return isAdd ? (
    <Input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={50}
      onChange={handleListRemarkChange}
      style={{ width: '400px' }}
    />
  ) : (
    <div className='b-stock-in-content' style={{ width: '500px' }}>
      {remark}
    </div>
  )
})

interface TargetNameProps {
  type: 'add' | 'detail'
}
const TargetName: FC<TargetNameProps> = observer((props) => {
  const { supplierList, receiptDetail } = store
  const {
    supplier_name,
    supplier_id,
    target_delete_time,
    target_customized_code,
  } = receiptDetail

  const { type } = props
  const targetRef = useRef<MoreSelect>(null)

  const isAdd = type === 'add'

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    const change = () => {
      store.changeReceiptDetail('target_id', selected.value)
      store.changeReceiptDetail('target_name', selected.text)
      store.changeReceiptDetail('supplier_id', selected.value)
      store.changeReceiptDetail('supplier_name', selected.text)
      store.changeReceiptDetail(
        'target_attrs_invoice_type',
        selected?.attrs?.china_vat_invoice?.invoice_type,
      )
    }
    if (supplier_name) {
      Dialog.render({
        title: t('切换供应商'),
        buttons: [
          {
            text: t('取消'),
            onClick: Dialog.hide,
          },
          {
            text: t('确定'),
            onClick: () => {
              change()
              store.clearProductDetails()
              Dialog.hide()
            },
            btnType: 'primary',
          },
        ],
        children: t('切换客户会清空商品，是否切换'),
      })
    } else {
      change()
    }
  }

  // enter
  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      targetRef.current!.apiDoSelectWillActive()

      window.document.body.click()
    }
  }

  let supplierSelected
  if (supplier_id) {
    supplierSelected = { value: supplier_id, text: supplier_name! }
  }

  return (
    <Flex alignCenter>
      {/* supplier_status:0 为已删除，空为没有供应商 */}
      {target_delete_time !== '0' && <SupplierDeletedSign />}
      {isAdd ? (
        <MoreSelect
          ref={targetRef}
          data={supplierList.slice()}
          selected={supplierSelected}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilterType='pinyin'
          placeholder={t('请选择供应商')}
          disabledClose
          style={{ width: '140px' }}
        />
      ) : (
        <span>{`${supplier_name}(${target_customized_code})`}</span>
      )}
    </Flex>
  )
})

interface WarehouseProps {
  type: 'add' | 'detail'
}

const WarehouseName: FC<WarehouseProps> = observer((props) => {
  const { type } = props
  const { warehouse_id, warehouse_name } = store.receiptDetail

  const isAdd = type === 'add'

  return isAdd ? (
    <Select_Warehouse
      style={{
        maxWidth: '160px',
      }}
      value={warehouse_id}
      onChange={(selected) => {
        store.changeReceiptDetail('warehouse_id', selected)
        store.initReceiptDetail()
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

interface HeaderDetailProps {
  type: 'add' | 'detail'
}

const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    const { stock_sheet_serial_no } = store.receiptDetail
    return [
      {
        label: t('采购退货出库单号'),
        item: (
          <div style={{ width: '280px' }}>{stock_sheet_serial_no || '-'}</div>
        ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { sheet_status, creator_name, create_time, pay_status } =
      store.receiptDetail

    return [
      {
        label: t('选择仓库'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: t('供应商'),
        item: <TargetName type={type} />,
        required: true,
      },
      {
        label: t('建单时间'),
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time),
      },
      {
        label: t('出库时间'),
        item: <StockOutTime type={type} />,
      },
      {
        label: t('单据状态'),
        item: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status] ?? null,
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('支付状态'),
        item: handlePayStatus(pay_status!).name,
        // tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      // 换行
      {
        label: null,
        item: null,
      },
      {
        label: t('单据备注'),
        item: <StockOutRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { totalDiscount, receiptDetail } = store

    return [
      {
        text: t('单据金额'),
        value: (
          <Price
            value={
              +receiptDetail?.tax_total_price! ||
              +receiptDetail?.total_price! ||
              0
            }
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
      {
        text: t('商品金额'),
        value: (
          <Price
            value={
              +receiptDetail?.product_total_price! ||
              +receiptDetail?.total_price! ||
              0
            }
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
      {
        text: t('折让金额'),
        value: (
          <Price
            value={totalDiscount ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={80}
      contentBlockWidth={290}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
