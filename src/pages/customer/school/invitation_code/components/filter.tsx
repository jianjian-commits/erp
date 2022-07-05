import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  MoreSelect,
} from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'

import store from '../store'

const Filter: FC = observer(() => {
  const {
    filter: { school_id },
    schoolList, // 学校列表
    createInvitationCode, // 请求生成邀请码
    fetchInvitationCodeList, // 请求邀请码列表
    fetchSchoolList, // 请求学校
  } = store
  useEffect(() => {
    fetchInvitationCodeList()
    fetchSchoolList()
  }, [])

  const handleCreate = () => {
    createInvitationCode()
  }

  const handleMoreSelect = (
    select: MoreSelectDataItem<string>[],
    key: string,
  ) => {
    store.updateFilter(select, key)
  }
  return (
    <>
      <BoxForm onSubmit={handleCreate}>
        <FormItem label={t('学校')}>
          <MoreSelect
            data={schoolList}
            selected={school_id}
            placeholder={t('请选择学校')}
            onSelect={(select: MoreSelectDataItem<string>[]) => {
              handleMoreSelect(select, 'school_id')
            }}
          />
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('生成邀请码')}
          </Button>
        </FormButton>
      </BoxForm>
    </>
  )
})

export default Filter
