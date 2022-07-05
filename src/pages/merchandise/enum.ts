import { t } from 'gm-i18n'
import {
  Sku_ProcessType,
  BatchCreateCategorySku,
  BatchCreateSsu,
  BatchUpdateSkuSsu,
  BasicPriceItem_PRICINGTYPE,
  BasicPriceItem_PRICINGFORMULA,
} from 'gm_api/src/merchandise'
import { ImportBom, BomType } from 'gm_api/src/production'
import { FileType } from 'gm_api/src/cloudapi'

enum costType {
  skuBom, // 净菜
  skusBom, //  除了净菜的bom
  combinationSku, // 组合商品
}

enum Fee_Type {
  COMMON = 1,
  PERIOD,
}

enum Formula_Type {
  PRESET = 1,
  CUSTOMIZE,
}

enum Formula_Is_Valid {
  VALID,
  INVALID,
}

/**
 * @description 商品销售状态
 */
export const salesStatus = [
  { label: '全部状态', value: '' },
  { label: '在售', value: '1' },
  { label: '停售', value: '2' },
]

/**
 * @description 商品类型
 */
export const merchandiseTypes = [
  { label: '全部类型', value: '' },
  { label: '原料', value: '1' },
  { label: '净菜', value: '2' },
  { label: '熟食', value: '3' },
]

/**
 * @description: 计算方式
 */
export const calculateTypes = [
  {
    label: '自定义公式',
    value: BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_DIY,
  },
  {
    label: '不设置公式',
    value: BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_NONE,
  },
]

/**
 * @description: 定价类型
 */
export const feeTypes = [
  { label: '常规定价', value: BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL },
  { label: '区间定价', value: BasicPriceItem_PRICINGTYPE.PRICINGTYPE_INTERVAL },
]

/**
 * @description: 定价公式
 */
export const feeFormularTypes = [
  { label: '预设公式', value: Formula_Type.PRESET },
  { label: '自定义公式', value: Formula_Type.CUSTOMIZE },
]

interface Options {
  value: number | string
  text: string
}

const saleTypes: Options[] = [
  { value: 0, text: t('全部状态') },
  { value: 1, text: t('激活') },
  { value: 2, text: t('未激活') },
]

const stateTypes: Options[] = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('上架') },
  { value: 2, text: t('下架') },
]

const imageTypes: Options[] = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('有图') },
  { value: 2, text: t('无图') },
]

const bomMethodTypes: Options[] = [
  { value: 1, text: t('新建BOM') },
  { value: 2, text: t('复制BOM') },
]

const purchaseTypes: Options[] = [
  { value: 1, text: t('非临采') },
  { value: 2, text: t('临采') },
]

const quotationTypes: Options[] = [
  { value: 1, text: t('按基本单位') },
  { value: 2, text: t('按销售单位') },
]

const packageCalculateTypes: Options[] = [
  { value: 1, text: t('取固定值') },
  { value: 2, text: t('按下单数设置') },
]

const rulesetTypes: Options[] = [
  { value: '', text: t('全部状态') },
  { value: 1, text: t('有效') },
  { value: 2, text: t('无效') },
]

// 加工类型
const processTypes: { value: number; name: string; info: string }[] = [
  {
    value: Sku_ProcessType?.PT_CLEANFOOD,
    name: t('净菜'),
    info: t(
      '净菜指由一种原料经过一系列的加工工序生产出来的成品，限制bom设置时只有一个原料且无组合工序设置，一般指土豆丝、青椒丝等。',
    ),
  },
  {
    value: Sku_ProcessType?.PT_DELICATESSEN,
    name: t('熟食'),
    info: t(
      '熟食指由多种原料经过一系列的加工工序（含组合工序）生产出来的成品，限制bom设置时需设置多个原料以及组合工序，一般指菜品、卤制品、面点、米饭等。',
    ),
  },
]

// BOM、商品批量、商品规格信息导入的props，复用同一个BatchImport组件
const importList: Array<Record<string, any>> = [
  {
    importCreateUpdateAPI: ImportBom,
    bomType: BomType.BOM_TYPE_PACK,
    fileType: FileType.FILE_TYPE_PRODUCTION_BOM_IMPORT,
    importText: t('导出BOM信息，修改BOM信息后上传文件，完成导入'),
    downloadURL: 'https://file.guanmai.cn/bom_import_and_export_template.xlsx',
  },
  {
    importCreateAPI: BatchCreateCategorySku,
    importUpdateAPI: BatchUpdateSkuSsu,
    fileType: FileType.FILE_TYPE_MERCHANDISE_CATEGARY_SKU_IMPORT,
    importText: t('导出商品信息，修改商品信息后上传文件，完成导入'),
    downloadURL:
      'https://file.guanmai.cn/merchandise/merchandise_import/v1/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E5%95%86%E5%93%81%E6%A8%A1%E6%9D%BF.xlsx',
  },
  {
    importCreateAPI: BatchCreateSsu,
    importUpdateAPI: BatchUpdateSkuSsu,
    fileType: FileType.FILE_TYPE_MERCHANDISE_SSU_IMPORT,
    importText: t('导出商品规格信息，修改商品规格信息后上传文件，完成导入'),
    downloadURL:
      'https://file.guanmai.cn/merchandise/merchandise_import/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E5%95%86%E5%93%81%E8%A7%84%E6%A0%BC.xlsx',
  },
]

// BOM sku ssu
const modelRenderList: Array<Record<string, any>> = [
  { renderTitle: t('批量导入包装BOM'), importListItem: importList[0] },
  { renderTitle: t('批量导入商品'), importListItem: importList[1] },
  { renderTitle: t('批量导入商品规格'), importListItem: importList[2] },
]

// 成品成本文案
const Sku_Cost_Text = {
  [costType.skuBom]: t('成品成本基于组成物料成本/出成率计算得出'),
  [costType.skusBom]: t('成品成本基于组成物料成本*配比计算得出'),
  [costType.combinationSku]: t(
    '组合商品成本基于组成组合商品的配比计算得出，如需修改组成商品原料成本取值请进入生产设置修改',
  ),
}
export {
  saleTypes,
  stateTypes,
  imageTypes,
  bomMethodTypes,
  purchaseTypes,
  quotationTypes,
  packageCalculateTypes,
  rulesetTypes,
  processTypes,
  modelRenderList,
  costType,
  Sku_Cost_Text,
  Fee_Type,
  Formula_Type,
  Formula_Is_Valid,
}
