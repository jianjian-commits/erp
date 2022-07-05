/**
 * @description 个人中心
 */
import React, { FC, useEffect } from 'react'
import PersonalDetail from './components/personalDetail'
import LightPersonalDetail from './components/light_personal_detail'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'
import store from './store'
import './style.less'

const PersonalCenter: FC = observer(() => {
  useEffect(() => {
    return () => {
      store.initStore()
    }
  }, [])
  return globalStore.isLite ? <LightPersonalDetail /> : <PersonalDetail />
})
export default PersonalCenter
