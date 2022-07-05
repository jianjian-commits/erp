import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'

import { Flex, MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useRef } from 'react'

import store, { PDetail } from '../../stores/list_store'

interface SupplierProps {
  data: PDetail
  index: number
}

const SupplierName: FC<SupplierProps> = observer((props) => {
  const { supplierList } = store
  const { index } = props
  const {
    isEdit,
    target_id,
    target_delete_time,
    target_customized_code,
    target_name,
  } = store.list[index]

  const targetRef = useRef<MoreSelect>(null)

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    store.changeListItem('target_id', selected?.value, index)
    store.changeListItem('target_name', selected?.text, index)
    store.changeListItem(
      'target_customized_code',
      selected?.customized_code,
      index,
    )
    store.changeListItem(
      'target_delete_time',
      selected ? selected.delete_time : '0',
      index,
    )
  }

  // enter
  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      targetRef.current!.apiDoSelectWillActive()

      window.document.body.click()
    }
  }

  let supplierSelected
  if (target_id) {
    supplierSelected = { value: target_id, text: target_name! }
  }

  if ((!target_id || target_id === '0') && !isEdit) {
    return <div>-</div>
  }

  return (
    <Flex alignCenter>
      {target_delete_time && target_delete_time !== '0' && (
        <SupplierDeletedSign />
      )}
      {isEdit ? (
        <MoreSelect
          style={{
            width: '168px',
          }}
          ref={targetRef}
          data={supplierList.slice()}
          selected={supplierSelected}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          renderListFilterType='pinyin'
          placeholder={t('请选择入库供应商')}
        />
      ) : (
        <span>{`${target_name}(${target_customized_code})`}</span>
      )}
    </Flex>
  )
})

export default SupplierName
