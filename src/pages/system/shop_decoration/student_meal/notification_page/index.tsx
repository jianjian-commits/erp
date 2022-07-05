import React, { useEffect, useState, useRef } from 'react'
import { Flex, FormPanel } from '@gm-pc/react'
import './style.less'
import { t } from 'gm-i18n'
import left from '@/img/notification_left.png'
import middle from '@/img/notification_middle.png'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { Input, Button, message } from 'antd'
import { gmHistory as history } from '@gm-common/router'
import store from './store'
import { observer, Observer } from 'mobx-react'

const { TextArea } = Input

interface InputRefProps {
  focus: () => void
  blur: () => void
}

const NotificationPage = observer(() => {
  const { getNotice, create, setAnnouncement } = store
  const InputRef = useRef<InputRefProps>(null)
  const InputRef2 = useRef<InputRefProps>(null)
  useEffect(() => {
    getNotice()
  }, [])
  const handleTitle = (value: string) => {
    message.destroy()
    if (value?.length === 8) {
      message.warning(t('已达到字数限制'))
    }
    setAnnouncement('head', value)
  }
  const handleContent = (value: string) => {
    message.destroy()
    if (value?.length === 600) {
      message.warning(t('已达到字数限制'))
    }
    setAnnouncement('body', value)
  }
  const onCancel = () => {
    history.push('/home')
  }

  const handleSave = () => {
    create().then(() => {
      message.success(t('修改成功'))
    })
  }

  // 高亮
  const handleFocus = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    type?: string,
  ) => {
    e.stopPropagation()
    if (type === 'head') {
      InputRef.current && InputRef.current.focus()
      InputRef2.current && InputRef2.current.blur()
    }
    if (type === 'body') {
      InputRef.current && InputRef.current.blur()
      InputRef2.current && InputRef2.current.focus()
    }
  }
  return (
    <div className='notification'>
      <FormPanel title={t('通知页编辑')}>
        <Flex alignCenter onClick={(e) => handleFocus(e)}>
          <img src={left} className='notification-page-left' />
          <span className='gm-text-14 gm-margin-left-10'>{'>>>>'}</span>
          <div className='notification-page-middle'>
            <img src={middle} style={{ width: '200px' }} />
            <Observer>
              {() => {
                return (
                  <>
                    <span
                      className='middle-title'
                      onClick={(e) => handleFocus(e, 'head')}
                    >
                      {store.announcement?.head!}
                    </span>
                    <span
                      className='middle-content'
                      onClick={(e) => handleFocus(e, 'body')}
                    >
                      {store.announcement?.body!}
                    </span>
                  </>
                )
              }}
            </Observer>
          </div>
          <div>
            <div className='notification-border'>
              <Flex justifyStart className='title'>
                <span style={{ width: '50px' }}>{t('标题:')}</span>
                <div className='textArea-limit'>
                  <TextArea
                    ref={InputRef}
                    placeholder={t('请输入标题')}
                    maxLength={8}
                    value={store?.announcement?.head}
                    style={{ height: '60px' }}
                    showCount
                    onChange={(value) => handleTitle(value.target.value)}
                  />
                </div>
              </Flex>
            </div>
            <div className='notification-border'>
              <Flex justifyStart>
                <span style={{ width: '50px' }}>{t('正文:')}</span>
                <div className='textArea-limit'>
                  <TextArea
                    ref={InputRef2}
                    className='textArea-limit'
                    placeholder={t('请输入正文')}
                    style={{ height: '300px' }}
                    maxLength={600}
                    showCount
                    value={store?.announcement?.body}
                    onChange={(value) => handleContent(value.target.value)}
                  />
                  {/* {store?.announcement?.body ? (
                    <span>
                      {t(
                        `还能输入${Big(600).minus(
                          store.announcement.body.length,
                        )}个字`,
                      )}
                    </span>
                  ) : (
                    <span>{t('字数限制600字')}</span>
                  )} */}
                </div>
              </Flex>
            </div>
          </div>
        </Flex>
      </FormPanel>
      <ButtonGroupFixed
        onCancel={onCancel}
        ButtonNode={
          <Button onClick={handleSave} type='primary'>
            {t('保存')}
          </Button>
        }
      />
    </div>
  )
})

export default NotificationPage
