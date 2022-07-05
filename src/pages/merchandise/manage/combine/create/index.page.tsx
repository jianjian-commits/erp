import React, { FC, useEffect, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { Card, Button, message } from 'antd'
import store, { initFormFileds } from './store'
import '../style.less'
import Info from './components/info'
import CombineTableComponent from './components/combine_table'
import { observer } from 'mobx-react'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { FormRefProps, TableRefProps } from './interface'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import QuotationTable, {
  QuotationTableRef,
} from '@/pages/merchandise/manage/combine/create/components/quotation_table'

const CreateCombineComponent = observer(() => {
  const {
    skuId,
    setSkuId,
    setTableErrorTip,
    clearStore,
    createCombine,
    updateCombine,
    getCombineDetail,
    submitUpdate,
  } = store

  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query

  const [submitLoading, setSubmitLoading] = useState(false)

  const formVerify = useRef<FormRefProps>(null)
  const tableRef = useRef<TableRefProps>(null)
  const quotationRef = useRef<QuotationTableRef>(null)

  useEffect(() => {
    return () => clearStore()
  }, [])

  useEffect(() => {
    if (sku_id) {
      getSkuDetail(sku_id)
      setSkuId(sku_id)
    } else {
      setSkuId()
      if (formVerify.current) {
        formVerify.current.setFieldsValue(initFormFileds)
      }
    }
  }, [sku_id])

  /** 获取组合商品详情 */
  const getSkuDetail = async (sku_id: string) => {
    const { infoForm, tableForm } = await getCombineDetail(sku_id)
    if (formVerify.current) {
      formVerify.current.setFieldsValue(infoForm)
    }
    if (tableRef.current) {
      tableRef.current.setFieldsValue(tableForm)
    }
  }

  /** 新建 */
  const create = (baseInfo: any, tableInfo: any) => {
    setSubmitLoading(true)
    createCombine(baseInfo, tableInfo)
      .then((json) => {
        if (json.response.sku) {
          message.success(t('新建组合商品成功'))
          history.go(-1)
        } else {
          message.error(t('新建组合商品失败'))
        }
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  /** 确认编辑 */
  const confirmUpdate = () => {
    submitUpdate().then((json) => {
      if (json.response.sku) {
        message.success(t('编辑组合商品成功'))
        history.go(-1)
      } else {
        message.error(t('编辑组合商品失败'))
      }
    })
  }

  /** 编辑 */
  const update = (baseInfo: any, tableInfo: any) => {
    setSubmitLoading(true)
    updateCombine(baseInfo, tableInfo)
      .then(({ errorList, boundTableList }) => {
        if (errorList.length) {
          errorList.forEach((errItem) => {
            message.error(
              `商品${errItem.skuName}在报价单${errItem.quotationName}中已超过20条报价信息，无法绑定`,
            )
          })
          return
        }

        if (boundTableList.length) {
          if (quotationRef.current) {
            quotationRef.current.setIsShow(true)
          }
          return
        }
        confirmUpdate()
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  /** 保存 */
  const handleSave = async () => {
    const baseInfo = await formVerify?.current?.submit()
    const tableInfo = await tableRef?.current?.handleFinish()

    if (tableInfo?.errorFields && tableInfo?.errorFields[0]) {
      const { errors } = tableInfo?.errorFields[0]
      setTableErrorTip(errors[0])
      return
    }

    if (baseInfo && tableInfo) {
      setSubmitLoading(true)
      if (skuId) {
        update(baseInfo, tableInfo)
      } else {
        create(baseInfo, tableInfo)
      }
    }
    if (tableRef.current) {
      tableRef.current.setFieldsValue(tableForm)
    }
  }

  /** 新建 */
  // const create = (baseInfo: any, tableInfo: any) => {
  //   createCombine(baseInfo, tableInfo).then((json) => {
  //     if (json.response.sku) {
  //       message.success(t('新建组合商品成功'))
  //       history.go(-1)
  //     } else {
  //       message.error(t('编辑组合商品失败'))
  //     }
  //   })
  // }

  return (
    <div className='gm-site-card-border-less-wrapper'>
      <Card
        bordered={false}
        title={<span className='tw-font-bold tw-text-sm'>{t('商品信息')}</span>}
      >
        <Info ref={formVerify} />
      </Card>
      <Card
        title={
          <>
            <span className='tw-font-bold tw-text-sm'>{t('组成商品')}</span>
            <span className='text-desc-style'>
              {t('组合商品添加数量，最少2个，最多10个（时价商品不可添加）')}
            </span>
          </>
        }
        bordered={false}
      >
        <CombineTableComponent ref={tableRef} />
        <QuotationTable ref={quotationRef} />
      </Card>
      <ButtonGroupFixed
        onCancel={() => {
          history.go(-1)
        }}
        ButtonNode={
          <>
            <Button type='primary' onClick={handleSave} loading={submitLoading}>
              {t('保存')}
            </Button>
          </>
        }
      />
    </div>
  )
})
export default CreateCombineComponent
