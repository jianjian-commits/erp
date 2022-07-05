import { getMaterialRateCostV2 } from '@/pages/production/util'
import { Flex, InputNumber } from '@gm-pc/react'
import { Bom_Status } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React from 'react'
import { ProcessOfBom } from '../interface'
import store from '../store'
import { processYieldChange, withStatus } from '../utils'

/**
 * 工序总出成率单元格的组件函数
 */
const CellProcessYield = () => {
  const { materialList, bomProcessList, bomDetail } = store
  const value = materialList[0].process_yield
  const isOpenYield = !withStatus(
    bomDetail.status!,
    Bom_Status.STATUS_PROCESS_YIELD_RATE,
  )

  /**
   * 处理工序总出成率改变的事件
   * 更新所有工序的出成率
   */
  const handleChangeProcessYield = (sku_yield: number) => {
    const { material_cost } = materialList[0]
    store.updateListItem(
      0,
      Object.assign({}, materialList[0], {
        process_yield: sku_yield,
        materialRateCost: getMaterialRateCostV2({
          material_cost,
          yieldNumber: sku_yield ?? 0,
          isClean: true,
        }),
      }),
    )
    store.updateAllBomProcessList(
      processYieldChange(bomProcessList, sku_yield) as ProcessOfBom[],
    )
  }

  return (
    <Flex alignCenter className='gm-margin-left-5'>
      {isOpenYield ? (
        <InputNumber
          style={{ width: '180px' }}
          min={0}
          value={value}
          onChange={handleChangeProcessYield}
        />
      ) : (
        <Flex style={{ height: 'var(--gm-size-form-height)' }} alignCenter>
          {value}
        </Flex>
      )}
      <span className='gm-margin-left-5'>%</span>
    </Flex>
  )
}

export default observer(CellProcessYield)
