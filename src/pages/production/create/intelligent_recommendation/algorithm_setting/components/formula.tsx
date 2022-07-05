import { t } from 'gm-i18n'
import React from 'react'
import styled from 'styled-components'

const InfoDiv = styled.div`
  background-color: #ffefe5;
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
`

export default () => (
  <>
    <InfoDiv>
      {t('建议计划生产数 = 日均下单数 x 调整比例 x 预计备货天数')}
    </InfoDiv>
    <div className='gm-gap-20' />
    <div>
      {t(
        '公式说明：基于填写的近xx日均下单数乘以调整比例，再乘以预计备货天数计算得出在当前备货天数下的建议计划生产数。',
      )}
    </div>
    <div>
      {t(
        '示例：如选择近3天的A商品的日均下单数为100斤，调整比例为80%，预计备5天的货，则计算出来的建议计划生产数为100*80%*5=400斤。',
      )}
    </div>
  </>
)
