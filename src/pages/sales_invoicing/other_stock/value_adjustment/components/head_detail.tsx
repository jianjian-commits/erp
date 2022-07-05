import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { ADJUST_TABS_NAME } from '@/pages/sales_invoicing/enum'
import { formatSecond } from '@/pages/sales_invoicing/util'
import detail_store from '../stores/detail_store'

const DetailHead = observer(() => {
  const {
    headDetail: {
      adjust_sheet_serial_no,
      update_time,
      create_time,
      creator_name,
      adjust_sheet_status,
      stock_sheet_serial_no,
      stock_sheet_type,
      stock_sheet_id,
    },
  } = detail_store
  const renderHeaderInfo = () => {
    const HeaderInfo = [
      {
        label: t('货值调整单号'),
        item: adjust_sheet_serial_no,
      },
      {
        label: t('关联单据'),
        item: (
          <ToSheet
            source_type={stock_sheet_type!}
            serial_no={stock_sheet_serial_no!}
            sheet_id={stock_sheet_id!}
          />
        ),
      },
    ]
    return HeaderInfo
  }

  const renderContentInfo = () => {
    const ContentInfo = [
      {
        label: t('建单时间'),
        item: formatSecond(create_time!),
      },
      {
        label: t('调整完成时间'),
        item: formatSecond(update_time!),
      },
      {
        label: t('单据状态'),
        item: ADJUST_TABS_NAME[adjust_sheet_status!],
      },
      {
        label: t('建单人'),
        item: creator_name,
      },
    ]
    return ContentInfo
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentBlockWidth={250}
      HeaderInfo={renderHeaderInfo()}
      ContentInfo={renderContentInfo()}
    />
  )
})

export default DetailHead
