import React, { FC } from 'react'
import { t } from 'gm-i18n'
import store from '../store'
import purchaseStore from '@/pages/purchase/store'
import { observer } from 'mobx-react'
import { Select } from '@gm-pc/react'

interface SkuLevelSelectProps {
  index: number
}
const SkuLevelSelect: FC<SkuLevelSelectProps> = ({ index }) => {
  const { sku_level_filed_id, sku_level_data } = store.specDetail.list[index]

  const handleSelect = (value: string) => {
    store.updateListColumn(index, 'sku_level_filed_id', value)
  }

  return (
    <>
      {sku_level_data?.length > 0 ? (
        <Select
          style={{ width: '100%' }}
          data={sku_level_data.filter((i) => !i.is_delete)}
          value={sku_level_filed_id}
          placeholder={t('选择商品等级')}
          onChange={handleSelect}
        />
      ) : (
        '-'
      )}
    </>
  )
}
export default observer(SkuLevelSelect)
