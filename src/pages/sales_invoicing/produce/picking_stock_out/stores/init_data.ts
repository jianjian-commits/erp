const defaultReceiptDetails = {
  material_out_stock_sheet_id: undefined,
  material_out_stock_sheet_serial_no: '', // 领料出库单号唯一
  create_time: undefined, // 建单时间(物理) 后端提供
  update_time: undefined, // 最后修改时间(物理) 后端提供
  delete_time: undefined, // 删除时间(物理) 后端提供 默认0
  group_id: undefined,
  station_id: undefined, // 站点id
  warehouse_id: undefined, // 仓库id
  creator_id: '0', // 创建人id, 后端提供
  submitter_id: '0', // 提交人
  approver_id: '0', // 审核人
  processor_id: '0', // 关联小组, 车间id
  processor_ids: [],
  amount: '0', // 商品总金额：后端计算，不含税
  out_stock_time: undefined, // 出库时间
  commit_time: undefined, // 提交时间(物理时间) 后端提供
  creator_name: '',
  sheet_status: -1, // 单据状态 enum SheetStatus
  batch_index: '0', // 批次号id, 每次反审都会重新
  detail_len: '0', // 详情数
  remark: '',
  invisible_type: 0, // 单据不可见类型
}

const defaultProductDetail = {
  materail_out_stock_sheet_detail_id: undefined,
  stock_sheet_id: undefined, // 关联单据id
  operator_id: undefined, // 操作人
  creator_id: undefined, // 创建人id
  sku_id: '0', // 商品id
  base_unit_id: '0', // 基本单位
  sku_unit_id: '0', // 自定义单位 id
  production_task_id: '0', // 关联生产计划
  production_task_serial_no: '', // 生产计划编号
  batch_details: [], // 修改的批次
  input_stock: {},
  amount: '0',
  batch_selected: [],
}

export { defaultReceiptDetails, defaultProductDetail }
