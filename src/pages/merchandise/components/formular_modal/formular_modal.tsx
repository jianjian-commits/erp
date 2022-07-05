import React, {
  useState,
  useImperativeHandle,
  RefObject,
  FC,
  ReactNode,
  useRef,
  useEffect,
} from 'react'
import { Select, Modal, Form, Steps, Button } from 'antd'
import { t } from 'gm-i18n'
import '@/pages/merchandise/style.less'
import _ from 'lodash'

import {
  calculateTypes,
  feeFormularTypes,
  feeTypes,
  Fee_Type,
  Formula_Type,
} from '@/pages/merchandise/enum'
import RangePrice from '@/common/components/formula/range_price'
import CalculatorWithHistoryFormula from '@/common/components/formula/calculator_with_history_formula'
import PriceFormular, {
  PriceFormularRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/product/price_formular'
import {
  BasicPriceItem,
  BasicPriceItem_PRICINGFORMULA,
  BasicPriceItem_PRICINGTYPE,
  DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo,
} from 'gm_api/src/merchandise'
import { RangePriceModel } from '@/common/components/formula/range_price/range_price_form_item'
import formulaStore, {
  FormularParams,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/product/price_formular/store'
import { formularValidator } from '@/common/components/formula/calculator'
import { Observer } from 'mobx-react'

/**
 * preset：预设公式
 * currentSet：公式定价
 */
export type ModalType = 'preset' | 'currentSet'

interface FormularlProps {
  modalRef: RefObject<FormularlRef>
  /** 预设公式-定价类型展示状态 */
  hidePricingType?: boolean
  /**
   * 提交预设公式
   */
  handlePresetOK: (
    formValue: PresetFormValues,
    onClose: (...args: any) => any,
  ) => void
  /**
   * 应用预设公式
   */
  handleFormulaAffect?: (
    modifyList: Required<DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo>[],
    formulaParams: CurrentSetFormValues,
    deleteRow: string[],
    onClose: (...args: any) => any,
  ) => void
}

export type PresetFormValues = Pick<
  BasicPriceItem,
  'pricing_formula' | 'pricing_type' | 'formula_text'
> & { rangePriceList: RangePriceModel[] }

export type CurrentSetFormValues = Pick<
  BasicPriceItem,
  'pricing_type' | 'formula_text'
> & { rangePriceList: RangePriceModel[]; formular_type: number }
export interface FormularlRef {
  handleOpen: (modalType: ModalType) => void
  /**
   * 公式初始值，编辑的时候传入
   */
  setInitialFormula: (formula: string) => void
}

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 8 },
}

const steps = [`${t('选择定价公式')}`, `${t('填写商品单价')}`]

/**
 * @description: 被预设公式，公式定价复用
 */
