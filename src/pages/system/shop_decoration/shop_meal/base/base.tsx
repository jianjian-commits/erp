import React, { forwardRef } from 'react'
import {
  FormPanel,
  Form,
  FormItem,
  Input,
  Select,
  UploaderFile,
  TextArea,
  Validator,
} from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { FileType } from 'gm_api/src/cloudapi'

import { BSwitch, Logo } from '../../common/index'
import { uploadQiniuImage } from '@/common/service'
import store from '../store'

import { t } from 'gm-i18n'

const BaseSetting = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    const { sale, notice, time, name, notice_message, phone, logo } =
      storeDetail

    // 上传logo
    const handleUpload = (files: UploaderFile[]) => {
      if (files.length) {
        uploadQiniuImage(
          FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE,
          _.head(files) as UploaderFile,
        ).then((json) => {
          return store.changeLogo(json.data)
        })
      }
    }

    return (
      <FormPanel title={t('店铺设置')}>
        <Form ref={ref} labelWidth='150px' colWidth='460px'>
          <FormItem
            label={t('默认报价单')}
            tooltip={t('用户未登录的情况下会看到默认报价单的商品和定价')}
          >
            <Select
              data={storeDetail.sales.slice()}
              value={sale}
              onChange={storeDetail._handleChangeSale}
            />
          </FormItem>
          <FormItem
            label={t('默认运营时间')}
            tooltip={t('用户在无邀请码情况下注册后，会关联默认运营时间')}
          >
            <Select
              data={storeDetail.times.slice()}
              value={time}
              onChange={storeDetail._handleChangeTime}
            />
          </FormItem>
          <FormItem
            required
            label={t('店铺名称')}
            validate={Validator.create([], name)}
          >
            <Input
              style={{ width: '300px' }}
              maxLength={30}
              value={name || ''}
              onChange={(e) => {
                storeDetail.changeName(e.target.value)
              }}
            />
          </FormItem>
          <FormItem
            required
            label={t('客服电话')}
            validate={Validator.create([], phone)}
          >
            <Input
              style={{ width: '300px' }}
              value={phone || ''}
              maxLength={30}
              onChange={(e) => {
                storeDetail.changePhone(e.target.value)
              }}
            />
          </FormItem>
          <FormItem label={t('店铺LOGO')}>
            <Logo logo={logo ? logo.url : ''} onUpload={handleUpload} />
          </FormItem>
          <FormItem label={t('商城公告')}>
            <BSwitch
              checked={notice || false}
              onChange={storeDetail._handleChangeNotice}
              tip={t('开启后，用户登录商城后会收到通知信息')}
            />
          </FormItem>
          {notice && (
            <FormItem label={t('商城公告')}>
              <TextArea
                placeholder={t('请输入公告内容，用户登录后将在商城端收到信息')}
                name='notice_message'
                value={notice_message}
                onChange={(v) =>
                  storeDetail.changeNoticeMessage(v.target.value)
                }
                style={{ width: '300px', height: '70px' }}
              />
            </FormItem>
          )}
        </Form>
      </FormPanel>
    )
  },
)

export default observer(BaseSetting)
