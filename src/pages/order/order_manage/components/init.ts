import { Filters_Bool } from 'gm_api/src/common'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'

export const initSsu: any = {
  order_detail_id: '0',
  category_id: '',
  category_name: '-',
  customize_code: '',
  description: '',
  is_weight: false,
  name: '',
  price: '0',
  quantity: null,
  sku_id: '',
  unit_id: '',
  //   shipping_fee_unit_id: '',
  //   shipping_fee_unit: 1,
  stock_type: 1,
  unit: {
    unit_id: '',
    name: '',
    rate: '',
    parent_id: '',
  },
  value: '',
  text: '',
  quotationName: '-',
  isNewItem: true,
  // feIngredients: { ssu_ratios: [] },
  feIngredients: { ingredients: [] },
  repeated_field: { images: [] },
  ingredients: { ssu_ratios: [] },
  supplier_cooperate_model_type:
    Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
  is_print: Filters_Bool.TRUE,
  is_bom_type: false, // 为false就是非加工品， 否则就是加工品
}
