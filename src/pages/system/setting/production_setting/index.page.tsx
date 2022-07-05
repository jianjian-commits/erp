import { MapHint } from '@/common/components/hint'
import { isProduction } from '@/common/util'
import {
  SettingRadio,
  SettingRadioGroup,
} from '@/pages/system/setting/production_setting/components'
import globalStore from '@/stores/global'
import {
  Confirm,
  Flex,
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  MoreSelect,
  MoreSelectDataItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Tip,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  GetCategoryTree,
  list_Sku_NotPackageSubSkuType,
} from 'gm_api/src/merchandise'
import {
  ProductionSettings,
  ProductionSettings_BomMaterialReplaceType,
  ProductionSettings_CookYieldSetting,
  ProductionSettings_InputMaterialType,
  ProductionSettings_TaskOutputSource,
  ProductionSettings_ProductionPlanNavigationSetting,
} from 'gm_api/src/preference'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import '../styles.less'
import {
  PACK_PLAN_AMOUNT,
  PLAN_PACK_DEFAULT_SETTING,
  PLAN_PRODUCTION_DEFAULT_SETTING,
  PRODCUTION_DOWNSTREAM_RULE_RESERVE,
  PRODUCTION_BOM_REPLACE,
  PRODUCTION_COOK_YIELD,
  PRODUCTION_DOWNSTREAM_RULE_DELETE,
  PRODUCTION_MATERIAL_REPLACE,
  PRODUCTION_PLAN_AMOUNT,
  PRODUCTION_TASK_OUTPUT_SOURCE,
  PRODUCTION_TASK_OUTPUT_SOURCE_TIP,
  PRODUCTION_TASK_RULE,
  PRODUCTION_PLAN_NAVIGATION,
} from './enum'
import { ProcessData } from './interface'
import store from './store'
import TaskSetting from './task_setting'

