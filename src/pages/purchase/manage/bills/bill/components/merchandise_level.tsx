import React, { FC, useState } from 'react'
import { Flex, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
interface MerchandiseLevelProps {
  index: number
}
const MerchandiseLevel: FC<MerchandiseLevelProps> = ({ index }) => {
  const levelData = store.list[index].levelData || []
  const sku_level_filed_id = store.list[index].sku_level_filed_id || ''

  const isCommitted =
    store.info.status === (PurchaseSheet_Status.COMMIT as number)

  const handleChange = (value: string) => {
    store.updateRowColumn(index, 'sku_level_filed_id', value)
  }

  if (isCommitted) {
    const sku_level_name =
      _.find(levelData, (item) => item.level_id === sku_level_filed_id)?.name ||
      '-'
    return <Flex alignCenter>{sku_level_name}</Flex>
  }
  const selectData = levelData.filter((i) => !i.is_delete)
  const isIndex = _.findIndex(
    selectData,
    (i) => i.level_id === sku_level_filed_id,
  )
  if (sku_level_filed_id && isIndex === -1) {
    const disableData = _.find(
      levelData,
      (i) => i.level_id === sku_level_filed_id,
    )
    selectData.push({
      ...disableData!,
      disable: true,
      text: disableData?.text!,
    })
  }

  return (
    <Flex alignCenter>
      {selectData.length > 0 ? (
        <Select
          value={sku_level_filed_id}
          onChange={handleChange}
          data={selectData || []}
          className='input-sm tw-w-full'
          placeholder={t('请选择商品等级')}
        />
      ) : (
        '-'
      )}
    </Flex>
  )
}

export default observer(MerchandiseLevel)
