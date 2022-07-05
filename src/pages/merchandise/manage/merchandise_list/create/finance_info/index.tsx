/**
 * @description 新建商品-财务信息
 */
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Col } from 'antd'
import { valueType } from 'antd/lib/statistic/utils'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { formatDataToTree } from '@/common/util'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import FormItem from '@/pages/merchandise/manage/merchandise_list/components/form_item'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'

const FinanceInfo: FC = () => {
  const { financeRateList } = store
  // 商品税收分类
  const [financeCategory, setFinanceCategory] = useState<any[]>([])

  useEffect(() => {
    const data = formatDataToTree(
      financeRateList!,
      'finance_category_id',
      'name',
    )
    setFinanceCategory(data)
  }, [financeRateList])

  const taxValidator = (event: any, value: number) => {
    if (value < 0 || value > 100 || value % 1 !== 0) {
      return Promise.reject(
        new Error(
          t(`${event.field === 'tax' ? '销项' : '进项'}税率应为0～100之间整数`),
        ),
      )
    }
    return Promise.resolve(new Error(''))
  }

  const financeInfoForm: FormItemInterface<valueType>[] = [
    {
      label: '商品税收分类',
      name: 'finance_category',
      id: 'finance_category',
      type: 'cascader',
      cascader: {
        options: financeCategory,
        placeholder: '请选择商品税收分类',
        fieldNames: { label: 'name', value: 'value', children: 'children' },
        expandTrigger: 'hover',
      },
    },
    {
      label: '销项税率',
      name: 'tax',
      id: 'tax',
      type: 'inputNumber',
      rules: [{ validator: taxValidator }],
      inputNumber: {
        placeholder: '请输入销项税率',
        min: 0,
        max: 100,
        addonAfter: '%',
      },
    },
    {
      label: '进项税率',
      name: 'input_tax',
      id: 'input_tax',
      type: 'inputNumber',
      rules: [{ validator: taxValidator }],
      inputNumber: {
        placeholder: '请输入进项税率',
        min: 0,
        max: 100,
        addonAfter: '%',
      },
    },
  ]
  return (
    <>
      {_.map(financeInfoForm, (formItem) => {
        return (
          <Col key={formItem.id} xs={24} sm={24} md={16} lg={12} xl={12}>
            <FormItem {...formItem} />
          </Col>
        )
      })}
    </>
  )
}

export default observer(FinanceInfo)
