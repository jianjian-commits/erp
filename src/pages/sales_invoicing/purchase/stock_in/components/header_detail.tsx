import React, { useRef, FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  MoreSelect,
  Flex,
  Input,
  MoreSelectDataItem,
  Modal,
  RightSideModal,
  Tip,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import moment from 'moment'

import IsInvented from '@/pages/sales_invoicing/components/isInvented'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'
import { RECEIPT_STATUS_TAG, STOCK_IN_RECEIPT_STATUS_NAME } from '../../../enum'
import {
  getMinStockTime,
  getReceiptActionableList,
  handlePayStatus,
  isInShareV2,
} from '@/pages/sales_invoicing/util'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
  getUnNillText,
  openNewTab,
} from '@/common/util'
import { history } from '@/common/service'

import { GroupUser, Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { PrintModal } from '@/pages/sales_invoicing/components'
import { Warehouse } from 'gm_api/src/inventory'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

import globalStore from '@/stores/global'
// import store from '../stores/receipt_store'
import { DetailStore } from '../stores/index'
import sale_store from '../../../store'

interface EditTypeProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<EditTypeProps> = observer(({ type }) => {
  const { sheet_status, purchase_in_stock_sheet_id, settle_sheet_serial_no } =
    DetailStore.receiptDetail
  const { apportionList } = DetailStore
  const isAdd = type === 'add'

  const currentActionList =
    getReceiptActionableList(sheet_status, 'purchaseIn') ?? []

  const handlePrint = () => {
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
              const stock_sheet_req = JSON.stringify({
                sheet_ids: [purchase_in_stock_sheet_id],
                with_details: true,
              })
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

  const handleNotApproved = () => {
    return DetailStore.updateAndGetReceipt('notApproved')
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
                return DetailStore.updateAndGetReceipt('deleted').then(() => {
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
    if (purchase_in_stock_sheet_id) {
      DetailStore.updateAndGetReceipt('toBeSubmitted')
    } else {
      DetailStore.changeReceiptLoading(true)
      DetailStore.createReceipt('toBeSubmitted')
        .then((response) => {
          DetailStore.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/purchase/stock_in/detail?sheet_id=${
              response.stock_sheet!.purchase_in_stock_sheet_id
            }`,
          )
          return null
        })
        .catch(() => {
          DetailStore.changeReceiptLoading(false)
        })
    }
  }

  const handleSubmit = () => {
    if (purchase_in_stock_sheet_id) {
      DetailStore.updateAndGetReceipt('submitted')
    } else {
      DetailStore.changeReceiptLoading(true)
      DetailStore.createReceipt('submitted')
        .then((response) => {
          DetailStore.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/purchase/stock_in/detail?sheet_id=${response.stock_sheet?.purchase_in_stock_sheet_id}`,
          )
          return response
        })
        .catch(() => {
          DetailStore.changeReceiptLoading(false)
        })
    }
  }

  const handleCancelApproved = () => {
    return DetailStore.updateAndGetReceipt('cancelApproval')
  }
  const handleApproved = () => {
    DetailStore.updateAndGetReceipt('approved')
  }

  const { receiptLoading } = DetailStore
  const canCancelApproved =
    currentActionList.includes('cancelApproval') &&
    !isAdd &&
    !settle_sheet_serial_no // ????????????????????????????????????

  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_PURCHASE_IN_SHEET}
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
          permission={Permission.PERMISSION_INVENTORY_APPROVE_PURCHASE_IN_SHEET}
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
      {!globalStore.isLite &&
        sheet_status === -1 &&
        currentActionList.includes('toBeSubmitted') && (
          <PermissionJudge
            permission={
              Permission.PERMISSION_INVENTORY_UPDATE_PURCHASE_IN_SHEET
            }
          >
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
          </PermissionJudge>
        )}

      {(sheet_status === 1 || sheet_status === 3 || sheet_status === 5) && (
        <>
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={() => {
              const isShare = DetailStore.productDetails.every((v) => {
                const { sku_id } = v
                return isInShareV2(apportionList, sku_id)
              })

              if (isShare) {
                return Tip.danger(
                  t('?????????????????????????????????????????????????????????????????????'),
                )
              }
              return history.push(
                `/sales_invoicing/purchase/stock_in/split?sheet_id=${purchase_in_stock_sheet_id}`,
              )
            }}
            disabled={receiptLoading}
          >
            {t('????????????')}
          </Button>
        </>
      )}
      {sheet_status !== -1 && (
        <FunctionSet
          right
          data={[
            {
              text: t('????????????'),
              onClick: handleSaveDraft,
              show: currentActionList.includes('toBeSubmitted'),
            },
            {
              text: t('??????'),
              onClick: handleNotApproved,
              show:
                currentActionList.includes('notApproved') &&
                !isAdd &&
                globalStore.hasPermission(
                  Permission.PERMISSION_INVENTORY_NOT_APPROVE_PURCHASE_IN_SHEET,
                ),
            },
            {
              text: t('?????????'),
              onClick: handleCancelApproved,
              show:
                canCancelApproved &&
                globalStore.hasPermission(
                  Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_PURCHASE_IN_SHEET,
                ) &&
                !globalStore.isLite,
            },
            {
              text: t('????????????'),
              onClick: handlePrint,
              show:
                currentActionList.includes('print') &&
                globalStore.hasPermission(
                  Permission.PERMISSION_INVENTORY_PRINT_PURCHASE_IN_SHEET,
                ) &&
                !globalStore.isLite,
            },
            {
              text: t('????????????'),
              onClick: handleDelete,
              show:
                currentActionList.includes('deleted') &&
                globalStore.hasPermission(
                  Permission.PERMISSION_INVENTORY_DELETE_PURCHASE_IN_SHEET,
                ),
            },
          ]}
        />
      )}
    </>
  )
})

const PalnInTime: FC<EditTypeProps> = observer((props) => {
  const { estimated_time } = DetailStore.receiptDetail
  const isAdd = props.type === 'add'
  const handleChangeDate = (selected: Date) => {
    DetailStore.changeReceiptDetail('estimated_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={
            +estimated_time! ? getDateByTimestamp(estimated_time) : undefined
          }
          onChange={handleChangeDate}
          enabledTimeSelect
        />
      ) : (
        <div className='b-stock-in-content'>
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', estimated_time)}
        </div>
      )}
    </>
  )
})

