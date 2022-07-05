import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  Flex,
  Input,
  Modal,
  Confirm,
  RightSideModal,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import sale_store from '../../../store'
import moment from 'moment'
import _ from 'lodash'
import { ExclamationCircleOutlined } from '@ant-design/icons'

import IsInvented from '@/pages/sales_invoicing/components/isInvented'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { RECEIPT_STATUS_TAG, STOCK_IN_RECEIPT_STATUS_NAME } from '../../../enum'
import {
  getMinStockTime,
  getReceiptActionableList,
} from '@/pages/sales_invoicing/util'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
  openNewTab,
  getUnNillText,
} from '@/common/util'
import { history } from '@/common/service'

import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { PrintModal } from '@/pages/sales_invoicing/components'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface HeaderActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderActionProps> = observer((props) => {
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

  // const handleExport = () => {
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
            `/sales_invoicing/produce/produce_stock_in/detail?sheet_id=${
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
            `/sales_invoicing/produce/produce_stock_in/detail?sheet_id=${
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

  const handleCancelApproved = () => {
    return store.updateAndGetReceipt('cancelApproval')
  }
  const handleApproved = () => {
    return store.updateAndGetReceipt('approved')
  }
  const canCancelApproval =
    currentActionList.includes('cancelApproval') && !isAdd
  const { receiptLoading } = store

  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_PRODUCT_IN}
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
          permission={Permission.PERMISSION_INVENTORY_APPROVE_PRODUCT_IN}
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
          permission={Permission.PERMISSION_INVENTORY_UPDATE_PRODUCT_IN}
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
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_PRODUCT_IN,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_PRODUCT_IN,
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
              //   onClick: handleExport,
              //   show: currentActionList.includes('export'),
              // },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_PRODUCT_IN,
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
        // if (warehouse_id) {
        //   // 修改仓库要重置所有商品
        //   Confirm({
        //     children: '切换仓储会清空当前商品，请谨慎选择',
        //     title: '提示',
        //     size: 'sm',
        //   }).then(async () => {
        //     store.resetShelf()
        //     store.changeReceiptDetail('warehouse_id', selected)
        //     return null
        //   })
        // } else {
        // }
        store.changeReceiptDetail('warehouse_id', selected)
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

interface RemarkProps {
  type: 'add' | 'detail'
}

const StockInRemark: FC<RemarkProps> = observer(({ type }) => {
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
      style={{ width: '400px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '400px' }} className='b-stock-in-content'>
      {remark}
    </div>
  )
})

interface HeaderDetailProps {
  type: 'add' | 'detail'
}

const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    const { stock_sheet_serial_no, status } = store.receiptDetail
    return [
      {
        label: t('生产入库单号'),
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
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time),
      },
      {
        label: t('入库时间'),
        item: <StockInTime type={type} />,
      },
      {
        label: t('单据状态'),
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
    const { totalPrice } = store

    return [
      {
        text: t('入库金额'),
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
      contentLabelWidth={100}
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
