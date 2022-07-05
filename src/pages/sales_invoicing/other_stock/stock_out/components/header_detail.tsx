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
  Confirm,
} from '@gm-pc/react'
import {
  getFormatTimeForTable,
  getDateByTimestamp,
  getTimestamp,
  openNewTab,
  getUnNillText,
} from '@/common/util'
import { history } from '@/common/service'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import globalStore from '@/stores/global'
import sale_store from '../../../store'

import {
  getMinStockTime,
  getReceiptActionableList,
} from '@/pages/sales_invoicing/util'
import {
  RECEIPT_STATUS_TAG,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import store from '../stores/detail_store'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import _ from 'lodash'
import { PrintModal } from '@/pages/sales_invoicing/components'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { ReceiptStatusKey } from '@/pages/sales_invoicing/interface'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface ActionProps {
  type: 'add' | 'detail'
}

// 操作
const HeaderAction: FC<ActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id, sheet_type } = store.receiptDetail

  const isAdd = props.type === 'add'

  const currentActionList = getReceiptActionableList(sheet_status, 'saleOut')

  const handleSaveDraft = () => {
    // let isUseAutoBatch
    // store.receiptDetail.details.forEach((item) => {
    //   if (item.batch_selected.length === 0) {
    //     isUseAutoBatch = true
    //   }
    // })
    // if (isUseAutoBatch) {
    //   OpenAutoBatchModal('toBeSubmitted')
    //   return
    // }
    if (stock_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('toBeSubmitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/other_stock/stock_out/detail?sheet_id=${json.response.stock_sheet?.stock_sheet_id}`,
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

  const handleSubmit = () => {
    // let isUseAutoBatch
    // store.receiptDetail.details.forEach((item) => {
    //   if (item.batch_selected.length === 0) {
    //     isUseAutoBatch = true
    //   }
    // })
    // if (isUseAutoBatch) {
    //   OpenAutoBatchModal('submitted')
    //   return
    // }

    if (stock_sheet_id) {
      store.updateAndGetReceipt('submitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('submitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          console.log('json', json)
          history.push(
            `/sales_invoicing/other_stock/stock_out/detail?sheet_id=${json.response.stock_sheet?.stock_sheet_id}`,
          )
          return null
        })
        .catch(() => {
          store.changeReceiptLoading(false)
        })
    }
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
      onHide: Modal.hide,
    })
  }

  const handleNotApproved = () => {
    store.updateAndGetReceipt('notApproved')
  }

  const handleCancelApproved = () => {
    return store.updateAndGetReceipt('cancelApproval')
  }
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
            name='other_stock_out_print'
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
  const { receiptLoading } = store
  return (
    <>
      <>
        {currentActionList.includes('submitted') && (
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_SUBMIT_OTHER_OUT}
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
            permission={Permission.PERMISSION_INVENTORY_APPROVE_OTHER_OUT}
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
            permission={Permission.PERMISSION_INVENTORY_UPDATE_OTHER_OUT}
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
      </>
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
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_OTHER_OUT,
              ) && {
                text: t('反审核'),
                onClick: handleCancelApproved,
                show: currentActionList.includes('cancelApproval') && !isAdd,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_OTHER_OUT,
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
        store.changeReceiptDetail('warehouse_id', selected)
        store.clearProductList()
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

// 出库时间
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
  const { stock_sheet_serial_no } = store.receiptDetail
  const renderHeaderInfo = () => {
    return [
      {
        label: t('其他出库单号'),
        item: (
          <div style={{ width: '280px' }}>{stock_sheet_serial_no || '-'}</div>
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
        label: t('出库时间'),
        item: <StockInTime type={type} />,
      },
      {
        label: t('出库单状态'),
        item: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status],
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
        text: t('出库成本'),
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
