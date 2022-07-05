import React from 'react'
import { observer } from 'mobx-react'
import { Col, Row } from '@gm-pc/react'
import OperatingBulletin from './component/operation_bulletin'
import CommonFunction from './component/common_function'
import Profix from './component/profix'
import AnalyseMerchant from './component/analyse_merchant'
import './style.less'

const Home = observer(() => {
  return (
    <Col
      style={{ backgroundColor: '#f6f7fb' }}
      className='gm-padding-lr-20 gm-padding-tb-10 b-home'
    >
      <Row>
        <Col className='b-home-top-left' lg={18} md={24} sm={24}>
          {/* 运营简报 */}
          <OperatingBulletin />
        </Col>
        <Col lg={6} md={24} sm={24} className='b-home-top-right'>
          {/* 常用功能 */}
          <CommonFunction />
        </Col>
      </Row>
      <Row className='gm-padding-top-10'>
        <Col lg={12} md={24} sm={24} className='gm-padding-right-5'>
          {/* 销售额趋势 */}
          <Profix />
        </Col>
        {/* <Col lg={8} md={24} sm={24} className='gm-padding-lr-10'> */}
        {/*  /!* 分类统计 *!/ */}
        {/*  <AnalyseSkus /> */}
        {/* </Col> */}
        <Col lg={12} md={24} sm={24} className='gm-padding-left-5'>
          {/* 商户销量排行 */}
          <AnalyseMerchant />
        </Col>
      </Row>
    </Col>
  )
})

export default Home
