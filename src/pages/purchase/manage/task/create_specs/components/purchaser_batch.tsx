import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, Flex, Button, Modal } from '@gm-pc/react'
import store from '../store'
import purchaseStore from '@/pages/purchase/store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'

const PurchaserBatch = (props: { selected: number[] }) => {
  const [purchaser, setPurchaser] = useState<MoreSelectDataItem<string>>()
  function handleSave() {
    store.updateListColumn(props.selected, 'purchaser', purchaser)
    handleCancel()
  }
  function handleCancel() {
    Modal.hide()
  }

  return (
    <div>
      <Flex>{`已勾选${props.selected.length}个采购计划`}</Flex>
      <Flex alignCenter className='gm-padding-tb-10'>
        修改为
        <MoreSelect
          data={purchaseStore.purchasers.slice()}
          selected={purchaser}
          placeholder={t('选择采购员')}
          renderListFilterType='pinyin'
          onSelect={(selected: MoreSelectDataItem<string>) =>
            setPurchaser(selected)
          }
        />
      </Flex>
      <Flex justifyEnd>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-5' />
        <Button type='primary' onClick={handleSave}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default observer(PurchaserBatch)
