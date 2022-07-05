import * as React from 'react'
import { Confirm } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { history } from '@/common/service'

/** 未选择批次, 不同出库进来的 type */
type BatchType = 'sale' | 'material'

const AutoBatchModal = (store: any, url: string, type?: BatchType) => {
  const {
    updateAndGetReceipt,
    changeReceiptLoading,
    createReceipt,
    receiptDetail,
  } = store
  return Confirm({
    title: t('提示'),
    children: <div>{t('部分商品未选择出库批次, 是否自动匹配批次')}</div>,
  }).then(
    () => {
      const id = type
        ? `${type ?? 'sale'}_out_stock_sheet_id`
        : 'stock_sheet_id'

      if (receiptDetail[id]) {
        updateAndGetReceipt('submitted', true)
      } else {
        changeReceiptLoading(true)
        // eslint-disable-next-line promise/no-nesting
        createReceipt('submitted', true)
          .then((json: any) => {
            changeReceiptLoading(false)
            history.push(`${url}${json.response.stock_sheet?.[id]}`)
            return null
          })
          .catch(() => {
            changeReceiptLoading(false)
          })
      }
      return null
    },
    (_: any) => _,
  )
}

export default AutoBatchModal
