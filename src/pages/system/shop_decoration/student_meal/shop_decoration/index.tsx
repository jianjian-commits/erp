import React, { useRef, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { t } from 'gm-i18n'
import { FormPanel, Form, FormGroup, Tip, Flex } from '@gm-pc/react'
import styled from 'styled-components'
import classNames from 'classnames'

import { Swiper, SelectModule } from '../../common'
import { Shop_Type } from 'gm_api/src/preference'
import BannerPart from '../../common/banner'

import store from '../store'
import header from 'img/diy_header.png'
import footer from 'img/diy_footer.jpg'
import './style.less'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const TopTip = styled.div`
  height: 36;
  line-height: 36px;
  background: #e8f0ff;
`

const handleCancel = () => {
  store.getData()
}

const handleSubmitPre = () => {
  store.update().then(() => {
    return Tip.success(t('修改成功'))
  })
}

const ShopDecoration = () => {
  const ref = useRef<React.RefObject<Form> | null>(null)
  const [showId, setShowId] = useState('banner')

  useEffect(() => {
    store.getData()
  }, [])

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_EDUCATION_SHOP_LAYOUT,
        )
      }
      formRefs={[ref as React.RefObject<Form>]}
      onSubmit={handleSubmitPre}
      onCancel={handleCancel}
    >
      {/* todo: 暂时设置高度溢出，目前只有banner模块，不够高度 */}
      <div style={{ height: '1000px' }}>
        <TopTip className='gm-margin-top-10 gm-padding-left-20'>
          {t(
            '提示：点击模块进行编辑，支持添加广告位模块；左侧页面区域仅作为示例图展示，真实效果请参考商城上架效果。',
          )}
        </TopTip>
        <FormPanel title={t('店铺装修')}>
          <Form ref={ref as React.RefObject<Form>}>
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
                  rightTitle={t('首页轮播图')}
                  right={
                    <BannerPart
                      shopType={Shop_Type.TYPE_EDUCATION}
                      data={toJS(store.banners)}
                      onChange={store._handleChangeBanners}
                    />
                  }
                />
              </div>
              <img className='diy-shop-footer' src={footer} />
            </Flex>
          </Form>
        </FormPanel>
      </div>
    </FormGroup>
  )
}

export default observer(ShopDecoration)
