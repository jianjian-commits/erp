import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Box } from '@gm-pc/react'

import RecommendSteps from '../components/recommend_steps'
import PanelHeader from '../../../components/panel_header'
import Filter from './components/filter'
import List from './components/list'
import store from '../store'
import '../style.less'
import Actions from './components/actions'

const RecommendProduct = observer(() => {
  const { recommendSkuList } = store

  return (
    <Box hasGap>
      <RecommendSteps activeStep={2} />
      <PanelHeader
        title={t('预生产计划信息')}
        className='gm-margin-top-20 gm-margin-bottom-20'
        underline
      />
      <Filter />
      <PanelHeader
        title={t('推荐生产商品列表：') + recommendSkuList.length}
        className='gm-margin-top-20'
        underline
      />
      <List />
      <Actions />
    </Box>
  )
})

export default RecommendProduct
