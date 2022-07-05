import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Box } from '@gm-pc/react'
import { Prompt } from 'react-router-dom'

import PanelHeader from '../../../components/panel_header'
import RecommendSteps from '../components/recommend_steps'
import RecommendLoading from './components/loading'
import AlgorithmSetting from './components/algorithm_setting'
import Formula from './components/formula'
import Actions from './components/actions'
import store from '../store'
import '../style.less'

export default observer(() => {
  const { recommendLoading } = store

  useEffect(() => {
    const beforeLeave = (e: any) => {
      e.preventDefault()
      e.returnValue = t('离开当前页后，所编辑的数据将不可恢复')
    }
    window.addEventListener('beforeunload', beforeLeave)
    return () => {
      window.removeEventListener('beforeunload', beforeLeave)
    }
  }, [])

  const promptMessage = (location: any) => {
    const toPathName = location.pathname
    return toPathName === '/production/task/production_task/recommend_product'
      ? true
      : t('运算方案执行中，是否放弃执行')
  }

  return (
    <Box hasGap>
      <Prompt when={recommendLoading} message={promptMessage} />
      {/* 运算执行进度条遮罩 */}
      {recommendLoading && <RecommendLoading />}
      <RecommendSteps activeStep={1} />
      <PanelHeader
        title={t('算法说明')}
        className='gm-margin-top-20'
        underline
      />
      <Formula />
      <PanelHeader
        title={t('算法配置')}
        className='gm-margin-top-20'
        underline
      />
      <AlgorithmSetting showProductShowType />
      <Actions />
    </Box>
  )
})
