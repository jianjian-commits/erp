import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'

import { t } from 'gm-i18n'
import moment from 'moment'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  Input,
  Flex,
  Modal,
  RightSideModal,
} from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { history } from '@/common/service'
import {
  getFormatTimeForTable,
  getDateByTimestamp,
  getTimestamp,
  openNewTab,
  getUnNillText,
} from '@/common/util'
import globalStore from '@/stores/global'

import IsInvented from '@/pages/sales_invoicing/components/isInvented'
import {
  RECEIPT_STATUS_TAG,
  STOCK_IN_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import {
  getMinStockTime,
  getReceiptActionableList,
} from '@/pages//sales_invoicing/util'

import store from '../stores/detail_store'
import sale_store from '../../../store'

import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import _ from 'lodash'
import { PrintModal } from '@/pages/sales_invoicing/components'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface ActionProps {
  type: 'add' | 'detail'
}
// 操作
const HeaderAction: FC<ActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id, sheet_type } = store.receiptDetail

  const isAdd = props.type === 'add'

  const currentActionList = getReceiptActionableList(sheet_status, 'purchaseIn')

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
                sheet_ids: [stock_sheet_id],
                stock_sheet_type: sheet_type,
              })
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
  const handleSubmit = () => {
    if (stock_sheet_id) {
      store.updateAndGetReceipt('submitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('submitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/other_stock/stock_in/detail?sheet_id=${
              json.response.stock_sheet!.stock_sheet_id
            }`,
          )
          return null
        })
        .catch(() => {
          store.changeReceiptLoading(false)
        })
    }
  }
  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
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
            `/sales_invoicing/other_stock/stock_in/detail?sheet_id=${
              json.response.stock_sheet!.stock_sheet_id
            }`,
          )
          return null
        })
        .catch(() => {
          store.changeReceiptLoading(false)
        })
    }
  }

  const handleNotApproved = () => {
    return store.updateAndGetReceipt('notApproved')
  }
  const handleCancelApproved = () => {
    return store.updateAndGetReceipt('cancelApproval')
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
  const canCancelApproval =
    currentActionList.includes('cancelApproval') && !isAdd
  const { receiptLoading } = store
  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_OTHER_IN}
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
          permission={Permission.PERMISSION_INVENTORY_APPROVE_OTHER_IN}
        >
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleApproved}
            disabled={receiptLoading}
          >
            {t('审核入库')}
          </Button>
        </PermissionJudge>
      )}
      {sheet_status === -1 && currentActionList.includes('toBeSubmitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_UPDATE_OTHER_IN}
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
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_OTHER_IN,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_OTHER_IN,
              ) && {
                text: t('反审核'),
                onClick: handleCancelApproved,
                show: canCancelApproval,
              },
              {
                text: t('打印单据'),
                onClick: handlePrint,
                show: currentActionList.includes('print'),
              },
              // {
              //   text: t('导出单据'),
              //   onClick: () => {},
              //   show: currentActionList.includes('export'),
              // },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_OTHER_OUT,
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

interface WarehouseProps {
  type: 'add' | 'detail'
}

const WarehouseName: FC<WarehouseProps> = observer((props) => {
  const { type } = props
  const { warehouse_id, warehouse_name } = store.receiptDetail

  const isAdd = type === 'add'

  return isAdd ? (
    <Select_Warehouse
      value={warehouse_id}
      style={{
        maxWidth: '160px',
      }}
      onChange={(selected) => {
        store.resetProductShelf()
        store.changeReceiptDetail('warehouse_id', selected)
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

// 入库时间
interface TimeProps {
  type: 'add' | 'detail'
}
const StockInTime: FC<TimeProps> = observer((props) => {
  const { submit_time } = store.receiptDetail
  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const isAdd = props.type === 'add'

  const handleChangeDate = (selected: Date) => {
    store.changeReceiptDetail('submit_time', getTimestamp(selected))
  }

  return (
    <>
      {isAdd ? (
        <DatePicker
          date={getDateByTimestamp(submit_time)}
          onChange={handleChangeDate}
          enabledTimeSelect
          style={{ width: '150px' }}
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
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time)}
        </div>
      )}
    </>
  )
})

// 备注
interface RemarkProps {
  type: 'add' | 'detail'
}
const StockInRemark: FC<RemarkProps> = observer((props) => {
  const { remark } = store.receiptDetail
  const isAdd = props.type === 'add'

  const handleListRemarkChange = (value: string) => {
    store.changeReceiptDetail('remark', value)
  }

  return isAdd ? (
    <Input
      type='text'
      value={remark}
      className='form-control'
      maxLength={50}
      style={{ width: '400px' }}
      onChange={(e) => handleListRemarkChange(e.target.value)}
    />
  ) : (
    <div className='b-stock-in-content'>{remark}</div>
  )
})

// 全部信息
interface HeaderDetailProps {
  type: 'add' | 'detail'
}
const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props
  const { stock_sheet_serial_no, status } = store.receiptDetail
  const renderHeaderInfo = () => {
    return [
      {
        label: t('其他入库单号'),
        item: (
          <Flex alignCenter>
            <div>{stock_sheet_serial_no || '-'}</div>
            <IsInvented status={status!} />
          </Flex>
        ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { sheet_status, creator_name, create_time } = store.receiptDetail
    return [
      {
        label: t('选择仓库'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: t('建单时间'),
        item: create_time
          ? moment(parseInt(create_time)).format('YYYY-MM-DD HH:mm')
          : '-',
      },
      {
        label: t('入库时间'),
        item: <StockInTime type={type} />,
      },
      {
        label: t('入库单状态'),
        item: STOCK_IN_RECEIPT_STATUS_NAME[sheet_status],
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      {
        label: t('备注'),
        item: <StockInRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { skuMoney } = store
    return [
      {
        text: t('入库金额'),
        value: (
          <Price
            value={skuMoney ?? 0}
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
      contentCol={5}
      customerContentColWidth={[260, 260, 260, 260, 490]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
