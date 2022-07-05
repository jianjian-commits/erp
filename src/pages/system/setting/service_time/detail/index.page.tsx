import React, { useRef, useEffect } from 'react'
import { FormGroup, FormPanel, Form } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import FormComponent from '../components/form'
import store from '../store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const Create = () => {
  function handleBack() {
    history.goBack()
  }
  function handleSubmit() {
    store.updateServicePeriod().then(() => {
      handleBack()
      return null
    })
  }

  const refForm = useRef<Form>(null)
  const location = useGMLocation<{ id: string }>()
  const { id } = location.query

  useEffect(() => {
    store.getServicePeriod(id)
    return () => {
      store.initServicePeriod()
    }
  }, [id])

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_ENTERPRISE_UPDATE_SERVICE_PERIOD,
        )
      }
      formRefs={[refForm]}
      onCancel={handleBack}
      onSubmitValidated={handleSubmit}
      saveText={t('保存')}
    >
      <FormPanel title={t('运营时间配置')}>
        <FormComponent ref={refForm} />
      </FormPanel>
    </FormGroup>
  )
}

export default Create
