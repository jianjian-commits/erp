import { SalesInvoicingSheet } from '@/pages/sales_invoicing/interface'
import { Sku_SkuType, UnitType } from 'gm_api/src/merchandise'
import { WarehouseTransferSheetDetail } from 'gm_api/src/inventory'

/**
 * 后台单据的结构不符合前端的直观处理场景，因此另外做适配处理。
 * 单据的字段是共用的，这里处理所有单据后台接口存在的字段（对于后台来说，所有单据的字段都是一样的）
 * 以及所有单据公共需要的辅助显示字段，如商品名，规格单位，货位名等
 * 针对具体不同业务的字段应该在各自业务中定义，不改变这里base的，因此改动本文件需要根据后台
 */

// 单据详情
export const defaultReceiptDetail: SalesInvoicingSheet.ReceiptDetail = {
  details: [], // 商品详情
  discountList: [], // 折让a
  apportionList: [], // 分摊
  turnoverList: [], // 周转物
  sheet_status: -1, // 单据状态

  create_time: '', // 建单时间
  supplier_id: '0', // 供应商id
  supplier_name: '', // 供应商名字
  purchaser_id: '0', // 采购员 id
  purchaser_name: '', // 采购员名字
  estimated_time: undefined, // 预计到货时间
  creator_id: '', // 创建人id
  creator_name: '', // 创建人名字
  remark: '', // 单据备注
  sheet_type: 0,
  target_delete_time: '0',
  warehouse_id: undefined,
  // 更换新的字段
  order_id: '0',
  order_serial_no: '',
  customer_id: '0', // 供应商/客户 id 老的字段
  customer_name: '', // 供应商/客户 名字 老的字段
  out_stock_time: undefined, // 入库时间
  sale_out_stock_sheet_serial_no: '', // 单号
  sale_out_stock_sheet_id: undefined,
  amount: '',
  material_order_id: '',
  material_order_serial_no: '',
}

// 商品详情（对于入库来说，一条商品详情对应一个批次）
export const defaultProductDetail: SalesInvoicingSheet.ProductDetail = {
  spu_id: '',
  spu_name: '',
  // sku
  sku_id: '',
  sku_name: '',
  sku_base_unit_id: '',
  sku_base_unit_name: '',
  sku_type: Sku_SkuType.ST_UNSPECIFIED,

  // 规格
  ssu: [],
  unit_id: '',
  ssu_display_name: '',
  ssu_unit_rate: null,

  // ssu
  ssu_unit_id: '',
  ssu_unit_name: '',
  ssu_quantity: null,
  sku_unit_id: '', // 后台使用
  ssu_unit_type: UnitType.UNIT_TYPE_UNSPECIFIED,

  // ssu base
  ssu_base_unit_id: '',
  ssu_base_unit_name: '',
  ssu_base_price: null,
  ssu_base_quantity: null,
  ssu_base_unit_rate: null,
  base_unit_id: '', // 后台使用

  // 做显示处理
  amount_show: null,
  ssu_base_quantity_show: null,
  ssu_quantity_show: null,
  ssu_base_price_show: null,
  different_price_show: null,

  input_stock: {},
  production_time: '',
  different_price: null,
  amount: null,
  no_tax_base_price: null,
  no_tax_amount: null,
  tax_money: null,
  tax_rate: 0,
  origin_tax_input_price: '',
  operator_name: '',

  // 分类
  category_id_1: '',
  category_id_2: '',
  category_name_1: '',
  category_name_2: '',

  // 新增checkbox 的值 要唯一的
  value: '',
}

// 批次
export const defaultBatchDetail = {}

// 生产计划
export const defaultPlanDetail = {}

// 调拨单详情后端原版字段

export const warehouseTransferDetails: WarehouseTransferSheetDetail = {
  warehouse_transfer_sheet_detail_id: '0',
  sku_id: '',
  unit_id: '',
  input_out_stock: {
    input: {
      unit_id: '',
      quantity: '',
      price: '0',
      val: '',
    },
    input2: {
      unit_id: '',
      quantity: '',
      price: '0',
      val: '',
    },
  },
  input_in_stock: {
    input: {
      unit_id: '',
      quantity: '',
      price: '0',
      val: '',
    },
    input2: {
      unit_id: '',
      quantity: '',
      price: '0',
      val: '',
    },
  },
  remark: '',
}
