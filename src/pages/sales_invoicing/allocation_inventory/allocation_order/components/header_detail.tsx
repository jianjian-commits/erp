import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Price,
  Flex,
  Input,
  Select,
  FunctionSet,
  Modal,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { getReceiptActionableList } from '@/pages/sales_invoicing/util'
import { getFormatTimeForTable } from '@/common/util'
import { history } from '@/common/service'
import { TRANSFER_TYPE } from '@/pages/sales_invoicing/enum'

import globalStore from '@/stores/global'
import store, { InitReceiptDetailProps } from './../stores/receipt_store'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'

interface HeaderActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderActionProps> = observer(({ type }) => {
  const isAdd = type === 'add'
  const { status, warehouse_transfer_sheet_id } = store.receiptDetail

  const currentActionList = getReceiptActionableList(status) || []
  // 保存草稿
  const handleSaveDraft = () => {
    if (warehouse_transfer_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('toBeSubmitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/allocation_inventory/allocation_order/detail?sheet_id=${json.response.warehouse_transfer_sheet?.warehouse_transfer_sheet_id}`,
          )
          return null
        })
        .finally(() => {
          store.changeReceiptLoading(false)
        })
    }
  }
  // 提交
  const handleSubmit = () => {
    if (warehouse_transfer_sheet_id) {
      store.updateAndGetReceipt('submitted')
    } else {
      store.changeReceiptLoading(true)
      store
        .createReceipt('submitted')
        .then((json) => {
          store.changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/allocation_inventory/allocation_order/detail?sheet_id=${json.response.warehouse_transfer_sheet?.warehouse_transfer_sheet_id}`,
          )
        })
        .finally(() => {
          store.changeReceiptLoading(false)
        })
    }
  }

  // 删除单据
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
                store.updateAndGetReceipt('deleted').finally(() => {
                  Modal.hide()
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
  // 审核入库
  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
  }

  // 驳回单据
  const handleNotApproved = () => {
    store.updateAndGetReceipt('notApproved')
  }

  const { receiptLoading } = store
  return (
    <>
      {currentActionList.includes('submitted') && (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleSubmit}
          disabled={receiptLoading}
        >
          {t('提交')}
        </Button>
      )}
      {currentActionList.includes('approved') && (
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={handleApproved}
          disabled={receiptLoading}
        >
          {t('审核通过')}
        </Button>
      )}
      {status === -1 && currentActionList.includes('toBeSubmitted') && (
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
      {status !== -1 && (
        <FunctionSet
          right
          data={_.without([
            {
              text: t('保存草稿'),
              onClick: handleSaveDraft,
              show: currentActionList.includes('toBeSubmitted'),
            },
            {
              text: t('驳回'),
              onClick: handleNotApproved,
              show: currentActionList.includes('notApproved') && !isAdd,
            },
            {
              text: t('删除单据'),
              onClick: handleDelete,
              show: currentActionList.includes('deleted'),
            },
          ])}
        />
      )}
    </>
  )
})

interface RemarkProps {
  type: 'add' | 'detail'
}

const StockInRemark: FC<RemarkProps> = observer(({ type }) => {
  // 确保在最后一行
  const { remark } = store.receiptDetail
  const { updateReceiptDetail } = store

  const isAdd = type === 'add'

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    updateReceiptDetail('remark', value)
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
  const { updateReceiptDetail, getRelationInfo } = store
  const {
    out_warehouse_id,
    in_warehouse_id,
    serial_no,
    type: transferType,
    submit_time,
    creator_id = '',
    submitter_id = '',
    create_time,
  } = store.receiptDetail

  // 更新基本receiptDetails的info
  const handleUpdateReceipt = (
    type: keyof InitReceiptDetailProps,
    value: number | string,
  ) => {
    updateReceiptDetail(type, value)
  }

  const renderHeaderInfo = () => {
    return [
      {
        label: t('调拨单号'),
        item: (
          <Flex alignCenter>
            <div>{serial_no || '-'}</div>
          </Flex>
        ),
      },
      {
        label: t('调出仓库'),
        item:
          type === 'add' ? (
            <Select_Warehouse
              style={{ width: '150px' }}
              value={out_warehouse_id}
              params={{
                all: false,
              }}
              placeholder={t('请选择调出仓库')}
              onChange={(value) => {
                handleUpdateReceipt('out_warehouse_id', value)
                // 同时更新商品的当前库存
                store.batchUpdateStock()
              }}
            />
          ) : (
            <div>
              {getRelationInfo('warehouses', out_warehouse_id).name ?? '-'}
            </div>
          ),
      },
      {
        label: t('调入仓库'),
        item:
          type === 'add' ? (
            <Select_Warehouse
              style={{ width: '150px' }}
              value={in_warehouse_id}
              params={{
                all: true,
              }}
              placeholder={t('请选择调入仓库')}
              onChange={(value) =>
                handleUpdateReceipt('in_warehouse_id', value)
              }
            />
          ) : (
            <div>
              {getRelationInfo('warehouses', in_warehouse_id).name ?? '-'}
            </div>
          ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    return [
      {
        label: t('调拨类型'),
        item:
          type === 'add' ? (
            <Select
              style={{ width: '150px' }}
              value={transferType}
              data={TRANSFER_TYPE.filter((x) => x.value !== 0)}
              onChange={(value) => handleUpdateReceipt('type', value)}
            />
          ) : (
            <div>
              {TRANSFER_TYPE.find((x) => x.value === transferType)?.text ?? '-'}
            </div>
          ),
      },
      {
        label: t('建单人'),
        item: getRelationInfo('group_users', creator_id)?.name || '-',
      },
      {
        label: t('提交人'),
        item: getRelationInfo('group_users', submitter_id)?.name || '-',
      },
      {
        label: t('建单时间'),
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time),
      },
      {
        label: t('审核时间'),
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', submit_time),
      },
      {
        label: t('备注'),
        item: <StockInRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { out_stock_amount, in_stock_amount } = store.receiptDetail

    return [
      {
        text: t('出库成本'),
        value: (
          <Price
            value={out_stock_amount ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
      },
      {
        text: t('入库成本'),
        value: (
          <Price
            value={in_stock_amount ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentCol={6}
      customerContentColWidth={[260, 260, 260, 260, 260, 400]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
