import React, { FC, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { FormGroup, Tip } from '@gm-pc/react'
import { gmHistory } from '@gm-common/router'
import { BaseInfo } from '../components'
import { t } from 'gm-i18n'
import store from '../store'

const CreateWarehouse: FC<{}> = observer(() => {
  const form1 = useRef(null)
  const { createHouseware, clear } = store

  const _handleCancel = () => {
    gmHistory.go(-1)
  }

  const _handleCreate = async () => {
    try {
      await createHouseware()
      // 创建成功之后返回列表页
      _handleCancel()
    } catch (err) {
      if (!/\d/.test(err?.message)) {
        // 这里只要表单校验错误的提示
        Tip.danger(err?.message)
      }
    }
  }

  useEffect(() => clear, [])

  return (
    <>
      <FormGroup
        formRefs={[form1]}
        onSubmit={_handleCreate}
        onCancel={_handleCancel}
        saveText={t('保存')}
      >
        <BaseInfo ref={form1} store={store} />
      </FormGroup>
    </>
  )
})

export default CreateWarehouse
