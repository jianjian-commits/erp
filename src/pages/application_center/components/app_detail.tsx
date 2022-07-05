import React from 'react'
import { Flex } from '@gm-pc/react'
import { Button } from 'antd'
import {
  AppTemplate,
  AppTemplate_AppType,
  AppTemplate_Description,
  AppTemplate_Description_Type,
} from 'gm_api/src/application'
import { QRCodeCanvas } from 'qrcode.react'
import classNames from 'classnames'

function AppDetail({
  header,
  descriptions,
  function_introduction,
  app_type,
  document_url,
}: AppTemplate) {
  let isAppOrAppletOrPC =
    app_type === AppTemplate_AppType.APPTYPE_APPLET_APP_PCCLIENT
  const isSystem =
    app_type === AppTemplate_AppType.APPTYPE_SYSTEM_FEATURES_EXPANSION &&
    !![document_url].filter(Boolean).length
  let app: AppTemplate_Description | null = null
  let applet: AppTemplate_Description | null = null
  let pc: AppTemplate_Description | null = null
  if (isAppOrAppletOrPC) {
    descriptions?.descriptions!.forEach((item) => {
      const { type } = item
      switch (type) {
        case AppTemplate_Description_Type.TYPE_APP:
          app = item
          break
        case AppTemplate_Description_Type.TYPE_APPLET:
          applet = item
          break
        case AppTemplate_Description_Type.TYPE_PC:
          pc = item
          break
        default:
          break
      }
    })
  }
  isAppOrAppletOrPC = !![app, applet, pc].filter(Boolean).length

  return (
    <div>
      <div className='gm-application-center-template-detail-header'>
        {header}
      </div>

      <div className='gm-application-center-template-detail-introduction'>
        {function_introduction!
          .split('\n')
          .map((item: string, index: number) => (
            <div key={index}>{item}</div>
          ))}
      </div>
      {isAppOrAppletOrPC || isSystem ? (
        <Flex
          justifyAround
          className={classNames(
            'gm-application-center-template-detail-bottom',
            {
              'gm-application-center-template-detail-bottom-download':
                isAppOrAppletOrPC,
            },
          )}
        >
          {isAppOrAppletOrPC && (
            <>
              {app && (
                <Flex column alignCenter>
                  <QRCodeCanvas
                    value={(app as AppTemplate_Description).path}
                    style={{ width: 96, height: 96 }}
                  />
                  <div className='gm-margin-top-15 gm-text-16'>扫描下载App</div>
                </Flex>
              )}
              {applet && (
                <Flex column alignCenter>
                  <img
                    src={(applet as AppTemplate_Description).path}
                    style={{ width: 96, height: 96 }}
                  />
                  <div className='gm-margin-top-15 gm-text-16'>
                    扫描体验小程序
                  </div>
                </Flex>
              )}
              {pc && (
                <Flex alignCenter column>
                  <div className='gm-application-center-template-detail-bottom-windows' />
                  <div className='gm-margin-top-10 gm-text-12'>
                    仅支持Windows系统
                  </div>
                  <Button
                    className='gm-application-center-template-detail-bottom-ghost-button gm-application-center-template-detail-bottom-pc-download'
                    style={{ marginTop: 17, height: 32, border: '1px solid' }}
                    href={(pc as AppTemplate_Description).path}
                    target='_blank'
                  >
                    电脑端下载
                  </Button>
                </Flex>
              )}
            </>
          )}
          {isSystem && (
            <>
              <Button
                type='ghost'
                hidden={!document_url}
                href={document_url}
                target='_blank'
                className='gm-application-center-template-detail-bottom-ghost-button gm-application-center-template-detail-bottom-large-button'
              >
                帮助文档
              </Button>
              {/* <Button
                className='gm-application-center-template-detail-bottom-large-button'
                type='primary'
              >
                {label?.function_switch ? '关闭' : '开启'}功能
              </Button> */}
            </>
          )}
        </Flex>
      ) : null}
    </div>
  )
}

export default AppDetail
