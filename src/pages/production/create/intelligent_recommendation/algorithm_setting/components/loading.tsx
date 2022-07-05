import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex, Progress, LoadingChunk } from '@gm-pc/react'
import styled from 'styled-components'

import store from '../../store'

const LoadingDiv = styled.div`
  width: 400px;
  margin: 20px 0 0 50px;
`

const RecommendLoading = observer(() => {
  const { recommendLoading, loadingProgress } = store
  return (
    <>
      <div className='gm-modal-mask' />
      <Flex justifyCenter alignCenter column className='gm-modal'>
        <LoadingChunk text={t('运算方案执行中')} loading={recommendLoading}>
          <LoadingDiv>
            <Progress percentage={loadingProgress} type='success' />
          </LoadingDiv>
        </LoadingChunk>
      </Flex>
    </>
  )
})

export default RecommendLoading
