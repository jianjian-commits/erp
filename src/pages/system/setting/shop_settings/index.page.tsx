import { t } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Switch,
  Tip,
  Flex,
  MoreSelect,
  RadioGroup,
  Radio,
} from '@gm-pc/react'
import store from './store'
import productionStore from '@/pages/system/setting/production_setting/store'
import { MapHint } from '@/common/components/hint'
import {
  Merchandise_Combine_TIP,
  Merchandise_Pack_TIP,
  Merchandise_Quotation_TIP,
  Merchandise_Formula_TIP,
} from './enum'
import { Select_ReferencePrice_Type } from 'gm_api/src/merchandise/pc'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import {
  ProductionSettings_PackageMaterialCost,
  list_MerchandiseSettings_PricingFormulaRound,
} from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import _ from 'lodash'
import { Select_MerchandiseSettings_PricingFormulaPrecision } from 'gm_api/src/preference/pc'

const ShopSettings = observer(() => {
  const { gmShopSetting, productionSetting } = globalStore
  // 初始化数据
  useEffect(() => {
    store.init(_.cloneDeep(gmShopSetting))
    productionStore.init(_.cloneDeep(productionSetting))
  }, [gmShopSetting, productionSetting])

  const {
    reference_price_type,
    sync_combine_ssu_ratio_to_menu_detail,
    audit_quotation,
    pricing_formula_precision,
    pricing_formula_round,
  } = store.merchandise_settings

  const { package_material_cost, sku_filter_not_in_material_costs } =
    productionStore.productionSetting

  const formRef1 = useRef(null)
  const formRef2 = useRef(null)

  const handleSave = () => {
    Promise.all([
      store.updateShopSettings(),
      productionStore.updateSetting(),
    ]).then(() => {
      Tip.success(t('设置成功'))
      return Promise.all([
        globalStore.fetchShopSettings(),
        globalStore.fetchProductionSetting(),
      ])
    })
  }
  return (
    <FormGroup formRefs={[formRef1, formRef2]} onSubmit={handleSave}>
      {/* <FormPanel title={t('组合商品设置')}>
        <Form ref={formRef1} hasButtonInGroup disabledCol>
          <FormItem label={t('组合商品同步菜谱规则设置')}>
            <Switch
              type='primary'
              checked={sync_combine_ssu_ratio_to_menu_detail}
              on={t('开启')}
              off={t('关闭')}
              onChange={(bool) => {
                store.changeMerchandiseSetting(
                  'sync_combine_ssu_ratio_to_menu_detail',
                  bool,
                )
              }}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              <div>{MapHint(Merchandise_Combine_TIP)}</div>
            </div>
          </FormItem>
        </Form>
      </FormPanel> */}
      <FormPanel title={t('成本设置')}>
        <div className='gm-text-desc gm-margin-bottom-5'>
          {t('说明：BOM成本以及组合商品成本默认按组成物料的原料成本计算')}
        </div>
        <Form ref={formRef2} colWidth='800px'>
          <FormItem label={t('原料成本取值设置')} colWidth='350px'>
            <Select_ReferencePrice_Type
              all={{ text: '未启用', value: 0 }}
              value={reference_price_type}
              onChange={(value) =>
                store.changeMerchandiseSetting('reference_price_type', value)
              }
            />
          </FormItem>
          {reference_price_type !== 0 && (
            <FormItem label={t('原料成本计算设置')}>
              <Flex
                className='gm-margin-bottom-20'
                style={{ marginTop: '6px' }}
              >
                <div className='gm-margin-right-10'>
                  {t('包材计入成本计算')}
                </div>
                <div>
                  <Switch
                    type='primary'
                    checked={
                      package_material_cost ===
                      ProductionSettings_PackageMaterialCost.PACKAGEMATERIALCOST_AVAILABLE
                    }
                    on={t('开启')}
                    off={t('关闭')}
                    onChange={(bool) => {
                      productionStore.updateProductionSetting(
                        'package_material_cost',
                        bool
                          ? ProductionSettings_PackageMaterialCost.PACKAGEMATERIALCOST_AVAILABLE
                          : ProductionSettings_PackageMaterialCost.PACKAGEMATERIALCOST_UNAVAILABLE,
                      )
                    }}
                  />
                  <div>{MapHint(Merchandise_Pack_TIP)}</div>
                </div>
              </Flex>
              <Flex>
                <div
                  className='gm-margin-right-10'
                  style={{ marginTop: '6px' }}
                >
                  {t('过滤不计入成本计算的商品类型')}
                </div>
                <div>
                  <MoreSelect
                    style={{ width: '350px' }}
                    data={list_Sku_NotPackageSubSkuType}
                    value={
                      sku_filter_not_in_material_costs?.sku_filter_not_in_material_costs
                    }
                    onChange={(value) => {
                      productionStore.updateProductionSetting(
                        'sku_filter_not_in_material_costs',
                        {
                          sku_filter_not_in_material_costs: value,
                        },
                      )
                    }}
                    multiple
                  />
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(
                      '设置后，熟食BOM计算成本的时候将不取这些类型的商品计入参考成本',
                    )}
                  </div>
                </div>
              </Flex>
            </FormItem>
          )}
        </Form>
      </FormPanel>
      <FormPanel title={t('报价单设置')}>
        <Form ref={formRef1} hasButtonInGroup disabledCol>
          <FormItem label={t('报价单审核')}>
            <Switch
              type='primary'
              checked={audit_quotation}
              on={t('开启')}
              off={t('关闭')}
              onChange={(bool) => {
                store.changeMerchandiseSetting('audit_quotation', bool)
              }}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              <div>{MapHint(Merchandise_Quotation_TIP)}</div>
            </div>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('定价公式设置')}>
        <Form>
          <FormItem label={t('商品定价公式精确度')} colWidth='500px'>
            <Select_MerchandiseSettings_PricingFormulaPrecision
              value={pricing_formula_precision}
              onChange={(val) => {
                store.changeMerchandiseSetting('pricing_formula_precision', val)
              }}
            />
            <div className='gm-text-desc gm-margin-top-5'>
              <div>{MapHint(Merchandise_Formula_TIP)}</div>
            </div>
          </FormItem>
          <FormItem label={t('商品定价公式取舍方法')} colWidth='700px'>
            <RadioGroup
              value={pricing_formula_round}
              onChange={(val) => {
                store.changeMerchandiseSetting('pricing_formula_round', val)
              }}
            >
              {_.map(list_MerchandiseSettings_PricingFormulaRound, (item) => (
                <Radio key={item.value} value={item.value}>
                  {item.text}
                </Radio>
              ))}
            </RadioGroup>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default ShopSettings