const StockInTime: FC<EditTypeProps> = observer((props) => {
  const { in_stock_time } = DetailStore.receiptDetail
  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }
  const isAdd = props.type === 'add'

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const handleChangeDate = (selected: Date) => {
    DetailStore.changeReceiptDetail('in_stock_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={getDateByTimestamp(in_stock_time)}
          onChange={handleChangeDate}
          enabledTimeSelect
          max={new Date()}
          min={new Date(Number(period_list[0]?.end_time)) || getMinStockTime()}
          timeLimit={{
            disabledSpan: (time) => {
              return moment(time).isAfter(moment())
            },
          }}
        />
      ) : (
        <div className='b-stock-in-content'>
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', in_stock_time)}
        </div>
      )}
    </>
  )
})

const StockInRemark: FC<EditTypeProps> = observer(({ type }) => {
  // ?????????????????????
  const { remark } = DetailStore.receiptDetail
  const isAdd = type === 'add'

  const handleRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    DetailStore.changeReceiptDetail('remark', value)
  }

  return isAdd ? (
    <Input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={50}
      style={{ width: '400px' }}
      onChange={handleRemarkChange}
    />
  ) : (
    <div className='b-stock-in-content'>{remark}</div>
  )
})

const WarehouseName: FC<EditTypeProps> = observer(({ type }) => {
  const {
    receiptDetail: { warehouse_id, is_replace },
    getAdditionInfo,
  } = DetailStore
  const warehouse = getAdditionInfo<Warehouse>('warehouses', warehouse_id!)
  const isAdd = type === 'add'

  // ???????????????????????????????????????????????????
  const renderHeader = () => {
    return (
      <>
        <Select_Warehouse
          style={{
            maxWidth: '160px',
          }}
          // ????????????????????????????????????????????????
          disabled={is_replace}
          value={warehouse_id}
          onChange={(selected) => {
            DetailStore.resetProductShelf()
            DetailStore.changeReceiptDetail('warehouse_id', selected)
          }}
          placeholder={t('???????????????')}
        />
      </>
    )
  }

  return isAdd ? (
    renderHeader()
  ) : (
    <span>{warehouse_id ? `${warehouse?.name}` : '-'}</span>
  )
})

const SupplierName: FC<EditTypeProps> = observer(({ type }) => {
  const {
    supplierList,
    receiptDetail: { supplier_id },
  } = DetailStore
  const isAdd = type === 'add'
  const targetRef = useRef<MoreSelect>(null)
  const targetSupplier = supplierList.find((x) => x.supplier_id === supplier_id)

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    DetailStore.changeReceiptDetail('supplier_id', selected?.value ?? '0')
    if (selected) {
      DetailStore.changeReceiptDetail(
        'target_attrs_invoice_type',
        selected?.attrs?.china_vat_invoice?.invoice_type,
      )
    }
    DetailStore.getListSkuTax()
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
  if (targetSupplier && supplier_id !== '0') {
    supplierSelected = { value: supplier_id, text: targetSupplier?.name }
  } else {
    supplierSelected = undefined
  }

  return (
    <Flex alignCenter>
      {targetSupplier && targetSupplier?.delete_time !== '0' && (
        <SupplierDeletedSign />
      )}
      {isAdd ? (
        <MoreSelect
          ref={targetRef}
          data={supplierList}
          selected={supplierSelected}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilterType='pinyin'
          placeholder={t('????????????????????????')}
        />
      ) : (
        <span>
          {targetSupplier
            ? `${targetSupplier?.name}(${targetSupplier?.customized_code})`
            : '-'}
        </span>
      )}
    </Flex>
  )
})

