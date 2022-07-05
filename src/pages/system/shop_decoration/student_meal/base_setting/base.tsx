import React, { forwardRef } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Form,
  FormPanel,
  FormItem,
  Input,
  Validator,
  UploaderFile,
} from '@gm-pc/react'
import _ from 'lodash'
import { uploadQiniuImage } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'

import { Logo } from '../../common/index'
import store from '../store'

const Base = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    // 上传logo
    const handleUpload = (files: UploaderFile[]) => {
      if (files.length) {
        uploadQiniuImage(
          FileType.FILE_TYPE_PREFERENCE_SHOP_LOGO_IMAGE,
          _.head(files) as UploaderFile,
        ).then((json) => {
          return store.changeLogo(json.data)
        })
      }
    }

    const { name, phone, logo } = storeDetail
    return (
      <FormPanel title={t('店铺设置')}>
        <Form ref={ref} labelWidth='150px' disabledCol>
          <FormItem
            label={t('店铺名称')}
            required
            validate={Validator.create([], name)}
          >
            <Input
              style={{ width: '300px' }}
              value={name}
              maxLength={30}
              onChange={(e) => storeDetail.changeName(e.target.value)}
            />
          </FormItem>
          <FormItem
            label={t('客服电话')}
            required
            validate={Validator.create([], phone)}
          >
            <Input
              style={{ width: '300px' }}
              value={phone}
              maxLength={30}
              onChange={(e) => storeDetail.changePhone(e.target.value)}
            />
          </FormItem>
          <FormItem label={t('店铺LOGO')}>
            <Logo logo={logo ? logo.url : ''} onUpload={handleUpload} />
          </FormItem>
        </Form>
      </FormPanel>
    )
  },
)

export default observer(Base)
