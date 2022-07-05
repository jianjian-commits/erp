import { t } from 'gm-i18n'
import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { FormGroup, Tip, Confirm } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'

import BaseData from '../components/process_detail/components/base_data'
import GuideData from '../components/process_detail/components/guide_data'
import store from '../components/process_detail/store'
import { history } from '@/common/service'

interface ProcessQuery {
  viewType?: string
  id?: string
}

const Detail = observer(() => {
  const location = useGMLocation<ProcessQuery>()
  const refBase = useRef(null)

  // 详情拉取工序信息
  useEffect(() => {
    const { query } = location
    store.getProcess(query.id)
    return () => store.initData()
  }, [location])

  const handleSubmit = () => {
    // 编辑态需要弹窗确认
    const { query } = location
    const { baseData } = store

    if (!baseData.name.trim()) {
      return
    }

    Confirm({
      title: t('编辑工序'),
      children: (
        <div>{t('编辑工序后只影响未生成的计划，已生成的计划不受影响')}</div>
      ),
      read: t('我已阅读以上提示，确认更新工序信息'),
    })
      .then(() => {
        return store.updateProcess(query.id!)
      })
      .then((json) => {
        if (json) {
          Tip.success(t('更新工序成功'))
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
      <BaseData ref={refBase} viewType='detail' />
      <GuideData />
    </FormGroup>
  )
})

export default Detail
