import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import {
  Tree,
  Radio,
  Tip,
  Flex,
  Button,
  Form,
  FormItem,
  Select,
  RadioGroup,
  Box,
  ListDataItem,
  Modal,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'

import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'

export interface ApportionProps {
  productData: any[]
  actionData: ListDataItem<any>[]
  methodData: ListDataItem<any>[]
  reasonData: ListDataItem<any>[]
  onEnsure: (data: ApportionState) => void
  onCancel: () => void
}

interface SkuUnitsProps {
  sku_id: string
  unit_id: string
}

export interface ApportionState {
  money: number | null
  sku_selected: string[]
  sku_units: SkuUnitsProps[]
  reason: any
  action: any
  remark?: string
  method: any
}

const ApportionFormModal: FC<ApportionProps> = observer((props) => {
  const {
    productData,
    onEnsure,
    onCancel,
    actionData,
    reasonData,
    methodData,
  } = props

  const [state, setState] = useState<ApportionState>({
    money: null,
    sku_selected: [],
    sku_units: [],
    reason: null,
    action: null,
    remark: '',
    method: null,
  })

  const handleChange = <T extends keyof ApportionState>(
    name: T,
    value: ApportionState[T],
  ) => {
    setState((pre) => {
      return { ...pre, [name]: value }
    })
  }

  const handleShareProductSelect = (selected: string[]) => {
    handleChange('sku_selected', selected)
    const skuUnits = _.map(selected, (select) => {
      const tmpArr = select.split('_')
      return {
        sku_id: tmpArr[0],
        unit_id: tmpArr[1],
      }
    })
    handleChange('sku_units', skuUnits)
    handleChange('sku_selected', selected)
  }

  const verifyShareData = () => {
    const { sku_selected, action, reason, money, method } = state

    if (!action) {
      Tip.danger(t('请选择分摊类型'))
      return false
    }
    if (!reason) {
      Tip.danger(t('请选择分摊原因'))
      return false
    }
    if (!method) {
      Tip.danger(t('请选择分摊方式'))
      return false
    }
    if (!money) {
      // 不能为0
      Tip.danger(t('请填写分摊金额'))
      return false
    }
    if (sku_selected.length === 0) {
      Tip.danger(t('请选择分摊商品'))
      return false
    }
    return true
  }

  const handleEnsure = () => {
    if (verifyShareData()) {
      onEnsure(state)
      Modal.hide()
    }
  }

  return (
    <Box hasGap>
      <Form>
        <FormItem label={t('分摊原因')}>
          <Select
            data={reasonData}
            value={state.reason}
            onChange={(value) => handleChange('reason', value)}
          />
        </FormItem>
        <FormItem label={t('分摊类型')}>
          <Select
            data={actionData}
            value={state.action}
            onChange={(value) => handleChange('action', value)}
          />
        </FormItem>
        <FormItem label={t('分摊金额')}>
          <PrecisionInputNumber
            min={0}
            precisionType='dpInventoryAmount'
            onChange={(value) => handleChange('money', value)}
            value={state.money}
            placeholder={t('金额')}
          />
        </FormItem>
        <FormItem label={t('分摊方式')}>
          <RadioGroup
            value={state.method}
            onChange={(value: any) => handleChange('method', value)}
          >
            {_.map(methodData, (v) => (
              <div key={v.value}>
                <Radio value={v.value}>{v.text}</Radio>
              </div>
            ))}
          </RadioGroup>
        </FormItem>
        <FormItem label={t('分摊商品')}>
          <div style={{ height: '300px' }}>
            <Tree
              title='分摊商品'
              list={productData}
              selectedValues={state.sku_selected.slice()}
              onSelectValues={handleShareProductSelect}
            />
          </div>
        </FormItem>
        <FormItem label={t('备注')}>
          <TextArea
            onChange={(event) => handleChange('remark', event.target.value)}
            id='share-remark'
            maxLength={50}
          />
        </FormItem>
      </Form>

      <Flex justifyEnd>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleEnsure}>
          {t('确认')}
        </Button>
      </Flex>
    </Box>
  )
})

export default ApportionFormModal
