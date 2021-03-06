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
  RadioGroup,
  Box,
  ListDataItem,
  Modal,
  TextArea,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from './../stores/receipt_store'

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
  duty_warehouse_id?: string
  money: number | undefined
  sku_units: SkuUnitsProps[]
  remark?: string
  type: string
}

const ApportionFormModal: FC<ApportionProps> = observer((props) => {
  const { productData, onEnsure, onCancel, methodData } = props
  const { costAllocations } = store
  const initState: ApportionState = costAllocations[0]
  const initSkuSelected = initState?.sku_units?.map(
    (item) => `${item.sku_id}_${item.unit_id}`,
  )

  const [state, setState] = useState<ApportionState>({
    // duty_warehouse_id: '',
    money: initState?.money ?? undefined,
    sku_units: initState?.sku_units ?? [],
    remark: initState?.remark ?? '',
    type: initState?.type ?? '',
  })

  const [skuSeleted, setSkuSelected] = useState<string[]>(initSkuSelected || [])

  const handleChange = <T extends keyof ApportionState>(
    name: T,
    value: ApportionState[T],
  ) => {
    setState((pre) => {
      return { ...pre, [name]: value }
    })
  }

  const handleShareProductSelect = (selected: string[]) => {
    const skuUnits = _.map(selected, (select) => {
      const tmpArr = select.split('_')
      return {
        sku_id: tmpArr[0],
        unit_id: tmpArr[1],
      }
    })
    setSkuSelected(selected)
    handleChange('sku_units', skuUnits)
  }

  const verifyShareData = () => {
    const { sku_units, type, money } = state

    if (!type) {
      Tip.danger(t('?????????????????????'))
      return false
    }
    if (!money) {
      // ?????????0
      Tip.danger(t('?????????????????????'))
      return false
    }
    if (sku_units.length === 0) {
      Tip.danger(t('?????????????????????'))
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
        {/* <FormItem label={t('?????????')}>
          <Select
            data={reasonData}
            value={state.duty_warehouse_id}
            onChange={(value) => handleChange('duty_warehouse_id', value)}
          />
        </FormItem> */}
        <FormItem label={t('????????????')}>
          <PrecisionInputNumber
            min={0}
            precisionType='dpInventoryAmount'
            onChange={(value) => handleChange('money', value)}
            value={state.money}
            placeholder={t('??????')}
          />
        </FormItem>
        <FormItem label={t('????????????')}>
          <RadioGroup
            value={state.type}
            onChange={(value: any) => handleChange('type', value)}
          >
            {_.map(methodData, (v) => (
              <div key={v.value}>
                <Radio value={v.value}>{v.text}</Radio>
              </div>
            ))}
          </RadioGroup>
        </FormItem>
        <FormItem label={t('????????????')}>
          <div style={{ height: '300px' }}>
            <Tree
              title='????????????'
              list={productData}
              selectedValues={skuSeleted.slice()}
              onSelectValues={handleShareProductSelect}
            />
          </div>
        </FormItem>
        <FormItem label={t('??????')}>
          <TextArea
            onChange={(event) => handleChange('remark', event.target.value)}
            id='share-remark'
            maxLength={50}
          />
        </FormItem>
      </Form>

      <Flex justifyEnd>
        <Button onClick={onCancel}>{t('??????')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleEnsure}>
          {t('??????')}
        </Button>
      </Flex>
    </Box>
  )
})

export default ApportionFormModal
