/**
 * @description 新建商品
 */
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Row, Form, Card, message, Spin } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import { getCustomizedCode } from '@/common/util'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import globalStore from '@/stores/global'
// import Anchor from '@/pages/merchandise/manage/merchandise_list/create/components/Anchor'
import BaseInfo from '@/pages/merchandise/manage/merchandise_list/create/base_info'
import SupplyInfo from '@/pages/merchandise/manage/merchandise_list/create/supply_info'
import BomInfo from '@/pages/merchandise/manage/merchandise_list/create/bom_info'
import FinanceInfo from '@/pages/merchandise/manage/merchandise_list/create/finance_info'
import store, { initFormValue } from './store'
import './style.less'
import { Sku_PackageCalculateType } from 'gm_api/src/merchandise'

const CreateMerchandise: FC = observer(() => {
  const {
    createLoadingState,
    isEditLoading,
    skuId,
    setSkuId,
    formValue,
    setFormValue,
    submit,
    basicUnitObj,
    setBasicUnitObj,
    getSkuDetail,
    submitStockConfig,
    getShelfList,
    getFinanceRateList,
    clearStore,
  } = store

  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query

  const [merchandiseForm] = Form.useForm()

  /** 是否随机生成商品编号 */
  const [canCustomer, setCanCustomer] = useState<boolean>(true)
  /** 是否正在提交 */
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (globalStore.isLite) {
      // 轻巧版可以增加基本单位，故进新建商品页面时拉一次UnitList
      globalStore.fetchUnitList()
    }
    return () => {
      clearStore()
    }
  }, [])

  useEffect(() => {
    if (!sku_id && createLoadingState === 2) {
      merchandiseForm.setFieldsValue(initFormValue)
    }
  }, [createLoadingState, sku_id])

  useEffect(() => {
    if (sku_id) {
      getSku()
      setSkuId(sku_id)
    } else {
      getShelfList()
      getFinanceRateList()
    }
  }, [sku_id])

  const setValues = (values: any) => {
    merchandiseForm.setFieldsValue(values)
    setFormValue({ ...formValue, ...values })
  }

  const onBasicUnitChange = (id: string, allValues: any) => {
    const basicUnitItem = globalStore.getUnit(id)
    if (basicUnitItem) {
      setBasicUnitObj(basicUnitItem)
      setValues({
        ...allValues,
        inventory_unit: basicUnitItem.text,
        production_unit_id: basicUnitItem.value,
        product_basic_unit: `1${basicUnitItem.text}`,
        purchase_unit_id: basicUnitItem.value,
        second_base_unit: '',
        custom_unit_1: '',
        custom_unit_2: '',
        custom_unit_3: '',
      })
    }
  }

  const onValuesChange = (changedValues: any, allValues: any) => {
    // 自动生成商品编码
    if (changedValues.name) {
      const name = changedValues.name.trim()
      let newValues = {
        ...allValues,
        name,
      }
      if (canCustomer && !sku_id) {
        const customizeCode = `${getCustomizedCode(name)}${Math.floor(
          Math.random() * 10000,
        )}`
        newValues = { ...newValues, customize_code: customizeCode }
      }

      setValues(newValues)
    } else if (changedValues.customize_code) {
      // 手动输入编码后，不能自动生成商品编码
      const customize_code = changedValues.customize_code.trim()
      setValues({
        ...allValues,
        customize_code,
      })
      setCanCustomer(false)
    } else if (changedValues.alias) {
      const alias = changedValues.alias.trim()
      setValues({
        ...allValues,
        alias,
      })
    } else if (changedValues.base_unit_id) {
      // 基本单位发生变化
      onBasicUnitChange(changedValues.base_unit_id, allValues)
    } else if (changedValues.production_unit_id === basicUnitObj.unit_id) {
      setValues({ ...allValues, production_num: '1' })
    } else if (changedValues.package_calculate_type) {
      if (
        changedValues.package_calculate_type === Sku_PackageCalculateType.FIXED
      ) {
        allValues = {
          ...allValues,
          package_num: 1,
        }
      }
      setValues(allValues)
    } else {
      setValues(allValues)
    }
  }

  const onFinish = (values: any) => {
    setIsLoading(true)
    submit(values)
      .then((json) => {
        const { sku } = json.response
        if (sku) {
          return submitStockConfig(sku)
        } else {
          message.error(t(`${sku_id ? '编辑失败' : '新建失败'}`))
        }
      })
      .then(() => {
        setIsLoading(false)
        message.success(t(`${sku_id ? '编辑成功' : '新建成功'}`))
        history.push('/merchandise/manage/merchandise_list')
      })
      .catch(() => {
        setIsLoading(false)
      })
  }

  const onCancel = () => {
    history.push('/merchandise/manage/merchandise_list')
  }

  const getSku = async () => {
    const newFormValue = await getSkuDetail(sku_id)
    merchandiseForm.setFieldsValue(newFormValue)
  }

  /** hide字段为轻巧版中字段的显示隐藏 */
  const blockList = [
    {
      title: '基本信息',
      id: '#base_info',
      child: (
        <BaseInfo
          setValues={setValues}
          getFieldValue={merchandiseForm.getFieldValue}
        />
      ),
    },
    {
      title: '供应链信息',
      id: '#supply_info',
      child: <SupplyInfo setValues={setValues} />,
    },
    {
      title: '包材信息',
      id: '#bom_info',
      hide: globalStore.isLite,
      child: <BomInfo setValues={setValues} />,
    },
    {
      title: '财务信息',
      id: '#finance_id',
      hide: globalStore.isLite,
      child: <FinanceInfo />,
    },
  ].filter((f) => !f.hide)

  return (
    <div className='create-meichandise'>
      {sku_id && isEditLoading ? (
        <div className='merchandise-form merchandise-loading'>
          <Spin size='large' tip={t('加载中...')} />
        </div>
      ) : (
        <div className='merchandise-form'>
          <Form
            name='merchandise_build'
            form={merchandiseForm}
            scrollToFirstError
            layout='horizontal'
            labelAlign='right'
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            validateTrigger={['onChange', 'onFinish']}
          >
            {_.map(blockList, (blockItem) => {
              const { id, title, child } = blockItem

              return (
                <Card
                  id={id}
                  key={id}
                  title={<span style={{ fontSize: '14px' }}>{title}</span>}
                  bordered={false}
                >
                  <Row style={{ maxWidth: 1200 }}>{child}</Row>
                </Card>
              )
            })}
            <ButtonGroupFixed onCancel={onCancel} loading={isLoading} />
          </Form>
        </div>
      )}
    </div>
  )
})
export default CreateMerchandise
