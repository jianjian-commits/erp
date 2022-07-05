import React, { useRef, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  FormPanel,
  Form,
  FormGroup,
  Tip,
  Flex,
  FormItem,
  RadioGroup,
  Radio,
} from '@gm-pc/react'
import classNames from 'classnames'

import { Swiper, SelectModule } from '../../common'
import { Shop_Type, ShopLayout_Type } from 'gm_api/src/preference'
import BannerPart from '../../common/banner'

import store from '../store'
import header from 'img/diy_header.png'
import footer from 'img/diy_footer.jpg'
import footerSocial from 'img/diy_footer_social.jpg'
import './style.less'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import Notice from './components/notice'
import { ImageType } from '../../common/interface'

const handleCancel = () => {
  store.getData()
}

const handleSubmitPre = () => {
  store.update().then(() => {
    return Tip.success(t('修改成功'))
  })
}

const ShopDecoration = () => {
  const refPanel = useRef<React.RefObject<Form> | null>(null)
  const refSort = useRef<React.RefObject<Form> | null>(null)
  const [showId, setShowId] = useState('banner')

  useEffect(() => {
    store.getData()
  }, [])

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_SOCIAL_SHOP_LAYOUT,
        )
      }
      formRefs={[refPanel, refSort] as React.RefObject<Form>[]}
      onSubmit={handleSubmitPre}
      onCancel={handleCancel}
    >
      {/* todo: 暂时设置高度溢出，目前只有banner模块，不够高度 */}
      <div style={{ height: '1000px' }}>
        <div className='top-tip gm-margin-top-10 gm-padding-left-20'>
          {t(
            '提示：点击模块进行编辑，支持添加广告位模块；左侧页面区域仅作为示例图展示，真实效果请参考商城上架效果。',
          )}
        </div>
        {!globalStore.isLite && (
          <FormPanel title={t('店铺类型')}>
            <Form colWidth='600px' ref={refSort as React.RefObject<Form>}>
              <FormItem label={t('选择店铺类型')}>
                <RadioGroup
                  value={store.layoutType}
                  onChange={store._handleChangeShopSort}
                >
                  <Flex column>
                    <Flex className='gm-margin-bottom-10'>
                      <Radio value={ShopLayout_Type.TYPE_WITHOUT_TIME} />
                      <div>
                        {t('社区餐饮类型')}
                        <div className='gm-text-desc'>
                          {t('非菜谱情况的商城适用于社会餐饮类型客户')}
                        </div>
                      </div>
                    </Flex>
                    <Flex>
                      <Radio value={ShopLayout_Type.TYPE_WITH_TIME} />
                      <div>
                        {t('团餐/学生餐类型')}
                        <div className='gm-text-desc'>
                          {t('针对按菜谱下单的客户，适用于团餐，食堂性质客户')}
                        </div>
                      </div>
                    </Flex>
                  </Flex>
                </RadioGroup>
              </FormItem>
            </Form>
          </FormPanel>
        )}
        <FormPanel title={t('店铺装修')}>
          <Form ref={refPanel as React.RefObject<Form>}>
            <Flex className='diy-shop' column justifyBetween>
              <div>
                <img className='diy-shop-header' src={header} />
                <SelectModule
                  left={
                    <Swiper
                      delay={3000}
                      width={368}
                      onClick={() => setShowId('banner')}
                      className={classNames('diy-shop-box', {
                        'diy-shop-box-active': showId === 'banner',
                      })}
                      size={store.banners.length}
                      renderItem={(i: number) => (
                        <img
                          style={{ width: '368px', height: '165px' }}
                          src={store.banners[i].image.url}
                        />
                      )}
                    />
                  }
                  hideRight={showId !== 'banner'}
                  rightTitle={t('首页轮播图')}
                  right={
                    <BannerPart
                      shopType={Shop_Type.TYPE_EDUCATION}
                      data={toJS(store.banners)}
                      onChange={store._handleChangeBanners}
                    />
                  }
                />
                {store.layoutType === ShopLayout_Type.TYPE_WITH_TIME ? (
                  <>
                    <Flex>
                      <div className='static-box'>{t('开始点餐')}</div>
                      <div className='static-box'>{t('我的订单')}</div>
                    </Flex>
                    <SelectModule
                      left={
                        <div
                          className={classNames(
                            'diy-shop-box',
                            {
                              'diy-shop-box-active': showId === 'notice',
                            },
                            'notice-box',
                          )}
                          onClick={() => {
                            setShowId('notice')
                          }}
                        >
                          <div className='notice-box-title'>
                            {store.noticeTitle}
                          </div>
                          <img src={store.noticeImageUrl?.url} />
                        </div>
                      }
                      rightTitle={t('通知栏')}
                      hideRight={showId !== 'notice'}
                      right={
                        <Notice
                          title={store.noticeTitle}
                          imageUrl={[store.noticeImageUrl as ImageType]}
                          content={store.noticeContent}
                          onChangeTitle={store._handleChangeNoticeTitle}
                          onChangeImage={store._handleChangeNoticeImageUrl}
                          onChangeContent={store._handleChangeNoticeContent}
                        />
                      }
                    />
                  </>
                ) : null}
              </div>
              {store.layoutType === ShopLayout_Type.TYPE_WITH_TIME ? (
                <img className='diy-shop-footer' src={footer} />
              ) : (
                <img className='diy-shop-footer' src={footerSocial} />
              )}
            </Flex>
          </Form>
        </FormPanel>
      </div>
    </FormGroup>
  )
}

export default observer(ShopDecoration)
