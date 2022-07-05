import * as React from 'react'
import { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { KCMoreSelect } from '@gm-pc/keyboard'

import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import UnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

import { PDetail } from '../../stores/detail_store'
import { DetailStore } from '../../stores/index'

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
  const { unit_id, ssu, ssu_display_name } = props.data
  const { order_id } = DetailStore.receiptDetail

  const handleChange = (selected: ComSsuItem) => {
    DetailStore.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  return (
    <>
      {order_id !== '0' ? (
        ssu_display_name
      ) : (
        <KCMoreSelect
          data={ssu.slice()}
          // isGroupList
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
