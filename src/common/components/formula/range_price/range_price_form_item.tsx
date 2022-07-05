import React, { useCallback, useMemo } from 'react'
import { Col, InputNumber, Row, Select } from 'antd'
import { t } from 'gm-i18n'
import styled from 'styled-components'
import { FORMULA_SELECT_OPTIONS } from '../constant/formula'
import CalculatorWithHistoryFormula from '../calculator_with_history_formula'
import { useControllableValue } from '@/common/hooks'
import { Flex } from '@gm-pc/react'

const Text = styled.span`
  padding: 0 4px;
`

export interface RangePriceModel {
  /**
   * 类型
   */
  type: string
  /**
   * 最低价
   */
  min: number
  /**
   * 最高价
   */
  max: number
  /**
   * 公式
   */
  formula: string
}

export interface RangePriceFormItemProps {
  /**
   * 表单值
   */
  value?: RangePriceModel
  /**
   * 修改字段时触发
   */
  onChange?: (value: RangePriceModel) => void
}

/**
 * 价格区间表单项
 */
const RangePriceFormItem: React.VFC<RangePriceFormItemProps> = (props) => {
  const [value, setValue] = useControllableValue<RangePriceModel>(props)

  const updateState = useCallback(
    <K extends keyof RangePriceModel>(key: K, val: RangePriceModel[K]) => {
      setValue({ ...value, [key]: val })
    },
    [setValue, value],
  )

  const updateHandle = useMemo(() => {
    type Model = NonNullable<RangePriceModel>
    return {
      type: (val: Model['type']) => updateState('type', val),
      min: (val: Model['min']) => updateState('min', val),
      max: (val: Model['max']) => updateState('max', val),
      formula: (val: Model['formula']) => updateState('formula', val),
    }
  }, [updateState])

  return (
    <Row align='middle'>
      <Col span={6}>
        <Select
          value={value?.type}
          onChange={updateHandle.type}
          placeholder={t('选择类型')}
          options={FORMULA_SELECT_OPTIONS}
        />
      </Col>
      <Col span={18}>
        <Flex alignCenter>
          <Text>{t('在')}</Text>
          <InputNumber
            precision={2}
            value={value?.min}
            onChange={updateHandle.min}
            placeholder={t('最低价')}
            min={0}
          />
          <Text>-</Text>
          <InputNumber
            precision={2}
            value={value?.max}
            onChange={updateHandle.max}
            placeholder={t('最高价')}
            min={0}
          />
          <Text>{t('元，')}</Text>
          <CalculatorWithHistoryFormula
            value={value?.formula}
            onChange={updateHandle.formula}
            // placeholder={t('举例：【最近采购价】+ 10')}
          />
        </Flex>
      </Col>
    </Row>
  )
}

export default RangePriceFormItem
