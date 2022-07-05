// 分拣类型
export const sortingType = [
  { value: '1', text: '计重分拣' },
  { value: '0', text: '不计重分拣' },
]

// 供应链信息
export const saleInventory = [
  { value: '1', text: '不限制库存' },
  { value: '2', text: '关联系统库存' },
  { value: '3', text: '自定义库存' },
]

export const saleInventoryMap = {
  '0': '不限制库存',
  '1': '关联系统库存',
  '2': '自定义库存',
}

// 库存采购
export const inventoryPurchase = [
  { label: '开启', value: '1' },
  { label: '关闭', value: '0' },
]

// 供应商协作
export const supplyCo = [
  { value: '0', text: '仅供货' },
  { value: '1', text: '供应商代分拣' },
  { value: '2', text: '供应商代配送' },
]

export const conversionMode = [
  { value: 0, text: '取固定值' },
  { value: 1, text: '按下单数量设置' },
]

// 辅助单位
export const auxiliaryUnit = [
  { label: '开启', value: '1' },
  { label: '关闭', value: '0' },
]
