import React, { FC, useEffect } from 'react'
import { Col, Row } from 'antd'
import CycleLeft from './components/left'
import CycleRight from './components/right'
import store from './store'
import './style.less'
import { observer } from 'mobx-react'

interface CycleProps {
  quotation_id: string
}

const Cycle: FC<CycleProps> = observer(({ quotation_id }) => {
  const { clearStore } = store

  useEffect(() => {
    return () => clearStore()
  }, [])

  return (
    <Row className='cycle_quotation'>
      <Col className='cycle_quotation_left'>
        <CycleLeft />
      </Col>
      <Col className='cycle_quotation_right'>
        <CycleRight />
      </Col>
    </Row>
  )
})

export default Cycle
