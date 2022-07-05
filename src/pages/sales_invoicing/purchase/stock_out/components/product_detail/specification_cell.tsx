import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import BaseUnitItemTip from '@/pages/sales_invoicing/components/sign_tip'

interface Props {
  data: PDetail
  index: number
}

const renderListItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.isVirtualBase && <BaseUnitItemTip text={t('基本单位')} />}
    </div>
  )
}

const SpecificationCell: FC<Props> = observer((props) => {
  const { unit_id, ssu, ssu_display_name, input_tax = 0 } = props.data

  const handleChange = (selected: ComSsuItem) => {
    const receiptDetail = store.receiptDetail
    // const invoice_type = receiptDetail.target_attrs_invoice_type
    // selected.input_tax =
    //   invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
    //     ? `${_.isNil(selected?.input_tax!) ? input_tax : selected?.input_tax!}` // 暂时设置0
    //     : '0'
    store.changeSpecificationSelected(props.index, selected)
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  return (
    <KCMoreSelect
      data={ssu.slice()}
      // isGroupList
      selected={selected}
      onSelect={handleChange}
      placeholder={t('请输入规格名搜索2')}
      renderListItem={renderListItem}
    />
  )
})

export default SpecificationCell
