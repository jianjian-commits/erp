import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { isInShareV2 } from '@/pages/sales_invoicing/util'
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
      {item.text}
      {item.isVirtualBase && <UnitItemTip text={t('基本单位')} />}
    </div>
  )
}

const SpecificationCell: FC<Props> = observer((props) => {
  const { unit_id, ssu, ssu_display_name, sku_id, ssu_unit_id } = props.data
  const { apportionList, receiptDetail } = store

  const handleChange = (selected: ComSsuItem) => {
    if (selected && isInShareV2(apportionList, sku_id)) {
      Tip.danger(
        t('该商品+规格已加入分摊不可重复添加，如需添加请取消分摊再进行操作'),
      )
    } else {
      store.changeSpecificationSelected(props.index, selected)
    }
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        ssu_display_name
      ) : (
        <KCMoreSelect
          data={ssu.slice()}
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
