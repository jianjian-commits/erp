import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { t } from 'gm-i18n'
import _ from 'lodash'
import store, { PDetail } from '../../stores/detail_store'
import UnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

interface specProps {
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

const SpecificationCell: FC<specProps> = observer((props) => {
  const { unit_id, ssu, ssu_display_name, sku_id } = props.data
  const { productList } = store
  const handleChange = (selected: ComSsuItem) => {
    store.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  // 筛选已选的规格
  const result = _.map(_.filter(productList, { sku_id }), (v) => {
    return v.unit_id
  })
  const filterSsu = _.reject(ssu, (v) => {
    const findUnit = _.find(result, (value) => {
      return value === v.unit_id
    })
    _.pull(result, v.unit_id)
    return findUnit
  })

  return (
    <KCMoreSelect
      data={filterSsu.slice()}
      // isGroupList
      selected={selected}
      onSelect={handleChange}
      placeholder={t('请输入规格名搜索')}
      renderListItem={renderListItem}
    />
  )
})

export default SpecificationCell
