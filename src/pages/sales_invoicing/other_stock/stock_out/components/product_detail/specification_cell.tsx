import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import store, { PDetail } from '../../stores/detail_store'
import BaseUnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

interface Props {
  data: PDetail
  index: number
}

const renderListItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.isVirtualBase && <BaseUnitItemTip text={t('基本单位')} />}
    </div>
  )
}

const SpecificationCell: FC<Props> = observer((props) => {
  const { unit_id, ssu, ssu_display_name } = props.data

  const handleChange = (selected: ComSsuItem) => {
    store.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  return (
    <KCMoreSelect
      data={ssu.slice()}
      // isGroupList
      selected={selected}
      onSelect={handleChange}
      placeholder={t('请输入规格名搜索')}
      renderListItem={renderListItem}
    />
  )
})

export default SpecificationCell