const PurchaserName: FC<EditTypeProps> = observer(({ type }) => {
  const {
    purchaserList,
    receiptDetail: { purchaser_id },
  } = DetailStore
  let purchase
  const isAdd = type === 'add'
  const targetPurchaser = purchaserList.find(
    (x) => x.group_user_id === purchaser_id,
  )

  if (targetPurchaser && purchaser_id !== '0') {
    purchase = {
      value: purchaser_id,
      text: targetPurchaser?.name,
    }
  } else {
    purchase = undefined
  }

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    DetailStore.changeReceiptDetail('purchaser_id', selected?.value ?? '0')
  }

  return (
    <Flex alignCenter>
      {targetPurchaser && targetPurchaser?.delete_time !== '0' && (
        <SupplierDeletedSign />
      )}
      {isAdd ? (
        <MoreSelect
          data={purchaserList}
          selected={purchase}
          onSelect={handleSelect}
          renderListFilterType='pinyin'
          placeholder={t('??????????????????')}
        />
      ) : (
        <span>{targetPurchaser?.name || '-'}</span>
      )}
    </Flex>
  )
})

const HeaderDetail: FC<EditTypeProps> = observer(({ type }) => {
  const renderHeaderInfo = () => {
    const {
      purchase_in_stock_sheet_serial_no,
      is_replace,
      purchase_sheet_serial_no,
      purchase_sheet_id,
    } = DetailStore.receiptDetail
    return [
      {
        label: t('????????????'),
        item: (
          <div>
            <div>{purchase_in_stock_sheet_serial_no || '-'}</div>
            <IsInvented status={is_replace!} />
          </div>
        ),
      },
      {
        label: t('???????????????'),
        item: (
          <Flex alignCenter>
            {purchase_sheet_id !== '0' ? (
              <a
                href={`/#/purchase/manage/bills/detail?id=${purchase_sheet_id}`}
                className='gm-text-primary'
                rel='noopener noreferrer'
                target='_blank'
              >
                {purchase_sheet_serial_no}
              </a>
            ) : (
              <span>-</span>
            )}
          </Flex>
        ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const {
      getAdditionInfo,
      receiptDetail: { sheet_status, creator_id, pay_status },
    } = DetailStore

    return [
      {
        label: t('????????????'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: t('???????????????'),
        item: <SupplierName type={type} />,
      },

      {
        label: t('????????????'),
        item: <StockInTime type={type} />,
      },
      {
        label: t('???????????????'),
        item: STOCK_IN_RECEIPT_STATUS_NAME[sheet_status] ?? null,
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      // ??????hide??????????????????????????????style??????
      {
        label: t('?????????'),
        item: <PurchaserName type={type} />,
        hide: globalStore.isLite,
      },
      {
        label: t('??????????????????'),
        item: <PalnInTime type={type} />,
        hide: globalStore.isLite,
      },
      {
        label: t('????????????'),
        item: handlePayStatus(pay_status!).name,
        hide: globalStore.isLite,
      },
      {
        label: t('?????????'),
        item: (
          <>
            {(() => {
              const creator = getAdditionInfo<GroupUser>(
                'group_users',
                creator_id!,
              )
              return <>{getUnNillText(creator?.name)}</>
            })()}
          </>
        ),
        hide: globalStore.isLite,
      },
      {
        label: t('??????'),
        item: <StockInRemark type={type} />,
        hide: globalStore.isLite,
      },
    ]
  }

  const renderTotalData = () => {
    const { totalDiscount, receiptDetail } = DetailStore

    return [
      {
        text: t('????????????'),
        value: (
          <Price
            value={
              +receiptDetail?.amount_tax_discount! ||
              +receiptDetail?.amount! ||
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
            value={+receiptDetail?.amount_tax! || +receiptDetail?.amount! || 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
      !globalStore.isLite && {
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
      contentLabelWidth={110}
      contentCol={9}
      customerContentColWidth={[260, 300, 260, 300, 260, 260, 260, 260, 400]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
