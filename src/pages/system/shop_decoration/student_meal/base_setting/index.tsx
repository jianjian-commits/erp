import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { FormGroup, Form, Tip } from '@gm-pc/react'

import store from '../store'
import Base from './base'
import Rule from './rule'
import Means from './means'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const Base_Setting = () => {
  const refBaseForm = useRef<Form>(null)
  const refRuleForm = useRef<Form>(null)
  const refMeansForm = useRef<Form>(null)
  useEffect(() => {
    store.getData()
  }, [])

  const handleCancel = () => {
    store.getData()
  }

  const handleSubmitPre = () => {
    store.update().then(() => {
      return Tip.success(t('修改成功'))
    })
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_EDUCATION_SHOP_LAYOUT,
        )
      }
      formRefs={[refBaseForm, refRuleForm, refMeansForm]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmitPre}
    >
      {/* 店铺设置 */}
      <Base ref={refBaseForm} storeDetail={store} />
      {/* 规则设置 */}
      <Rule ref={refRuleForm} storeDetail={store} />
      {/* 资料配置 */}
      <Means ref={refMeansForm} storeDetail={store} />
    </FormGroup>
  )
}

export default observer(Base_Setting)
