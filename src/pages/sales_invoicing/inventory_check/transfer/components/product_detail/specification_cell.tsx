import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/detail_store'
import UnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

interface SpecProps {
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

const SpecificationCell: FC<SpecProps> = observer((props) => {
  const { unit_id, ssu, ssu_display_name } = props.data
  const handleChange = (selected: ComSsuItem) => {
    if (selected.unit_id === unit_id) return
    store.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  return (
    <KCMoreSelect
      data={ssu.slice()}
      selected={selected} // 规格默认选项为第一个
      onSelect={handleChange}
      placeholder={t('请输入规格名搜索')}
      renderListItem={renderListItem}
    />
  )
})

export default SpecificationCell
