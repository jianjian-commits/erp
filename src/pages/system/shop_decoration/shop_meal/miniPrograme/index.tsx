import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import './index.less'
import { observer } from 'mobx-react'
import { componentAppId, MPTYPES, HOST } from './constants'
import { Steps, FormPanel, Flex, Button, Popover, Tip } from '@gm-pc/react'

import store from './store'

const MiniPrograme: FC = observer(() => {
  const { bshop, audit } = store
  useEffect(() => {
    store.getInfo().then((data) => {
      // 未解绑
      if (data && !data.is_deleted && data.audit_id) {
        store.getLatestAuditStatus(data.authorizer_app_id)
      }
    })
  }, [])

  /** 去授权 */
  const handleAuth = () => {
    const mpType = MPTYPES.bshop
    window.open(
      `${HOST}/mp_third_party/auth?component_app_id=${componentAppId}&type=${mpType}&origin=erp`,
    )
  }
  // /** 支付设置 */
  // const handlePayInfo = () => {
  //   outterSrore.setSwitchMpPage(2)
  // }
  // /** 保存插件 */
  // const handleSavePlugin = () => {
  //   console.log('savePlugin')
  // }

  const handelAdult = () => {
    // 调取第三方上传代码
    store.codeUpload().then(() => {
      // 提交审核
      // eslint-disable-next-line promise/no-nesting
      store.submitAudit().then(() => {
        Tip.tip('成功向微信提交审核')
        window.location.reload()
      })
    })
  }
  return (
    <>
      <FormPanel title={t('微信小程序')}>
        <Steps
          data={[
            {
              description: (
                <Flex column className='b-desc-bg-color'>
                  <Flex column>
                    <p>
                      {t(
                        '使用微信小程序管理员帐号扫码进行授权，授权过程中请勾选所有权限以确保小程序功能完整性。如未注册小程序，可以从公众号后台免微信认证创建小程序或直接前往“微信公众平台”注册企业主体的小程序帐号',
                      )}
                      <span className='gm-padding-left-10'>
                        <a
                          target='_black'
                          rel='noopener noreferrer'
                          href='https://mp.weixin.qq.com'
                        >
                          {t('官方注册小程序')}
                        </a>
                      </span>
                    </p>
                  </Flex>
                  <Flex flex className='gm-margin-top-10'>
                    <Flex>
                      {!bshop || bshop?.is_deleted ? (
                        <Button type='primary' onClick={handleAuth}>
                          {t('立即授权')}
                        </Button>
                      ) : (
                        <p className='gm-text-black gm-margin-0'>
                          <span className='text-primary'>
                            {t('授权成功')}
                            {bshop?.mp_info
                              ? `【${bshop?.mp_info?.nick_name}】`
                              : null}
                            <span className='gm-padding-lr-10'>
                              <Button type='primary' onClick={handleAuth}>
                                {t('重新授权')}
                              </Button>
                            </span>
                          </span>
                        </p>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              ),
            },
            // TODO: 微信小程序
            // {
            //   description: (
            //     <Flex column className='b-desc-bg-color'>
            //       <Flex>
            //         <p>
            //           {t(
            //             '设置此项前，请提前在“微信商户平台”完成小程序支付配置',
            //           )}
            //         </p>
            //       </Flex>
            //       <Flex flex className='gm-margin-top-10'>
            //         {false && (
            //           <Flex
            //             alignCenter
            //             className='gm-margin-right-10 text-primary'
            //           >
            //             {t('设置完成')}
            //           </Flex>
            //         )}
            //         <Button
            //           type='primary'
            //           // disabled={!info || info.is_deleted}
            //           onClick={handlePayInfo}
            //         >
            //           {false ? t('重新设置') : t('支付设置')}
            //         </Button>
            //       </Flex>
            //     </Flex>
            //   ),
            // },
            // TODO: 微信小程序
            // {
            //   description: (
            //     <Flex column className='b-desc-bg-color'>
            //       <Flex column>
            //         <p>
            //           {t(
            //             '请自行申请插件后，再勾选，否则会导致小程序异常无法打开。需要点击下方重新申请审核',
            //           )}
            //         </p>
            //       </Flex>
            //       <Flex className='gm-margin-top-10' column>
            //         <Checkbox
            //         // disabled={!canSubmit}
            //         // checked={c_is_open_wechat_miniprogram_live}
            //         // onChange={handleChangePlugins.bind(
            //         //   this,
            //         //   'c_is_open_wechat_miniprogram_live',
            //         // )}
            //         >
            //           {t('直播')}
            //         </Checkbox>
            //         <div>
            //           <Button
            //             // disabled={!canSubmit}
            //             type='primary'
            //             className='gm-margin-top-10'
            //             onClick={handleSavePlugin}
            //           >
            //             {t('保存')}
            //           </Button>
            //         </div>
            //       </Flex>
            //     </Flex>
            //   ),
            // },
            {
              description: (
                <Flex column className='b-desc-bg-color'>
                  <Flex column>
                    <p>
                      {t(
                        '提交微信审核（最长14个工作日），审核通过后即可立即发布版本',
                      )}
                      {false && (
                        <Popover
                          type='hover'
                          showArrow
                          left
                          popup={
                            <div>
                              <img
                                width={300}
                                height={300}
                                src={`/mp_third_party/code/qrcode?authorizer_app_id=${bshop.authorizer_app_id}`}
                              />
                            </div>
                          }
                        >
                          <span className='gm-padding-left-10'>
                            <a href='javascript:;'>
                              {t('小程序预览二维码')}
                              {/* <SVGQr className='gm-margin-left-5' /> */}
                            </a>
                          </span>
                        </Popover>
                      )}
                    </p>
                  </Flex>
                  <Flex flex className='gm-margin-top-10'>
                    {audit && audit.status === 0 && (
                      <Flex
                        alignCenter
                        className='gm-margin-right-10 text-primary'
                      >
                        {/* <SVGCompleted className='gm-margin-right-5' /> */}
                        {t('审核成功已发布小程序')}
                      </Flex>
                    )}
                    {audit && audit.status === 1 && (
                      <Flex alignCenter className='gm-margin-right-10'>
                        <span className='gm-text-red'>
                          {/* <SVGFailure className='gm-margin-right-5' /> */}
                          {t('审核不通过，')}
                        </span>
                        <Popover
                          type='click'
                          showArrow
                          left
                          popup={
                            <div
                              className='gm-padding-5'
                              style={{ width: 300 }}
                            >
                              {audit.reason?.replace(/<br>/g, '')}
                            </div>
                          }
                        >
                          <a href='javascript:;'>
                            {t('查看原因')}
                            {/* <SVGNext style={{ fontSize: 11 }} /> */}
                          </a>
                        </Popover>
                      </Flex>
                    )}
                    {audit && audit.status === 2 ? (
                      <Flex alignCenter>
                        <span>{t('提交成功！微信审核中，请耐心等待...')}</span>
                      </Flex>
                    ) : (
                      <Button
                        type='primary'
                        className='gm-margin-right-10'
                        // disabled={!info || info.is_deleted || !canSubmit}
                        onClick={handelAdult}
                      >
                        {audit && audit.status === 0
                          ? t('重新审核')
                          : t('提交审核')}
                      </Button>
                    )}
                  </Flex>
                </Flex>
              ),
            },
          ]}
        />
      </FormPanel>
    </>
  )
})

export default MiniPrograme
