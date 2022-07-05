import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { RightSideModal, Tip } from '@gm-pc/react'
import { ProductionSettings_InputMaterialType } from 'gm_api/src/preference'

import { ProductionPlanSelect } from '@/pages/sales_invoicing/components'

import globalStore from '@/stores/global'
import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

interface Props {
  index: number
  data: ProductDetailProps
}

const verifyPlan = (data: any[]) => {
  let isPlanValid = true
  if (data.length !== 1) {
    isPlanValid = false
    Tip.danger(t('需要关联一条生产计划'))
  }
  return isPlanValid
}

/**
 * @deprecated 这个需求废除掉了，除了一大害😄
 */
const ProducePlanCell: FC<Props> = observer(({ index, data }) => {
  const { input_material_type } = globalStore.productionSetting
  const { sku_id, production_task_id, production_task_serial_no } = data

  const is_has_selected = production_task_id !== '0'

  const handlePlan = () => {
    if (sku_id === '0') {
      Tip.danger(t('请先选择商品'))
      return
    }
    RightSideModal.render({
      children: (
        <ProductionPlanSelect
          selectKey='task_id'
          defaultFilter={{
            input_sku_ids:
              input_material_type ===
              ProductionSettings_InputMaterialType.INPUTMATERIALTYPE_UNSPECIFIED
                ? [sku_id]
                : [],
            need_details: true,
          }}
          skuId={sku_id}
          onEnsure={(data) => {
            if (verifyPlan(data)) {
              DetailStore.changeProductDetailsItem(index, {
                production_task_id: data[0]?.task_id,
                production_task_serial_no: data[0]?.serial_no,
              })
              RightSideModal.hide()
            }
          }}
          onCancel={() => {
            RightSideModal.hide()
          }}
          production_task_id={production_task_id}
        />
      ),
      title: t('选择生产计划'),
      opacityMask: true,
      style: {
        width: '1000px',
      },
      onHide: RightSideModal.hide,
    })
  }

  return (
    <a onClick={handlePlan} className='gm-cursor'>
      {is_has_selected ? production_task_serial_no : t('选择生产计划')}
    </a>
  )
})

export default ProducePlanCell
