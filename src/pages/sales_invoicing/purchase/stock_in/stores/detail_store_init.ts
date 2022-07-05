export const initReceiptDetail = {
  // 初始化几个必须的字段
  purchaser_id: '0',
  supplier_id: '0',
  warehouse_id: '0',
  sheet_status: -1,
}

export const initProductDetail = {
  sku_id: '',
  base_unit_id: '',
  amount: '',
  origin_tax_input_price: '', // 这个值没有地方用到ß
  purchase_in_stock_sheet_detail_id: '',
  input_stock: {},
  // 非后端参数
  shelf_selected: [],
}
