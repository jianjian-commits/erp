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
          <span>{t('????????????????????????')}</span>
          <div className='gm-gap-10' />
          <Flex justifyEnd>
            <Button
              onClick={() => {
                Modal.hide()
              }}
            >
              {t('??????')}
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
              {t('??????')}
            </Button>
          </Flex>
        </div>
      ),
      style: { width: '300px' },
      title: t('????????????'),
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
    !settle_sheet_serial_no // ????????????????????????????????????

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
            {t('??????')}
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
            {t('????????????')}
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
            {t('????????????')}
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
                text: t('????????????'),
                onClick: handleSaveDraft,
                show: currentActionList.includes('toBeSubmitted'),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_REFUND_OUT_SHEET,
              ) && {
                text: t('?????????'),
                onClick: handleCancelApproved,
                show: canCancelApproved,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_REFUND_OUT_SHEET,
              ) && {
                text: t('??????'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              {
                text: t('????????????'),
                onClick: handlePrint,
                show: currentActionList.includes('print'),
              },
              // {
              //   text: t('????????????'),
              //   onClick: handleExport,
              //   show: currentActionList.includes('export'),
              // },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_REFUND_OUT_SHEET,
              ) && {
                text: t('????????????'),
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
  // ?????????????????????
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
        title: t('???????????????'),
        buttons: [
          {
            text: t('??????'),
            onClick: Dialog.hide,
          },
          {
            text: t('??????'),
            onClick: () => {
              change()
              store.clearProductDetails()
              Dialog.hide()
            },
            btnType: 'primary',
          },
        ],
        children: t('??????????????????????????????????????????'),
      })
    } else {
      change()
    }
  }

  // enter
  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter ?????????
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
      {/* supplier_status:0 ???????????????????????????????????? */}
      {target_delete_time !== '0' && <SupplierDeletedSign />}
      {isAdd ? (
        <MoreSelect
          ref={targetRef}
          data={supplierList.slice()}
          selected={supplierSelected}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilterType='pinyin'
          placeholder={t('??????????????????')}
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
      placeholder={t('???????????????')}
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
        label: t('????????????????????????'),
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
        label: t('????????????'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: t('?????????'),
        item: <TargetName type={type} />,
        required: true,
      },
      {
        label: t('????????????'),
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time),
      },
      {
        label: t('????????????'),
        item: <StockOutTime type={type} />,
      },
      {
        label: t('????????????'),
        item: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status] ?? null,
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('????????????'),
        item: handlePayStatus(pay_status!).name,
        // tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('?????????'),
        item: creator_name || '-',
      },
      // ??????
      {
        label: null,
        item: null,
      },
      {
        label: t('????????????'),
        item: <StockOutRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { totalDiscount, receiptDetail } = store

    return [
      {
        text: t('????????????'),
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
        text: t('????????????'),
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
        text: t('????????????'),
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
