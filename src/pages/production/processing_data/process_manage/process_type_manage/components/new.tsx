import { t } from 'gm-i18n'
import React, { ChangeEvent, useState } from 'react'
import { Flex, Input, Button, Dialog, Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'

import store from '../store'

const NewProcessType = observer(() => {
  const [name, setName] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleCancel = () => {
    Dialog.hide()
  }

  const handleCreateProcessType = () => {
    if (!name.trim()) {
      Tip.danger(t('请输入类型名称'))
      return
    }

    store.createProcessType(name.trim()).then((json) => {
      if (json) {
        Tip.success(t('新建工序类型成功'))
        Dialog.hide()
        store.doRequest()
      }
      return json
    })
  }

  return (
    <>
      <div>
        {t('类型名称: ')}
        <Input
          maxLength={30}
          type='text'
          value={name}
          style={{ width: '220px' }}
          placeholder={t('最多输入30个中文字符')}
          onChange={handleInputChange}
        />
      </div>
      <Flex justifyEnd className='gm-padding-top-10'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button
          htmlType='submit'
          type='primary'
          onClick={handleCreateProcessType}
        >
          {t('确定')}
        </Button>
      </Flex>
    </>
  )
})

export default NewProcessType
