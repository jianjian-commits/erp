import React, { useEffect } from 'react'
import Header from './components/header'
import List from './components/list'
import { BoxPanel } from '@gm-pc/react'
import { t } from 'gm-i18n'
import '../style.less'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import store from './store'
const Index = observer(() => {
  const location = useGMLocation<{ advanced_order_id: string }>()
  useEffect(() => {
    store.getDetail(location.query.advanced_order_id)
  }, [])
  return (
    <div className='prepay_order_detail'>
      <Header />
      <BoxPanel title={t('餐次明细')} collapse>
        <List />
      </BoxPanel>
    </div>
  )
})

export default Index
