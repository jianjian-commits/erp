import React, { FC, useCallback } from 'react'
import { t } from 'gm-i18n'
import { KCMoreSelect } from '@gm-pc/keyboard'
import store from '../store'
import purchaseStore from '@/pages/purchase/store'

import { observer } from 'mobx-react'
import type { MoreSelectGroupDataItem, MoreSelectDataItem } from '@gm-pc/react'
import { purchaserGroupBy } from '../../../../util'

interface PurchaserSelectorProps {
  index: number
}
const PurchaserSelector: FC<PurchaserSelectorProps> = ({ index }) => {
  const { purchaser, supplier } = store.specDetail.list[index]
  const purchasers: MoreSelectGroupDataItem<string>[] = purchaserGroupBy(
    purchaseStore.purchasers.filter((v) => v.is_valid),
    supplier!,
  )

  const handleSelect = useCallback(
    (selected: MoreSelectDataItem<string>) => {
      store.updateListColumn(index, 'purchaser', selected)
    },
    [index],
  )

  return (
    <KCMoreSelect
      isGroupList
      data={purchasers}
      selected={purchaser}
      placeholder={t('选择采购员')}
      renderListFilterType='pinyin'
      onSelect={handleSelect}
    />
  )
}

export default observer(PurchaserSelector)
