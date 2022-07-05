import React, { FC, useEffect, useRef } from 'react'
import { gmHistory, useGMLocation } from '@gm-common/router'
import store from './store'
import { FormGroup, Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'

import BasicInfo from './basicInfo'
import UserInfo from './userInfo'

interface GroupUserDetailLocationQuery {
  group_user_id: string
}

const Detail: FC = () => {
  const location = useGMLocation<GroupUserDetailLocationQuery>()
  const { group_user_id } = location.query
  const form1 = useRef(null)
  const form2 = useRef(null)
  useEffect(() => {
    if (group_user_id) {
      store
        .fetchGroupUser(group_user_id)
        .then(() => store.initForm(store.groupUser, store.roles))
    }
    return store.initStore()
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
    if (group_user_id) {
      Promise.all([
        store.updateGroupUser(),
        store.updateGroupUserRole(group_user_id),
      ]).then(
        () => {
          Tip.success(t('保存成功'))
          return _handleCancel()
        },
        (error) => {
          return Tip.danger(t(`修改失败：${error}`))
        },
      )
      return
    }

    store
      .createGroupUser()
      .then((res) => store.updateGroupUserRole(res.group_user.group_user_id))
      .then(() => {
        Tip.success(t('创建成功'))
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
      <UserInfo ref={form2} store={store} />
    </FormGroup>
  )
}

export default observer(Detail)
