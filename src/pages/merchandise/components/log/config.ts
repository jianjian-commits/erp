import { MerchandiseLogItem } from '@/pages/merchandise/components/log/type'
import { t } from 'gm-i18n'
import { LogModelType } from 'gm_api/src/logsystem'

export const MerchandiseLogConfig: { [key: string]: MerchandiseLogItem } = {
  merchandise: {
    log_model_type: LogModelType.LOGMODELTYPE_SKU,
    operationTypeList: [
      { label: t('全部类型'), value: '' },
      { label: t('创建商品'), value: '创建商品' },
      { label: t('删除商品'), value: '删除商品' },
      { label: t('修改商品'), value: '修改商品' },
      // { label: t('修改商品销售状态'), value: '修改商品销售状态' },
    ],
  },
  combine: {
    log_model_type: LogModelType.LOGMODELTYPE_COMBINE_SKU,
    operationTypeList: [
      { label: t('全部类型'), value: '' },
      { label: t('创建组合商品'), value: '创建组合商品' },
      { label: t('删除组合商品'), value: '删除组合商品' },
      { label: t('修改组合商品'), value: '修改组合商品' },
      // { label: t('修改子商品'), value: '修改子商品' },
      // { label: t('删除子商品'), value: '删除子商品' },
      // { label: t('修改组合商品销售状态'), value: '修改组合商品销售状态' },
    ],
  },
  quotation: {
    log_model_types: [
      LogModelType.LOGMODELTYPE_QUOTATION,
      LogModelType.LOGMODELTYPE_BASICPRICE,
    ],
    operationTypeList: [
      { label: t('全部类型'), value: '' },
      { label: t('创建报价单'), value: '创建报价单' },
      { label: t('删除报价单'), value: '删除报价单' },
      { label: t('修改报价单'), value: '修改报价单' },
      { label: t('新增商品报价'), value: '新增商品报价' },
      { label: t('删除商品报价'), value: '删除商品报价' },
      { label: t('修改商品报价'), value: '修改商品报价' },
      // { label: t('修改报价单客户'), value: '修改报价单客户' },
      // { label: t('修改报价单状态'), value: '修改报价单状态' },
      // { label: t('修改商品上架状态'), value: '修改商品上架状态' },
      // { label: t('导出商品报价'), value: '导出商品报价' },
      // { label: t('导出组合商品报价'), value: '导出组合商品报价' },
    ],
  },
  basic_price: {
    log_model_types: [
      LogModelType.LOGMODELTYPE_QUOTATION,
      LogModelType.LOGMODELTYPE_BASICPRICE,
    ],
    operationTypeList: [
      { label: t('全部类型'), value: '' },
      { label: t('新增商品报价'), value: '新增商品报价' },
      { label: t('删除商品报价'), value: '删除商品报价' },
      { label: t('修改商品报价'), value: '修改商品报价' },
    ],
  },
}