const ProductionSetting = observer(() => {
  const refForm = useRef<Form>(null)
  const { productionSetting } = globalStore
  const [categoryTree, setCategoryTree] = useState<MoreSelectDataItem[]>([])
  // 初始化数据
  useEffect(() => {
    store.init(_.cloneDeep(productionSetting))
  }, [productionSetting])

  useEffect(() => {
    GetCategoryTree().then((res) => {
      setCategoryTree(
        _.map(_.filter(res.response.categories, { parent_id: '0' }), (v) => ({
          value: v.category_id,
          text: v.name,
        })),
      )
    })
  }, [])

  const { bom_material_replace_type } = store.productionSetting

  const handleSubmit = () => {
    store.updateSetting().then(() => {
      Tip.success(t('修改成功'))
      globalStore.fetchProductionSetting()
      return null
    })
  }

  // const handleEnsure = () => {
  //   Dialog.hide()
  //   handleSubmit()
  // }

  // const handleCancelSave = () => {
  //   Dialog.hide()
  // }

  const renderConfirmInfo = () => {
    return (
      <div className='gm-padding-left-5'>
        <div className='gm-padding-bottom-5'>
          {t('确定要切换“最后一道工序产出默认为计划产出“的状态吗？')}
        </div>
        <div>{MapHint(PRODUCTION_TASK_OUTPUT_SOURCE_TIP)}</div>
      </div>
    )
  }

  const handleSubmitPre = () => {
    // 判断用户是否对‘最后一道工序作为产出’进行了修改，若修改，需要弹窗提示
    const {
      task_output_source,
      task_output_source_combination,
      task_output_source_pack,
    } = globalStore.productionSetting
    if (
      task_output_source !== store.productionSetting.task_output_source ||
      task_output_source_combination !==
        store.productionSetting.task_output_source_combination ||
      task_output_source_pack !==
        store.productionSetting.task_output_source_pack
    ) {
      // 说明进行了切换操作，给出提示
      Confirm({
        title: t('提示'),
        children: renderConfirmInfo(),
        read: t('我已阅读以上提示，确认要切换'),
        size: 'md',
      }).then(() => {
        handleSubmit()
        return null
      })
    } else {
      handleSubmit()
    }

    // const { production_setting, pack_setting } = store.productionConfig
    // 校验：若建议生产/包装数选择了计划生产/包装数，建议可以启用公式设置
    // if (
    //   (production_setting === 1 || pack_setting === 1) &&
    //   is_algorithm_open === 0
    // ) {
    //   // 弹窗提示
    //   Dialog.render({
    //     title: t('提示'),
    //     size: 'md',
    //     buttons: [
    //       {
    //         text: t('返回设置'),
    //         onClick: handleCancelSave,
    //       },
    //       {
    //         text: t('继续保存'),
    //         onClick: handleEnsure,
    //         btnType: 'primary',
    //       },
    //     ],
    //     children: (
    //       <div className='gm-padding-10'>
    //         {t(
    //           '检测到建议生产数已作为计划生产数的默认值，建议生产数尚未配置，是否继续保存？',
    //         )}
    //         <div className='gm-text-red'>
    //           {t('若未配置建议生产数，计划生产数将默认展示0')}
    //         </div>
    //       </div>
    //     ),
    //   })
    // } else {
    //   handleSubmit()
    // }
  }

  const handleUpdateProcessSetting = <T extends keyof ProcessData>(
    key: T,
    value: ProcessData[T],
  ) => {
    store.updateProcessData(key, value)
  }

  const handleUpdateProductionSetting = <T extends keyof ProductionSettings>(
    key: T,
    value: ProductionSettings[T],
  ) => {
    store.updateProductionSetting(key, value)
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PRODUCTION_UPDATE_SETTINGS,
        )
      }
      formRefs={[refForm]}
      onSubmit={handleSubmitPre}
    >
      <FormPanel title={t('生产计划导航设置')}>
        <Form hasButtonInGroup ref={refForm} labelWidth='0px' colWidth='850px'>
          <FormItem label=''>
            <Observer>
              {() => {
                return (
                  <Flex column>
                    <SettingRadioGroup
                      settingKey='production_plan_navigation_setting'
                      value={
                        store.productionSetting
                          .production_plan_navigation_setting
                      }
                      onChange={handleUpdateProductionSetting}
                    >
                      <SettingRadio
                        value={
                          ProductionSettings_ProductionPlanNavigationSetting.PRODUCTION_PLAN_NAVIGATION_SETTING_MATERIAL_TASK
                        }
                        text={t('需求 -> 领料 -> 任务 -> 产出')}
                      />
                      <SettingRadio
                        value={
                          ProductionSettings_ProductionPlanNavigationSetting.PRODUCTION_PLAN_NAVIGATION_SETTING_TASK_MATERIAL
                        }
                        text={t('需求 -> 任务 -> 领料 -> 产出')}
                      />
                    </SettingRadioGroup>
                    <div>{MapHint(PRODUCTION_PLAN_NAVIGATION)}</div>
                  </Flex>
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('计划数默认设置')}>
        <Form hasButtonInGroup ref={refForm} labelWidth='130px'>
          <FormItem label={t('计划生产数默认设置')}>
            <Observer>
              {() => {
                const { production_setting } = store.productionConfig
                return (
                  <Select
                    data={
                      isProduction
                        ? PLAN_PRODUCTION_DEFAULT_SETTING
                        : PRODUCTION_PLAN_AMOUNT
                    }
                    value={production_setting}
                    onChange={(value) =>
                      handleUpdateProcessSetting('production_setting', value)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('计划包装数默认设置')}>
            <Observer>
              {() => {
                const { pack_setting } = store.productionConfig
                return (
                  <Select
                    data={
                      isProduction
                        ? PLAN_PACK_DEFAULT_SETTING
                        : PACK_PLAN_AMOUNT
                    }
                    value={pack_setting}
                    onChange={(value) =>
                      handleUpdateProcessSetting('pack_setting', value)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('任务生成规则说明')}>
        <Flex>
          <span>{t('生产/包装任务')}:</span>
          <div className='d-padding-10'>{MapHint(PRODUCTION_TASK_RULE)}</div>
        </Flex>
      </FormPanel>
      {/* <FormPanel title={t('产出默认设置')}>
        <Form hasButtonInGroup labelWidth='200px' colWidth='850px'>
          <FormItem label={t('最后一道工序产出默认为计划产出')}>
            <Observer>
              {() => {
                return (
                  <div style={{ paddingTop: 6 }}>
                    <Flex alignCenter>
                      <div style={{ fontSize: 14, marginRight: 4 }}>
                        单品BOM：
                      </div>
                      <SettingRadioGroup
                        settingKey='task_output_source'
                        value={store.productionSetting.task_output_source}
                        onChange={handleUpdateProductionSetting}
                      >
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
                          }
                          text={t('开启')}
                        />
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_TYPE_IN
                          }
                          text={t('关闭')}
                        />
                      </SettingRadioGroup>
                    </Flex>
                    <Flex alignCenter>
                      <div style={{ fontSize: 14, marginRight: 4 }}>
                        组合BOM：
                      </div>
                      <SettingRadioGroup
                        settingKey='task_output_source_combination'
                        value={
                          store.productionSetting.task_output_source_combination
                        }
                        onChange={handleUpdateProductionSetting}
                      >
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
                          }
                          text={t('开启')}
                        />
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_TYPE_IN
                          }
                          text={t('关闭')}
                        />
                      </SettingRadioGroup>
                    </Flex>
                    <Flex alignCenter>
                      <div style={{ fontSize: 14, marginRight: 4 }}>
                        包装BOM：
                      </div>
                      <SettingRadioGroup
                        settingKey='task_output_source_pack'
                        value={store.productionSetting.task_output_source_pack}
                        onChange={handleUpdateProductionSetting}
                      >
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_LAST_PROCESS
                          }
                          text={t('开启')}
                        />
                        <SettingRadio
                          value={
                            ProductionSettings_TaskOutputSource.TASKOUTPUT_SOURCE_TYPE_IN
                          }
                          text={t('关闭')}
                        />
                      </SettingRadioGroup>
                    </Flex>
                    <div>{MapHint(PRODUCTION_TASK_OUTPUT_SOURCE)}</div>
                  </div>
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel> */}
      <FormPanel title={t('设置熟出成率')}>
        <Form hasButtonInGroup labelWidth='90px' colWidth='1150px'>
          <FormItem label={t('设置熟出成率')}>
            <Observer>
              {() => {
                return (
                  <>
                    <Switch
                      type='primary'
                      on={t('开启')}
                      off={t('关闭')}
                      checked={
                        store.productionSetting.cook_yield_setting ===
                        ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_ON
                      }
                      onChange={(value) =>
                        handleUpdateProductionSetting(
                          'cook_yield_setting',
                          value
                            ? ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_ON
                            : ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_OFF,
                        )
                      }
                    />
                    {MapHint(PRODUCTION_COOK_YIELD)}
                  </>
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('替代料设置')}>
        <Form colWidth='850px'>
          <FormItem label={t('原料替代料设置')}>
            <Observer>
              {() => {
                const { input_material_type } = store.productionSetting
                return (
                  <>
                    <Switch
                      type='primary'
                      on={t('开启')}
                      off={t('关闭')}
                      checked={
                        input_material_type ===
                        ProductionSettings_InputMaterialType.INPUTMATERIALTYPE_SUBSTITUTE_MATERIAL_ALLOWED
                      }
                      onChange={(value) =>
                        handleUpdateProductionSetting(
                          'input_material_type',
                          value
                            ? ProductionSettings_InputMaterialType.INPUTMATERIALTYPE_SUBSTITUTE_MATERIAL_ALLOWED
                            : ProductionSettings_InputMaterialType.INPUTMATERIALTYPE_UNSPECIFIED,
                        )
                      }
                    />
                    <div>{MapHint(PRODUCTION_MATERIAL_REPLACE)}</div>
                  </>
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('物料替换设置')}>
            <Observer>
              {() => {
                const { bom_material_replace_type } = store.productionSetting
                return (
                  <>
                    <Switch
                      type='primary'
                      on={t('开启')}
                      off={t('关闭')}
                      checked={
                        bom_material_replace_type !==
                        ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_UNSPECIFIED
                      }
                      onChange={(value) => {
                        handleUpdateProductionSetting(
                          'bom_material_replace_type',
                          value
                            ? ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_DELETE_TASK
                            : ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_UNSPECIFIED,
                        )
                      }}
                    />
                    <div>{MapHint(PRODUCTION_BOM_REPLACE)}</div>
                  </>
                )
              }}
            </Observer>
          </FormItem>
          {bom_material_replace_type !==
            ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_UNSPECIFIED && (
            <FormItem label={t('设置下游计划/任务处理规则')}>
              <RadioGroup
                name='bom_material_replace_type'
                value={
                  bom_material_replace_type ||
                  ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_DELETE_TASK
                }
                onChange={(value) => {
                  handleUpdateProductionSetting(
                    'bom_material_replace_type',
                    value,
                  )
                }}
              >
                <div>
                  <Radio
                    value={
                      ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_DELETE_TASK
                    }
                  >
                    {t('删除原关联下游计划/任务')}
                    <div>{MapHint(PRODUCTION_DOWNSTREAM_RULE_DELETE)}</div>
                  </Radio>
                </div>
                <div>
                  <Radio
                    value={
                      ProductionSettings_BomMaterialReplaceType.BOMMATERIALREPLACETYPE_HOLD_TASK
                    }
                  >
                    {t('保留原关联下游计划/任务')}
                    <div>{MapHint(PRODCUTION_DOWNSTREAM_RULE_RESERVE)}</div>
                  </Radio>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        </Form>
      </FormPanel>
      {!isProduction && <TaskSetting />}
      {/* <FormPanel title={t('领料单打印设置')}>
        <Form colWidth='850px'>
          <FormItem label={t('领料单打印过滤')}>
            <Observer>
              {() => {
                const { material_sheet_setting } = store.productionSetting
                return (
                  <>
                    <Flex className='gm-margin-bottom-10'>
                      <Flex>
                        <div style={{ marginTop: '6px' }}>
                          {t('商品分类：')}
                        </div>
                        <MoreSelect
                          style={{ width: '300px' }}
                          value={material_sheet_setting?.category_ids}
                          data={categoryTree}
                          multiple
                          onChange={(value: string[]) => {
                            handleUpdateProductionSetting(
                              'material_sheet_setting',
                              {
                                ...material_sheet_setting,
                                category_ids: value,
                              },
                            )
                          }}
                        />
                      </Flex>
                      <Flex className='gm-margin-left-10'>
                        <div style={{ marginTop: '6px' }}>
                          {t('商品类型：')}
                        </div>
                        <MoreSelect
                          style={{ width: '300px' }}
                          value={
                            material_sheet_setting?.not_package_sub_sku_types
                          }
                          data={list_Sku_NotPackageSubSkuType}
                          multiple
                          onChange={(value) =>
                            handleUpdateProductionSetting(
                              'material_sheet_setting',
                              {
                                ...material_sheet_setting,
                                not_package_sub_sku_types: value,
                              },
                            )
                          }
                        />
                      </Flex>
                    </Flex>
                    <span className='gm-text-desc'>
                      {t('已选中的选项，在打印领料单时将被过滤')}
                    </span>
                  </>
                )
              }}
            </Observer>
          </FormItem>
        </Form>
      </FormPanel> */}
    </FormGroup>
  )
})

export default ProductionSetting
