import React, { forwardRef } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  ImgUploader,
  Flex,
  Form,
  FormItem,
  FormPanel,
  UploaderFile,
} from '@gm-pc/react'
import { uploadQiniuImage } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import _ from 'lodash'

import store from '../store'

const Means = forwardRef<Form, { storeDetail: typeof store }>(
  ({ storeDetail }, ref) => {
    // 上传帮助手册
    const handleUploadImg = (files: UploaderFile[]) => {
      const res = _.map(files, (item) =>
        uploadQiniuImage(FileType.FILE_TYPE_PREFERENCE_SHOP_REFERENCE, item),
      )
      return Promise.all(res).then((json) => _.map(json, (i) => i.data))
    }

    return (
      <FormPanel title={t('资料配置')}>
        <Form ref={ref} labelWidth='150px' disabledCol>
          <FormItem label={t('帮助手册设置')}>
            <Flex column>
              <ImgUploader
                max={9}
                data={storeDetail.help_images}
                onUpload={handleUploadImg}
                onChange={storeDetail._handleChangeHelpImages}
                imgRender={(img) => (
                  <img className='b-spread-img' src={img.url} />
                )}
                accept='image/jpg,image/png'
                multiple
              />
              <div className='gm-margin-top-5 gm-text-desc'>
                {t('图片推荐尺寸宽度为720， 支持jpg/png格式')}
              </div>
            </Flex>
          </FormItem>
        </Form>
      </FormPanel>
    )
  },
)

export default observer(Means)
