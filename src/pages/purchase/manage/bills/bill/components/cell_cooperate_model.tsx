import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import { observer } from 'mobx-react'
import store from '../store'

type CooperateModelMapType = {
  [key in Sku_SupplierCooperateModelType]: string
}

const CooperateModelMap: CooperateModelMapType = {
  // disabled: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED]: t('-'),
  [Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS]: t('仅供货'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_SORTING]: t('代分拣'),
  [Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY]: t('代配送'),
}

const CellCooperateModel: FC<{ index: number }> = ({ index }) => {
  const supplier_cooperate_model_type =
    store.list[index].supplier_cooperate_model_type ||
    Sku_SupplierCooperateModelType.SCMT_UNSPECIFIED
  // const isCommitted =
  //   store.info.status === (PurchaseSheet_Status.COMMIT as number)
  // const purchase_task_serial_no = store.list[index].purchase_task_serial_no

  return <div>{CooperateModelMap[supplier_cooperate_model_type]}</div>
  // if (isCommitted || supplier_cooperate_model_type === 'disabled')
  //   return <div>{CooperateModelMap[supplier_cooperate_model_type]}</div>
  // return (
  //   <Select
  //     data={[
  //       {
  //         value: Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
  //         text: t('仅供货'),
  //       },
  //       {
  //         value: Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
  //         text: t('供应商代分拣'),
  //       },
  //       {
  //         value: Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
  //         text: t('供应商代配送'),
  //       },
  //     ]}
  //     // disabled={!purchase_task_serial_no}
  //     value={supplier_cooperate_model_type}
  //     onChange={(value) =>
  //       store.updateRowColumn(index, 'supplier_cooperate_model_type', value)
  //     }
  //   />
  // )
}

export default observer(CellCooperateModel)
