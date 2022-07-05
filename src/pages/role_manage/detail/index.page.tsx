import React, { FC, useEffect, useRef } from 'react'
import { gmHistory, useGMLocation } from '@gm-common/router'
import store from './store'
import { FormGroup, Tip, SessionStorage } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'

import BasicInfo from './basic_info'
import RoleAuth from './role_auth'
import { initPermissionOptionList } from './init'
import { PermissionOption } from './type'

interface RoleDetailLocationQuery {
  role_id: string
}

const Detail: FC = () => {
  const location = useGMLocation<RoleDetailLocationQuery>()
  const { role_id } = location.query
  const form1 = useRef(null)
  const form2 = useRef(null)

  const getOptionListByCeres = (group_id: string) => {
    return store.fetchGroupPermission(group_id).then((res) => {
      const permissions = res.permissions || []
      return initPermissionOptionList(group_id, permissions)
    })
  }

  const getOptionListByStorage = (group_id: string) => {
    return SessionStorage.get(`permission_option_list_${group_id}`)
  }

  const initFormValue = () => {
    store.fetchRole(role_id).then((res) => {
      store.initLevelValue(res.permissions || [])
      return store.initForm(res.role)
    })
  }

  const initForm = (optionList: PermissionOption[]) => {
    store.setOptionList(optionList)
    if (role_id) {
      initFormValue()
    }
  }

  useEffect(() => {
    const group_id = globalStore.userInfo.group_id || ''
    const optionList = getOptionListByStorage(group_id)
    if (optionList) {
      initForm(optionList)
    } else {
      getOptionListByCeres(group_id).then((optionList) => {
        initForm(optionList)
        return SessionStorage.set(
          `permission_option_list_${group_id}`,
          optionList,
        )
      })
    }
    return () => {
      store.initStore()
    }
  }, [])

  const _handleCancel = () => {
    gmHistory.go(-1)
  }
  const _handleSave = () => {
    const [verifyResult, verifyMessage] = store.verifyForm()
    if (verifyResult === 'fail') {
      Tip.danger(t(verifyMessage))
      return
    }
    if (role_id) {
      store.updateRolePermission(role_id).then(() => {
        Tip.success(t('保存成功'))
        return _handleCancel()
      })
      return
    }
    store
      .createRole()
      .then((res) => store.updateRolePermission(res.role.role_id))
      .then(() => {
        Tip.success(t('保存成功'))
        return _handleCancel()
      })
  }

  return (
    <FormGroup
      formRefs={[form1, form2]}
      onSubmit={_handleSave}
      onCancel={_handleCancel}
      saveText={t('保存')}
    >
      <BasicInfo ref={form1} store={store} />
      <RoleAuth ref={form2} store={store} />
    </FormGroup>
  )
}

export default observer(Detail)
