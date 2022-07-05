import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Button, Price, Flex, FunctionSet, Input } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { getReceiptActionableList } from '@/pages/sales_invoicing/util'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import _ from 'lodash'
import { Big } from 'big.js'
import { toFixedByType } from '@/common/util'
import { TRANSFER_TYPE } from '@/pages/sales_invoicing/enum'

interface HeaderActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id } = store.receiptDetail
  const isAdd = props.type === 'add'
  const currentActionList =
    getReceiptActionableList(sheet_status, 'allocationInventory') || []

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
            `/sales_invoicing/allocation_inventory/allocation_stock_out/detail?sheet_id=${
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

  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
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
          {t('审核出库')}
        </Button>
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
            ],
            // false,
          )}
        />
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
      style={{ width: '300px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '300px' }} className='b-stock-in-content'>
      {remark}
    </div>
  )
})
interface HeaderDetailProps {
  type: 'add' | 'detail'
}

const HeaderDetail: FC<HeaderDetailProps> = observer(({ type }) => {
  const renderHeaderInfo = () => {
    const {
      stock_sheet_serial_no,
      out_warehouse_id,
      in_warehouse_id,
      duty_warehouse_id,
      creator_name,
      submitter_id,
    } = store.receiptDetail
    const { warehouses, group_users } = store

    return [
      {
        label: t('调拨出库单号'),
        item: (
          <Flex alignCenter>
            <div>{stock_sheet_serial_no || '-'}</div>
          </Flex>
        ),
      },
      {
        label: t('调出仓库'),
        item: <div>{warehouses?.[out_warehouse_id!]?.name ?? '-'}</div>,
      },
      {
        label: t('调入仓库'),
        item: <div>{warehouses?.[in_warehouse_id!]?.name ?? '-'}</div>,
      },
      {
        label: t('建单人'),
        item: creator_name ?? '-',
      },
      {
        label: t('提交人'),
        item: group_users?.[submitter_id]?.name ?? '-',
      },
      // {
      //   label: t('责任仓'),
      //   item: <div>{warehouses?.[duty_warehouse_id!]?.name ?? '-'}</div>,
      // },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { warehuose_transfer_type, warehouse_transfer_amount } =
      store.receiptDetail

    // const { group_users } = store
    return [
      {
        label: t('调拨类型'),
        item: (
          <div>
            {TRANSFER_TYPE.find((x) => x.value === warehuose_transfer_type)
              ?.text ?? '-'}
          </div>
        ),
      },
      {
        label: t('调拨费用'),
        item: warehouse_transfer_amount
          ? toFixedByType(Big(warehouse_transfer_amount), 'order') +
            Price.getUnit()
          : '-',
      },
      {
        label: t('备注'),
        item: <StockOutRemark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    const { totalPrice } = store

    return [
      {
        text: t('出库成本'),
        value: (
          <Price
            value={totalPrice ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentBlockWidth={260}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
