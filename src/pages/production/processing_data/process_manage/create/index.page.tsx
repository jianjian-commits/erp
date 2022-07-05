import { t } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { FormGroup, Tip } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'

import BaseData from '../components/process_detail/components/base_data'
import GuideData from '../components/process_detail/components/guide_data'
import store from '../components/process_detail/store'
import { history } from '@/common/service'

interface ProcessQuery {
  type_id: string
}

const Process = observer(() => {
  const location = useGMLocation<ProcessQuery>()
  const refBase = useRef(null)

  useEffect(() => {
    // 重置一下数据
    store.clearProcessData()
    return () => store.initData()
  }, [])

  const handleSubmit = () => {
    const { baseData } = store

    if (!baseData.name.trim()) {
      return
    }

    store.createProcess(location.query.type_id).then((json) => {
      if (json) {
        Tip.success(t('新建工序成功'))
        history.goBack()
      }
      return json
    })
  }

  const handleCancel = () => {
    history.goBack()
  }

  return (
    <FormGroup
      formRefs={[refBase]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmit}
      saveText={t('保存')}
    >
      <BaseData
        ref={refBase}
        type_id={location.query.type_id}
        viewType='create'
      />
      <GuideData />
    </FormGroup>
  )
})

export default Process
