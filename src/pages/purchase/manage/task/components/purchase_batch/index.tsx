import React, { useState, FC } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, Flex, Button, Modal } from '@gm-pc/react'
import purchaseStore from '@/pages/purchase/store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { BatchProps } from '../../interface'

const PurchaserBatch: FC<BatchProps> = ({ selected, isSelectedAll, onOK }) => {
  const [purchaser, setPurchaser] = useState<MoreSelectDataItem<string>>()
  function handleSave() {
    onOK(purchaser)
    handleCancel()
  }
  function handleCancel() {
    Modal.hide()
  }

  const text = isSelectedAll
    ? `已勾选全部采购计划`
    : `已勾选${selected.length}个采购计划`
  return (
    <div>
      <Flex>{text}</Flex>
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
