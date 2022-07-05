import { Flex, InputNumber } from '@gm-pc/react'
import React, { FC } from 'react'

/**
 * 工序出成率单元格的属性
 */
interface Props {
  /** 出成率 */
  value: number
  /** 是否开启出成率 */
  isOpenYield: boolean
  /** 出成率改变的时候执行的动作 */
  onChange: (sku_yield: number) => void
}

/**
 * 工序出成率单元格的组件函数
 */
const CellProcessYield: FC<Props> = ({ value, isOpenYield, onChange }) => {
  /**
   * 处理出成率改变的事件
   * 更新出成率
   * @param {number} e 新的出成率
   */
  const handleChange = (e: number) => {
    onChange(e)
  }

  return (
    <Flex>
      {!isOpenYield ? (
        <>
          <InputNumber
            style={{ width: '150px' }}
            min={0}
            value={value}
            onChange={handleChange}
          />
          <span className='gm-margin-top-5 gm-margin-left-5'>%</span>
        </>
      ) : (
        '-'
      )}
    </Flex>
  )
}

export default CellProcessYield
