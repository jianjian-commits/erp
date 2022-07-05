import * as React from 'react'
import { useRef, FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  MoreSelect,
  Select,
  Input,
  MoreSelectDataItem,
  Modal,
  Flex,
  RightSideModal,
} from '@gm-pc/react'

import { Select_Warehouse } from 'gm_api/src/inventory/pc'
import { Permission } from 'gm_api/src/enterprise'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'

import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import PermissionJudge from '@/common/components/permission_judge'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
  openNewTab,
  getUnNillText,
} from '@/common/util'
import { history } from '@/common/service'

import {
  getMinStockTime,
  getReceiptActionableList,
} from '@/pages/sales_invoicing/util'
import { PrintModal } from '@/pages/sales_invoicing/components'

import {
  RECEIPT_STATUS_TAG,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '../../../enum'

import globalStore from '@/stores/global'
import sale_store from '../../../store'
import { DetailStore } from '../stores/index'

interface HeaderProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderProps> = observer((props) => {
  const { sheet_status, sale_out_stock_sheet_id, sheet_type } =
    DetailStore.receiptDetail

  const isAdd = props.type === 'add'

  const currentActionList = getReceiptActionableList(sheet_status, 'saleOut')

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
            name='sales_stock_out_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify({
                sheet_ids: [sale_out_stock_sheet_id],
                stock_sheet_type: sheet_type,
                with_details: true,
              })
              openNewTab(
                `#system/template/print_template/stock_out_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}&type=sale_out`,
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
                return DetailStore.updateAndGetReceipt('deleted').then(() => {
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
    if (sale_out_stock_sheet_id) {
      DetailStore.updateAndGetReceipt('toBeSubmitted')
    } else {
      DetailStore.changeReceiptLoading(true)
      DetailStore.createReceipt('toBeSubmitted')
        .then((json) => {
          DetailStore.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/sales/stock_out/detail?sheet_id=${json.response.stock_sheet?.sale_out_stock_sheet_id}`,
          )
          return json
        })
        .catch(() => {
          DetailStore.changeReceiptLoading(false)
        })
    }
  }

  /** 提交 */
  const handleSubmit = () => {
    if (sale_out_stock_sheet_id) {
      DetailStore.updateAndGetReceipt('submitted')
    } else {
      DetailStore.changeReceiptLoading(true)
      /** 创建销售出库单据 */
      DetailStore.createReceipt('submitted')
        .then((json) => {
          DetailStore.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/sales/stock_out/detail?sheet_id=${json.response.stock_sheet?.sale_out_stock_sheet_id}`,
          )
          return json
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

  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_SALE_OUT_SHEET}
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
          permission={Permission.PERMISSION_INVENTORY_APPROVE_SALE_OUT_SHEET}
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
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_UPDATE_SALE_OUT_SHEET}
        >
          <div className='gm-gap-10' />
          <Button
            plain
            className='gm-margin-right-5'
            onClick={handleSaveDraft}
            disabled={receiptLoading}
          >
            {t('保存草稿')}
          </Button>
        </PermissionJudge>
      )}

      {sheet_status !== -1 && (
        <FunctionSet
          right
          data={_.without(
            [
              {
                text: t('保存草稿'),
                onClick: handleSaveDraft,
                show: currentActionList.includes('toBeSubmitted'),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_SALE_OUT_SHEET,
              ) && {
                text: t('反审核'),
                onClick: handleCancelApproved,
                show:
                  currentActionList.includes('cancelApproval') &&
                  !isAdd &&
                  !globalStore.isLite,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_SALE_OUT_SHEET,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              {
                text: t('打印单据'),
                onClick: handlePrint,
                show:
                  currentActionList.includes('print') && !globalStore.isLite,
              },
              // {
              //   text: t('导出单据'),
              //   onClick: handleExport,
              //   show: currentActionList.includes('export'),
              // },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_SALE_OUT_SHEET,
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

/** 选择仓库 */
const WarehouseName: FC<HeaderProps> = observer((props) => {
  const { type } = props
  const { warehouse_id, warehouse_name } = DetailStore.receiptDetail

  const isAdd = type === 'add'

  return isAdd ? (
    <Select_Warehouse
      style={{
        maxWidth: '160px',
      }}
      value={warehouse_id}
      onChange={(selected) => {
        DetailStore.changeReceiptDetail('warehouse_id', selected)
        DetailStore.clearProductList()
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

/** 出库时间 */
const StockOutTime: FC<HeaderProps> = observer((props) => {
  const { out_stock_time } = DetailStore.receiptDetail
  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const isAdd = props.type === 'add'

  const handleChangeDate = (selected: Date | null) => {
    DetailStore.changeReceiptDetail('out_stock_time', getTimestamp(selected))
    // DetailStore.changeReceiptDetail('estimated_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={getDateByTimestamp(out_stock_time)}
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
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', out_stock_time)}
        </div>
      )}
    </>
  )
})

/** 收货时间 */
const PalnTime: FC<HeaderProps> = observer((props) => {
  // 关联订单的编号 order_serial_no
  const { estimated_time, order_serial_no } = DetailStore.receiptDetail

  const isAdd = props.type === 'add'

  const handleChangeDate = (selected: Date | null) => {
    DetailStore.changeReceiptDetail('estimated_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd && !order_serial_no ? (
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

const StockOutRemark: FC<HeaderProps> = observer(({ type }) => {
  // 确保在最后一行
  const { remark } = DetailStore.receiptDetail

  const isAdd = type === 'add'

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    DetailStore.changeReceiptDetail('remark', value)
  }

  return isAdd ? (
    <Input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={50}
      style={{ width: '500px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '500px' }} className='b-stock-in-content'>
      {remark}
    </div>
  )
})

/** 自定义客户名 customer_name */
const TargetName: FC<HeaderProps> = observer((props) => {
  const { receiptDetail, customerList } = DetailStore
  // order_id 关联订单 id , 取代 related_sheet_id
  const { customer_id, customer_name, out_stock_target_type, order_id } =
    receiptDetail
  const { type } = props
  const targetRef = useRef<MoreSelect>(null)

  const isAdd = type === 'add'

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    DetailStore.changeReceiptDetail('customer_id', selected.value)
    DetailStore.changeReceiptDetail('customer_name', selected.text)
    DetailStore.changeTargetIdParent(selected.parent_id)
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

  let selected
  if (customer_id) {
    selected = { value: customer_id, text: customer_name! }
  }

  if (!isAdd || order_id !== '0') return <div>{customer_name}</div>
  // 销售出库客户类型判断
  return out_stock_target_type === 1 ? (
    <MoreSelect
      ref={targetRef}
      style={{ width: '100%' }}
      disabledClose
      placeholder={t('请选择出库客户')}
      selected={selected}
      data={customerList.slice()}
      onKeyDown={handleKeyDown}
      onSelect={handleSelect}
    />
  ) : (
    <Input
      className='form-control'
      value={customer_name ?? ''}
      placeholder={t('请输入自定义客户名')}
      onChange={(event) => {
        DetailStore.changeReceiptDetail('customer_name', event.target.value)
      }}
    />
  )
})

/** 销售出库客户类型 */
const OutStockTargetType: FC<HeaderProps> = observer((props) => {
  const { type } = props
  const { out_stock_target_type, order_id, customer_name } =
    DetailStore.receiptDetail

  const handleSelect = (value: any) => {
    // DetailStore.changeReceiptDetail('target_type', value)
    // 客户类型: 客户列表| 自定义客户
    DetailStore.changeReceiptDetail('out_stock_target_type', value)
    DetailStore.changeReceiptDetail('customer_id', '0')
    DetailStore.changeReceiptDetail('customer_name', '')
    DetailStore.changeTargetIdParent('')

    if (customer_name) {
      DetailStore.clearProductList()
    }
  }

  if (type !== 'add') return <div>{t('客户信息')}</div>
  return (
    <Select
      onChange={handleSelect}
      data={[
        { value: 1, text: t('客户列表') },
        { value: 2, text: t('自定义客户') },
      ]}
      value={out_stock_target_type}
      // 关联订单的ID 不等于 0
      disabled={order_id !== '0'}
    />
  )
})

const HeaderDetail: FC<HeaderProps> = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    // 单据的编号
    const { sale_out_stock_sheet_serial_no, order_serial_no } =
      DetailStore.receiptDetail
    return [
      {
        label: t('销售出库单号'),
        item: (
          <div style={{ width: '280px' }}>
            {sale_out_stock_sheet_serial_no || '-'}
          </div>
        ),
      },
      {
        label: t('关联订单号'),
        item: <div style={{ width: '280px' }}>{order_serial_no || '-'}</div>,
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { sheet_status, creator_name, create_time } =
      DetailStore.receiptDetail

    return [
      {
        label: t('选择仓库'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: <OutStockTargetType type={type} />,
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
        label: t('收货时间'),
        item: <PalnTime type={type} />,
      },
      {
        label: t('单据状态'),
        item: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status],
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      {
        label: t('单据备注'),
        item: <StockOutRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { totalPrice } = DetailStore

    return [
      {
        text: t('出库成本'),
        value: (
          <Price
            value={totalPrice ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentCol={7}
      customerContentColWidth={[260, 280, 260, 260, 260, 260, 490]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
