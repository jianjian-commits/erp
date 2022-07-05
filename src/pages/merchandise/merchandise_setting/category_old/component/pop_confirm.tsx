import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { Button, Flex } from '@gm-pc/react'
import SvgRemove from '@/svg/remove.svg'
import { is } from '@gm-common/tool'
import { popConfirmOptions } from '../../../manage/interface'

const PopConfirm: FC<popConfirmOptions> = ({
  title,
  value,
  content,
  onOkText,
  onOkType,
  onOk,
  onHighlight,
}) => {
  const { addRef, deleteRef } = value

  const handleCancel = () => {
    addRef && addRef.apiDoSetActive()
    deleteRef && deleteRef.apiDoSetActive()
  }

  useEffect(() => {
    value.highlight = true
    onHighlight()
    return () => {
      value.highlight = false
      onHighlight()
    }
  }, [])

  const handleOk = () => {
    const result = onOk()
    if (!is.promise(result)) {
      console.error(t('请传入一个Promise对象'))
      return
    }
    Promise.resolve(result).finally(() => handleCancel())
  }

  return (
    <div
      className='gm-padding-lr-15 gm-padding-tb-10'
      style={{ minWidth: '420px' }}
    >
      <Flex alignCenter>
        <div className='b-category-icon-div' />
        <div className='gm-gap-10' />
        <Flex flex={1} className='gm-text-14' style={{ fontWeight: 'bold' }}>
          {title}
        </Flex>
        <Button
          className='btn'
          style={{ fontSize: '18px' }}
          onClick={handleCancel}
        >
          <SvgRemove />
        </Button>
      </Flex>
      <div className='gm-padding-tb-10 gm-padding-lr-15'>{content}</div>
      <Flex justifyEnd alignCenter className='gm-padding-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button
          type={onOkType === 'primary' ? 'primary' : 'danger'}
          onClick={handleOk}
        >
          {onOkText || t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default PopConfirm
