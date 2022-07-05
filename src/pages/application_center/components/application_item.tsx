import React, { useState } from 'react'
import { Flex } from '@gm-pc/react'
import { Image, Modal, Tooltip } from 'antd'
import classNames from 'classnames'
import { AppTemplate } from 'gm_api/src/application'
import AppDetail from './app_detail'
import { Map_AppTemplate_AppType } from 'gm_api/src/application/pc'

function ApplicationItem(props: AppTemplate) {
  const { icon_url, header, label, remarks, app_type } = props
  const { is_paid } = label!
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Flex
        className='gm-application-center-item'
        onClick={() => setVisible(true)}
      >
        <Image
          className='gm-application-center-item-image'
          src={icon_url!}
          width={72}
          height={72}
          preview={false}
        />
        <Flex flex column className='gm-application-center-item-right'>
          <Flex justifyBetween>
            <div className='gm-application-center-item-right-header'>
              {header}
            </div>
            <Flex
              justifyCenter
              alignCenter
              className={classNames('gm-application-center-item-right-paid', {
                'gm-application-center-item-right-free': !is_paid,
              })}
            >
              {is_paid ? '付费' : '免费'}
            </Flex>
          </Flex>
          <div className='gm-text-desc gm-margin-tb-10'>
            <Map_AppTemplate_AppType value={app_type!} />
          </div>
          <div className='gm-application-center-item-right-description'>
            <Tooltip title={remarks}>{remarks}</Tooltip>
          </div>
        </Flex>
      </Flex>
      <Modal
        width={540}
        visible={visible}
        footer={null}
        destroyOnClose
        centered
        bodyStyle={{ paddingLeft: 0, paddingBottom: 0, paddingRight: 0 }}
        onCancel={() => {
          setVisible(false)
        }}
      >
        <AppDetail {...props} />
      </Modal>
    </>
  )
}

export default ApplicationItem
