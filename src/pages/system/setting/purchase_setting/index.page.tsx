import React, { useState, useRef, useEffect } from 'react'
import {
  Select,
  FormPanel,
  Form,
  FormItem,
  FormGroup,
  Tip,
  Switch,
} from '@gm-pc/react'
import {
  PurchaseSettings_PurchaseTaskPlanValueCalculateMethod,
  GetPurchaseSettings,
  PurchaseSettings,
  UpdatePurchaseSettings,
  PurchaseSettings_PurchaseTaskPriceEqualQuotationPrice,
} from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const initSetting = {
  purchase_task_plan_value_calculate_method:
    PurchaseSettings_PurchaseTaskPlanValueCalculateMethod.SUGGEST_VALUE,
  purchase_task_price_equal_quotation_price:
    PurchaseSettings_PurchaseTaskPriceEqualQuotationPrice.PURCHASE_PRICE_NOT_EQUAL,
}

const PurchaseSetting = () => {
  const formRef = useRef<Form>(null)
  const [value, setValue] = useState<Partial<PurchaseSettings>>({
    ...initSetting,
  })

  useEffect(() => {
    GetPurchaseSettings({}).then((json) => {
      setValue({
        ...initSetting,
        ...json.response.purchase_settings,
      })
      return null
    })
  }, [])

  function handleChange(v: number) {
    setValue(
      Object.assign(
        { ...value },
        { purchase_task_plan_value_calculate_method: v },
      ),
    )
  }

  function handleAgreementPrice(v: boolean) {
    const result = v
      ? PurchaseSettings_PurchaseTaskPriceEqualQuotationPrice.PURCHASE_PRICE_EQUAL
      : PurchaseSettings_PurchaseTaskPriceEqualQuotationPrice.PURCHASE_PRICE_NOT_EQUAL
    setValue(
      Object.assign(
        { ...value },
        { purchase_task_price_equal_quotation_price: result },
      ),
    )
  }

  async function handelSubmit() {
    if (value.purchase_settings_id) {
      await UpdatePurchaseSettings({
        purchase_settings: { ...(value as PurchaseSettings) },
      })
    }
    Tip.success('更新成功')
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_PURCHASE_SETTINGS,
        )
      }
      formRefs={[formRef]}
      onSubmit={handelSubmit}
    >
      <FormPanel title='采购计划默认设置'>
        <Form ref={formRef} labelWidth='166px' hasButtonInGroup>
          <FormItem label='计划采购数'>
            <Select
              value={value.purchase_task_plan_value_calculate_method}
              onChange={handleChange}
              data={[
                {
                  value:
                    PurchaseSettings_PurchaseTaskPlanValueCalculateMethod.REQUEST_VALUE,
                  text: '需求数',
                },
                // {
                //   value:
                //     PurchaseSettings_PurchaseTaskPlanValueCalulateMethod.SUGGEST_VALUE,
                //   text: '建议采购数',
                // },
              ]}
            />
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title='采购单据默认设置'>
        <Form ref={formRef} labelWidth='166px' colWidth='800px'>
          <FormItem label='采购单价默认等于协议价'>
            <Switch
              type='primary'
              checked={
                value.purchase_task_price_equal_quotation_price ===
                PurchaseSettings_PurchaseTaskPriceEqualQuotationPrice.PURCHASE_PRICE_EQUAL
              }
              onChange={handleAgreementPrice}
            />
            <div className='tw-my-1'>
              1.开启后，采购单价默认展示当前供应商在生效期间的协议价；若当前供应商无协议价生效，则价格需由用户手动录入
            </div>
            <div className='tw-my-1'>
              2.关闭后，采购单价无默认值，需手动录入
            </div>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
}

export default PurchaseSetting