const FormulartModal: FC<FormularlProps> = (props) => {
  const [form] = Form.useForm()
  const ref = useRef<PriceFormularRef>(null)
  const { modalRef, hidePricingType, handlePresetOK, handleFormulaAffect } =
    props
  const [visible, setVisible] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [modalType, setModalType] = useState<ModalType>()
  const [calcType, setCalcType] = useState<BasicPriceItem_PRICINGFORMULA>(
    BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_DIY,
  )
  const [feeType, setFeeType] = useState<BasicPriceItem_PRICINGTYPE>(
    BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL,
  )
  const [formularType, setFormularType] = useState<Formula_Type>(
    Formula_Type.PRESET,
  )

  const [modalWidth, setModalWidth] = useState<800 | 1250>(800)

  const [formulaParams, setFormulaParams] = useState<CurrentSetFormValues>({})

  const [initialFormula, setInitialFormula] = useState<string>('')

  useEffect(() => {
    modalType === 'preset' &&
      form.setFieldsValue({ formula_text: initialFormula })
  }, [calcType, initialFormula])

  useImperativeHandle(modalRef, () => ({
    handleOpen,
    setInitialFormula,
  }))

  const handleNextStep = (
    fetchList: (
      formularParams?: FormularParams,
      isResetCurrent?: boolean,
    ) => Promise<any>,
  ) => {
    fetchList(
      formulaParams.formular_type === Formula_Type.PRESET
        ? undefined
        : {
            pricing_type: formulaParams.pricing_type,
            ...(formulaParams.pricing_type ===
            BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL
              ? {
                  formula_text: formulaParams.formula_text,
                }
              : {
                  price_intervals: {
                    price_intervals: formulaParams.rangePriceList.map(
                      (item) => ({
                        begin: `${item.min}`,
                        end: `${item.max}`,
                        formula_text: item.formula,
                      }),
                    ),
                    reference_price_type: formulaParams.rangePriceList[0].type,
                  },
                }),
          },
    )
  }

  const handleOpen = (modalType: ModalType) => {
    setModalType(modalType)
    setVisible(true)
  }

  const init = () => {
    setCalcType(BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_DIY)
    setFormularType(Formula_Type.PRESET)
    setFeeType(BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL)
    setInitialFormula('')
  }

  const closeEffect = () => {
    setVisible(false)
    setCurrentStep(0)
    setModalWidth(800)
  }

  const handleCancel = () => {
    if (modalType === 'currentSet' && currentStep === 1) {
      Modal.confirm({
        title: t('提示'),
        content: t('取消后已填写的信息将会失效，确定要离开？'),
        okText: t('继续填写'),
        cancelText: t('离开'),
        onCancel: () => {
          closeEffect()
        },
      })
    } else {
      closeEffect()
    }
  }

  const handleOk = () => {
    form.validateFields().then(() => {
      if (modalType === 'preset') {
        handlePresetOK(form.getFieldsValue(), handleCancel)
      }
    })
  }

  const _handleFormulaAffect = () => {
    form.validateFields().then(() => {
      if (modalType === 'currentSet' && ref.current && handleFormulaAffect) {
        handleFormulaAffect(
          ref.current.modifyList,
          formulaParams,
          ref.current.deleteRow,
          closeEffect,
        )
      }
    })
  }

  const renderContent = (): ReactNode => {
    const isRange = feeType === BasicPriceItem_PRICINGTYPE.PRICINGTYPE_INTERVAL
    switch (modalType) {
      case 'preset': {
        return (
          <Form<PresetFormValues>
            form={form}
            {...formItemLayout}
            onValuesChange={(v) => {
              v.pricing_formula && setCalcType(v.pricing_formula)
              v.pricing_type && setFeeType(v.pricing_type)
              !v.formula_text &&
                !v.rangePriceList &&
                form.resetFields(['formula_text'])
            }}
            validateTrigger='onSubmit'
            preserve={false}
          >
            <Form.Item
              label={t('计算方式')}
              name='pricing_formula'
              initialValue={BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_DIY}
              rules={[{ required: true, message: '必填' }]}
            >
              <Select
                placeholder={t('请选择计算方式')}
                onChange={_.noop}
                options={calculateTypes}
              />
            </Form.Item>
            {calcType === BasicPriceItem_PRICINGFORMULA.PRICINGFORMULA_DIY && (
              <>
                {!hidePricingType && (
                  <Form.Item
                    label={t('定价类型')}
                    name='pricing_type'
                    initialValue={BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL}
                    rules={[{ required: true, message: '必填' }]}
                  >
                    <Select
                      placeholder={t('请选择定价类型')}
                      onChange={_.noop}
                      options={feeTypes}
                    />
                  </Form.Item>
                )}
                <Form.Item
                  label={t('定价公式')}
                  name='formula_text'
                  labelCol={isRange ? { span: 24 } : undefined}
                  style={isRange ? { paddingLeft: 22 } : undefined}
                  wrapperCol={{
                    span: !isRange ? 11 : 24,
                  }}
                  {...(!isRange
                    ? {
                        validateTrigger: 'onChange',
                        rules: [
                          {
                            required: true,
                            message: '公式错误，存在定价公式未填写',
                          },
                          (form) => ({
                            validator: (_, value) => {
                              if (value) {
                                return formularValidator(value).length === 0
                                  ? Promise.resolve()
                                  : Promise.reject(
                                      new Error('不合法的公式，请重新输入'),
                                    )
                              }
                              return Promise.resolve()
                            },
                            validateTrigger: 'onSubmit',
                          }),
                        ],
                      }
                    : {})}
                >
                  {!isRange ? (
                    <CalculatorWithHistoryFormula
                      className='gm-text-14'
                      style={{ width: 250 }}
                    />
                  ) : (
                    <RangePrice form={form} />
                  )}
                </Form.Item>
              </>
            )}
          </Form>
        )
      }
      case 'currentSet': {
        return (
          <>
            <div style={{ width: '360px' }}>
              <Steps current={currentStep}>
                {steps.map((item) => (
                  <Steps.Step key={item} title={item} />
                ))}
              </Steps>
            </div>
            <div className='line gm-margin-bottom-20' />
            {currentStep === 0 ? (
              <>
                <Form<CurrentSetFormValues>
                  form={form}
                  {...formItemLayout}
                  onValuesChange={(v) => {
                    v.formular_type && setFormularType(v.formular_type)
                    v.pricing_type && setFeeType(v.pricing_type)
                    !v.formula_text &&
                      !v.rangePriceList &&
                      form.resetFields(['formula_text'])
                  }}
                  validateTrigger='onSubmit'
                  labelAlign='right'
                  preserve={false}
                >
                  <Form.Item
                    label={t('定价方式')}
                    name='formular_type'
                    initialValue={Formula_Type.PRESET}
                    rules={[{ required: true, message: '必填' }]}
                  >
                    <Select
                      placeholder={t('请选择计算方式')}
                      onChange={_.noop}
                      options={feeFormularTypes}
                    />
                  </Form.Item>
                  {formularType === Formula_Type.CUSTOMIZE && (
                    <>
                      <Form.Item
                        label={t('定价类型')}
                        name='pricing_type'
                        initialValue={Fee_Type.COMMON}
                        rules={[{ required: true, message: '必填' }]}
                      >
                        <Select
                          placeholder={t('请选择定价类型')}
                          onChange={_.noop}
                          options={feeTypes}
                        />
                      </Form.Item>
                      <Form.Item
                        label={t('定价公式')}
                        name='formula_text'
                        labelCol={isRange ? { span: 24 } : undefined}
                        style={isRange ? { paddingLeft: 22 } : undefined}
                        rules={
                          feeType ===
                          BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL
                            ? [
                                {
                                  required: true,
                                  message: '公式错误，存在定价公式未填写',
                                },
                              ]
                            : []
                        }
                        wrapperCol={{
                          span:
                            feeType ===
                            BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL
                              ? 11
                              : 24,
                        }}
                      >
                        {feeType ===
                        BasicPriceItem_PRICINGTYPE.PRICINGTYPE_NORMAL ? (
                          <CalculatorWithHistoryFormula
                            className='gm-text-14'
                            style={{ width: 250 }}
                          />
                        ) : (
                          <RangePrice form={form} />
                        )}
                      </Form.Item>
                    </>
                  )}
                </Form>
                <div className='gm-modal-footer'>
                  <Button onClick={handleCancel}>{t('取消')}</Button>
                  <Button
                    type='primary'
                    onClick={() => {
                      form.validateFields().then(() => {
                        setModalWidth(1250)
                        setFormulaParams(form.getFieldsValue())
                        setCurrentStep(currentStep + 1)
                      })
                    }}
                    disabled={false} // todo
                  >
                    {t('下一步')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <PriceFormular ref={ref} handleNextStep={handleNextStep} />
                <div className='gm-modal-footer'>
                  <Button onClick={handleCancel}>{t('取消')}</Button>
                  <Button
                    onClick={() => {
                      Modal.confirm({
                        title: t('提示'),
                        content: t(
                          '返回上一步后已填写的信息将会失效，确定要离开？',
                        ),
                        okText: t('继续填写'),
                        cancelText: t('上一步'),
                        onCancel: () => {
                          setModalWidth(800)
                          form.setFieldsValue(formulaParams)
                          setCurrentStep(currentStep - 1)
                        },
                      })
                    }}
                  >
                    {t('上一步')}
                  </Button>
                  <Observer>
                    {() => {
                      return (
                        <Button
                          onClick={_handleFormulaAffect}
                          type='primary'
                          disabled={!formulaStore.tableList.length}
                        >
                          {t('提交')}
                        </Button>
                      )
                    }}
                  </Observer>
                </div>
              </>
            )}
          </>
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <Modal
      style={{ top: 20 }}
      title={t(`${modalType === 'preset' ? '设置定价公式' : '公式定价'}`)}
      bodyStyle={{ padding: '16px 24px 0 24px' }}
      visible={visible}
      width={modalWidth}
      onOk={handleOk}
      onCancel={handleCancel}
      afterClose={init}
      destroyOnClose
      okText='确认'
      cancelText='取消'
    >
      {renderContent()}
    </Modal>
  )
}

export default FormulartModal
