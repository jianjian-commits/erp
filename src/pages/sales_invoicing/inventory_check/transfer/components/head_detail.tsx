import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Button,
  Flex,
  Modal,
  FunctionSet,
  Input,
  RightSideModal,
} from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { history } from '@/common/service'

import {
  getReceiptActionableList,
  formatSecond,
} from '@/pages/sales_invoicing/util'
import {
  RECEIPT_STATUS_TAG,
  STOCK_TRANSFER_RECEIPT_STATUS_NAME,
} from '@/pages/sales_invoicing/enum'
import store from '../stores/detail_store'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { PrintModal } from '@/pages/sales_invoicing/components'
import { openNewTab, getUnNillText } from '@/common/util'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface ActionProps {
  type: 'add' | 'detail'
}
// 操作
const HeaderAction: FC<ActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id, sheet_type } = store.receiptDetail

  const isAdd = props.type === 'add'

  const currentActionList = getReceiptActionableList(sheet_status, 'saleOut')
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
            `/sales_invoicing/inventory_check/transfer/detail?sheet_id=${
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
            `/sales_invoicing/inventory_check/transfer/detail?sheet_id=${
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

  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
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
      type: PrintingTemplate_Type.TYPE_TRANSFER,
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
                `#system/template/print_template/cannibalize_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
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

  const canCancelApproval =
    currentActionList.includes('cancelApproval') && !isAdd
  const { receiptLoading } = store
  return (
    <>
      <>
        {currentActionList.includes('submitted') && (
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_SUBMIT_INVENTORY_SHEET}
          >
            <Button
              type='primary'
              className='gm-margin-right-5'
              onClick={handleSubmit}
              disabled={receiptLoading}
            >
              {t('提交移库单')}
            </Button>
          </PermissionJudge>
        )}
        {currentActionList.includes('approved') && (
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_APPROVE_INVENTORY_SHEET}
          >
            <Button
              type='primary'
              className='gm-margin-right-5'
              onClick={handleApproved}
              disabled={receiptLoading}
            >
              {t('审核移库')}
            </Button>
          </PermissionJudge>
        )}
        {sheet_status === -1 && currentActionList.includes('toBeSubmitted') && (
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_UPDATE_INVENTORY_SHEET}
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
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_INVENTORY_SHEET,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              // globalStore.hasPermission(
              //   Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_OTHER_IN,
              // ) && {
              //   text: t('反审核'),
              //   onClick: handleCancelApproved,
              //   show: currentActionList.includes('cancelApproval') && !isAdd,
              // },
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
                Permission.PERMISSION_INVENTORY_DELETE_INVENTORY_SHEET,
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

// 备注
interface RemarkProps {
  type: 'add' | 'detail'
}
const StockInRemark: FC<RemarkProps> = observer((props) => {
  const { remark } = store.receiptDetail
  const isAdd = props.type === 'add'

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
    <div className='b-stock-in-content'>{remark}</div>
  )
})

interface WarehouseProps {
  type: 'add' | 'detail'
}

const WarehouseName: FC<WarehouseProps> = observer((props) => {
  const { type } = props
  const { warehouse_id, warehouse_name } = store.receiptDetail
  console.log('warehouse_name', warehouse_name, warehouse_id)

  const isAdd = type === 'add'

  return isAdd ? (
    <Select_Warehouse
      value={warehouse_id}
      style={{
        maxWidth: '160px',
      }}
      onChange={(selected) => {
        store.changeReceiptDetail('warehouse_id', selected)
        store.resetProductShelf()
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

// 全部信息
interface HeaderDetailProps {
  type: 'add' | 'detail'
}
const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props

  const renderHeaderInfo = () => {
    const { stock_sheet_serial_no } = store.receiptDetail
    return [
      {
        label: t('移库单号'),
        item: (
          <div style={{ width: '280px' }}>{stock_sheet_serial_no || '-'}</div>
        ),
      },
      globalStore.isOpenMultWarehouse && {
        label: t('选择仓库'),
        item: <WarehouseName type={type} />,
        required: true,
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { sheet_status, creator_name, create_time } = store.receiptDetail
    return [
      {
        label: t('建单时间'),
        item: create_time ? formatSecond(create_time!) : '-',
      },
      {
        label: t('单据状态'),
        item: STOCK_TRANSFER_RECEIPT_STATUS_NAME[sheet_status],
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      {
        label: t('单据备注'),
        item: <StockInRemark type={type} />,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={95}
      customerContentColWidth={[260, 260, 260, 490]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
    />
  )
})

export default HeaderDetail
