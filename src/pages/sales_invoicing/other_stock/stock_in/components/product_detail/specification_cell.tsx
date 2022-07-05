import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/detail_store'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { checkDigit } from '@/common/util'

interface Props {
  data: PDetail
  index: number
}

const SpecificationCell: FC<Props> = observer((props) => {
  const { unit_id, ssu, ssu_display_name } = props.data
  const { receiptDetail } = store

  const handleChange = (selected: ComSsuItem) => {
    store.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  const canEdit = !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {canEdit ? (
        <KCMoreSelect
          data={ssu.slice()}
          selected={selected}
          onSelect={handleChange}
          placeholder={t('请输入规格名搜索')}
        />
      ) : (
        ssu_display_name
      )}
    </>
  )
})

export default SpecificationCell
