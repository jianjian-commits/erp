import React, { useRef, useEffect } from 'react'
import { FormGroup, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

import store from '../store'

import BaseSetting from './base'
import Register from './register'
import Inspection from './inspection'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

function getInitData() {
  store.getData()
  store.getListServicePeriod()
  store.getListQuotation()
}

const Base = () => {
  const refBaseFrom = useRef(null)
  const refRgisterFrom = useRef(null)
  const refInspectionFrom = useRef(null)
  useEffect(() => {
    getInitData()
  }, [])
  const handleCancel = () => {
    getInitData()
  }

  const handleSubmitPre = () => {
    store.update().then(() => {
      return Tip.success(t('保存成功'))
    })
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_SOCIAL_SHOP_LAYOUT,
        )
      }
      formRefs={[refBaseFrom, refRgisterFrom]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmitPre}
    >
      <BaseSetting ref={refBaseFrom} storeDetail={store} />
      <Inspection ref={refInspectionFrom} storeDetail={store} />
      <Register ref={refRgisterFrom} storeDetail={store} />
    </FormGroup>
  )
}

export default Base
