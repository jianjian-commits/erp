import React, { FC, useCallback } from 'react'
import { t } from 'gm-i18n'
import { KCMoreSelect } from '@gm-pc/keyboard'
import store from '../store'
import purchaseStore from '@/pages/purchase/store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'

interface SupplierSelectorProps {
  index: number
}
const SupplierSelector: FC<SupplierSelectorProps> = ({ index }) => {
  const { supplier } = store.specDetail.list[index]
  const handleSelect = useCallback(
    (selected: MoreSelectDataItem<string>) => {
      store.updateListColumn(index, 'supplier', selected)
    },
    [index],
  )

  return (
    <KCMoreSelect
      data={purchaseStore.suppliers.slice()}
      selected={supplier}
      placeholder={t('选择供应商')}
      renderListFilterType='pinyin'
      onSelect={handleSelect}
    />
  )
}

export default observer(SupplierSelector)
