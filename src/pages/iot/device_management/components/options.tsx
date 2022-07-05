import React, { FC, ReactNode, useRef } from 'react'
import { t } from 'gm-i18n'
import { Flex, Modal, Button, Popover } from '@gm-pc/react'
import { history } from '@/common/service'
import '../style.less'

interface OptionsProps {
  url: string
  name: string
  onDelete: () => void
  children?: ReactNode
}

const Options: FC<OptionsProps> = ({ url, onDelete, children, name = '1' }) => {
  const popoverRef = useRef<Popover>(null)

  const handleEdit = () => {
    history.push(url)
  }

  const handleDeleteOk = () => {
    popoverRef.current!.apiDoSetActive(false)
    onDelete()
  }

  return (
    <Flex className='option-cursor'>
      {children}
      <a onClick={handleEdit}>{t('编辑')}</a>
      <Popover
        ref={popoverRef}
        type='click'
        right
        popup={
          <Flex
            className='option_box gm-margin-10'
            alignCenter
            justifyCenter
            column
          >
            <div className='gm-margin-bottom-10'>{t(`确认删除${name}吗?`)}</div>
            <div>
              <Button
                onClick={() => popoverRef.current!.apiDoSetActive(false)}
                className='gm-margin-right-10 '
              >
                {t('取消')}
              </Button>
              <Button type='danger' onClick={handleDeleteOk}>
                {t('确认')}
              </Button>
            </div>
          </Flex>
        }
      >
        <a className='gm-margin-left-10'>{t('删除')}</a>
      </Popover>
    </Flex>
  )
}

export default Options
