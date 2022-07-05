/* eslint-disable promise/no-nesting */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store1'
import { ComSsuItem } from '@/pages/sales_invoicing/interface'
import { isInShare, getLinkCalculate } from '@/pages/sales_invoicing/util'
import { Tip } from '@gm-pc/react'
import { checkDigit } from '@/common/util'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

interface Props {
  data: PDetail
  index: number
}

/**
 * @deprecated 已废弃
 */
const SpecificationCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const {
    unit_id,
    ssu,
    ssu_display_name,
    sku_id,
    ssu_unit_id,
    input_tax = 0,
    supplier_taxs,
    base_unit_id,
  } = props.data
  const { apportionList, receiptDetail } = store

  const handleStdUnitPriceChange = (value: number) => {
    // 单价改变影响金额
    const {
      amount = 0,
      amount_show = 0,
      different_price,
      different_price_show,
    } = getLinkCalculate({
      data,
      currentField: 'ssu_base_price',
      currentValue: value,
    })

    store.changeProductDetailsItem(index, {
      ssu_base_price: value,
      ssu_base_price_show: value,
      amount,
      amount_show,
      different_price,
      different_price_show,
    })
  }

  const handleChange = (selected: ComSsuItem) => {
    const invoice_type = receiptDetail?.target_attrs_invoice_type
    const supplier_id = receiptDetail.supplier_id
    if (selected && isInShare(apportionList, sku_id, selected.ssu_unit_id)) {
      Tip.danger(
        t('该商品+规格已加入分摊不可重复添加，如需添加请取消分摊再进行操作'),
      )
    } else {
      const ssu_id = {
        sku_id: selected.sku_id || '',
        unit_id: selected.unit_id || '',
      }
      store.changeSpecificationSelected(props.index, {
        ...selected,
      })
      handleStdUnitPriceChange(0)
      if (store.openBasicPriceState) {
        store
          .getBasicPrice(ssu_id, receiptDetail.supplier_id ?? '0')
          .then((res) => {
            const price = res?.basic_price?.price
            const tax = res?.basic_price?.input_tax!
            if (tax !== undefined) {
              store.changeProductDetailsItem(props.index, {
                tax_rate: Number(tax),
              })
            } else {
              const sku_ids = [store.productDetails[props.index].sku_id]
              store.getTax(sku_ids).then((res) => {
                const { supplier_input_taxs: supplier_input_taxa, input_tax } =
                  res?.response?.sku_infos?.[0].sku!

                store.changeProductDetailsItem(props.index, {
                  tax_rate:
                    invoice_type === ChinaVatInvoice_InvoiceType.VAT_SPECIAL
                      ? Number(
                          supplier_input_taxa?.supplier_input_tax?.[
                            supplier_id!
                          ] ?? input_tax,
                        )
                      : 0,
                })
              })
            }
            if (price) return handleStdUnitPriceChange(Number(price))
            return undefined
          })
      }
    }
  }

  let selected
  if (unit_id) {
    selected = { value: unit_id, text: ssu_display_name }
  }

  const canEdit =
    !isInShare(apportionList, sku_id, ssu_unit_id) &&
    !checkDigit(receiptDetail.status, 8)
  return (
    <>
      {!canEdit ? (
        ssu_display_name
      ) : (
        <KCMoreSelect
          data={ssu.slice()}
          selected={selected}
          onSelect={handleChange}
          placeholder={t('请输入规格名搜索')}
        />
      )}
    </>
  )
})

export default SpecificationCell
