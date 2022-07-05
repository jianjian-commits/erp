import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { isInShare } from '@/pages/sales_invoicing/util'
import { Tip } from '@gm-pc/react'
import { checkDigit } from '@/common/util'
import UnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

interface Props {
  data: PDetail
  index: number
}
const renderListItem = (item: any) => {
  return (
    <div>
      {item?.text}
      {item?.isVirtualBase && <UnitItemTip text={t('基本单位')} />}
    </div>
  )
}

/**
 * @deprecated 商品重构不要规格，组件弃用
 */
const SpecificationCell: FC<Props> = observer(({ data, index }) => {
  const {
    unit_id = '',
    ssu_display_name = '',
    sku_id = '',
    ssu_unit_id = '',
  } = data
  const { costAllocations, receiptDetail, productDetailsShow } = store
  const ssuList = productDetailsShow[index]?.sku?.ssu || []
  const targetSsuInfo = productDetailsShow[index]?.ssu || {}

  const handleChange = (selected: ComSsuItem) => {
    if (selected && isInShare(costAllocations, sku_id, selected.ssu_unit_id)) {
      Tip.danger(
        t('该商品+规格已加入分摊不可重复添加，如需添加请取消分摊再进行操作'),
      )
    } else {
      store.updateProductDetailsShow(index, selected)
    }
  }

  let selected
  if (unit_id) {
    selected = {
      value: targetSsuInfo?.unit_id,
      text: targetSsuInfo?.ssu_display_name,
    }
  }

  const canEdit =
    !isInShare(costAllocations, sku_id, ssu_unit_id) &&
    !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        ssu_display_name
      ) : (
        <KCMoreSelect
          data={ssuList}
          selected={selected}
          onSelect={handleChange}
          placeholder={t('请输入规格名搜索')}
          renderListItem={renderListItem}
        />
      )}
    </>
  )
})

export default SpecificationCell
