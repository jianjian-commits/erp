import React, { useCallback } from 'react'
import { useControllableValue } from '@/common/hooks'
import Calculator, { CalculatorProps } from '../calculator'
import { HistoryFormula, TableData } from '../history_formula_modal'
import { Button } from 'antd'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'

/**
 * 定价公式输入组件并且携带“历史公式”按钮
 */
const CalculatorWithHistoryFormula: React.VFC<CalculatorProps> = (props) => {
  const { className, style, placeholder } = props
  const [value, setValue] = useControllableValue<string>(props)

  const handleChange = useCallback(
    (e: TableData) => {
      setValue(e.formula)
    },
    [setValue],
  )

  return (
    <Flex alignCenter>
      <Calculator
        className={className}
        style={style}
        value={value}
        placeholder={placeholder}
        onChange={setValue}
      />
      <HistoryFormula onChange={handleChange}>
        <Button className='tw-flex-none' type='link'>
          {t('已有公式')}
        </Button>
      </HistoryFormula>
    </Flex>
  )
}

export default CalculatorWithHistoryFormula
