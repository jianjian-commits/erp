import React, { FC } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Button, Price, Flex, Input, FunctionSet } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'

import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { getReceiptActionableList } from '@/pages/sales_invoicing/util'
import { TRANSFER_TYPE } from '@/pages/sales_invoicing/enum'

import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import {
  getEnumText,
  getUnNillText,
  toFixedSalesInvoicing,
} from '@/common/util'

interface HeaderActionProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderActionProps> = observer((props) => {
  const { sheet_status, stock_sheet_id } = store.receiptDetail
  const isAdd = props.type === 'add'

  const currentActionList = getReceiptActionableList(sheet_status)

  const handleSaveDraft = () => {
    // 调拨出入库单是自动生成的
    if (stock_sheet_id) {
      store.updateAndGetReceipt('toBeSubmitted')
    }
  }

  const handleSubmit = () => {
    // 调拨出入库单是自动生成的
    if (stock_sheet_id) {
      store.updateAndGetReceipt('submitted')
    }
  }

  // 审核入库
  const handleApproved = () => {
    store.updateAndGetReceipt('approved')
  }
  // 审核驳回
  const handleNotApproved = () => {
    return store.updateAndGetReceipt('notApproved')
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
          {t('审核入库')}
        </Button>
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
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_PURCHASE_IN_SHEET,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
            ],
            false,
          )}
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
  const { canEdit } = store

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    store.changeReceiptDetail('remark', value)
  }

  return canEdit ? (
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

interface HeaderDetailProps {
  type: 'add' | 'detail'
}

const HeaderDetail: FC<HeaderDetailProps> = observer((props) => {
  const { type } = props
  const { getRelationInfo } = store

  const renderHeaderInfo = () => {
    const {
      stock_sheet_serial_no,
      out_warehouse_id,
      in_warehouse_id,
      duty_warehouse_id,
    } = store.receiptDetail
    return [
      {
        label: t('调拨入库单号'),
        item: (
          <Flex alignCenter>
            <div>{stock_sheet_serial_no || '-'}</div>
          </Flex>
        ),
      },
      {
        label: t('调出仓库'),
        item: (
          <div>
            {getRelationInfo('warehouses', out_warehouse_id).name ?? '-'}
          </div>
        ),
      },
      {
        label: t('调入仓库'),
        item: (
          <div>
            {getRelationInfo('warehouses', in_warehouse_id).name ?? '-'}
          </div>
        ),
      },
      // {
      //   label: t('责任仓'),
      //   item: getRelationInfo('warehouses', duty_warehouse_id).name ?? '-',
      // },
    ]
  }

  const renderContentInfo = () => {
    const {
      creator_id,
      submitter_id,
      warehouse_transfer_amount,
      warehuose_transfer_type,
    } = store.receiptDetail
    return [
      {
        label: t('调拨类型'),
        item: <div>{getEnumText(TRANSFER_TYPE, warehuose_transfer_type)}</div>,
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
        label: t('调拨费用'),
        item:
          (warehouse_transfer_amount
            ? getUnNillText(
                toFixedSalesInvoicing(Number(warehouse_transfer_amount)),
              )
            : '-') + Price.getUnit(),
      },
      {
        label: t('备注'),
        item: <StockInRemark type='add' />,
      },
    ]
  }

  const renderTotalData = () => {
    const { total_price_no_tax } = store.receiptDetail

    return [
      {
        text: t('入库成本'),
        value: (
          <Price
            value={total_price_no_tax ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentCol={5}
      customerContentColWidth={[300, 300, 300, 300, 500]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
