import React, { FC, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { FormGroup, Tip } from '@gm-pc/react'
import { gmHistory, useGMLocation } from '@gm-common/router'
import { BaseInfo } from '../components'
import { t } from 'gm-i18n'
import store from '../store'

export interface CustomerDetailLocationQuery {
  warehouse_id: string
}

const CreateWarehouse: FC<{}> = observer(() => {
  const form1 = useRef(null)
  const location = useGMLocation<CustomerDetailLocationQuery>()
  const { getWarehouseInfo, clear, createParams } = store
  const _handleCreate = async () => {
    try {
      await store.updateWareHouse(createParams, 'detail')
      _handleCancel()
    } catch (err) {
      if (!/\d/.test(err?.message)) {
        // 这里只要表单校验错误的提示
        Tip.danger(err?.message)
      }
    }
  }

  const _handleCancel = () => {
    gmHistory.go(-1)
  }

  useEffect(() => {
    const { warehouse_id } = location.query
    getWarehouseInfo(warehouse_id)
    return clear
  }, [])

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
