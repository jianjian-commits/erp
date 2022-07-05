import React, { useRef, useEffect } from 'react'
import { FormGroup, FormPanel, Form } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import FormComponent from '../components/form'
import store from '../store'

const Create = () => {
  function handleBack() {
    history.goBack()
  }
  function handleSubmit() {
    store.createServicePeriod().then(() => {
      handleBack()
      return null
    })
  }

  useEffect(() => {
    return () => {
      store.initServicePeriod()
    }
  }, [])

  const refForm = useRef<Form>(null)
  return (
    <FormGroup
      formRefs={[refForm]}
      onCancel={handleBack}
      onSubmitValidated={handleSubmit}
      saveText={t('添加')}
    >
      <FormPanel title={t('运营时间配置')}>
        <FormComponent ref={refForm} />
      </FormPanel>
    </FormGroup>
  )
}

export default Create
