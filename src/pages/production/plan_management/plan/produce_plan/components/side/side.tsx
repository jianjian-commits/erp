import { Flex } from '@gm-pc/react'
import React, { useState } from 'react'
import SvgListOpen from '@/svg/list_open.svg'
import SvgListClose from '@/svg/list_close.svg'
import { t } from 'gm-i18n'
import _ from 'lodash'
import PlanListFilter from '@/pages/production/plan_management/plan/produce_plan/components/side/filter'
import PlanList from '@/pages/production/plan_management/plan/produce_plan/components/side/list/list'

const PlanSide = () => {
  const [visible, setVisible] = useState(true)
  const handleClose = () => {
    setVisible((v) => !v)
  }

  return (
    <Flex className='plan-side' style={{ width: visible ? 273 : 0 }}>
      <Flex className='plan-side-box' column>
        <PlanListFilter />
        <PlanList />
      </Flex>
      <Flex
        onClick={handleClose}
        className='plan-side-button'
        column
        justifyBetween
        alignCenter
      >
        {visible ? <SvgListClose /> : <SvgListOpen />}
        {t(`${visible ? '收起' : '展开'}列表`)}
      </Flex>
    </Flex>
  )
}

export default PlanSide
