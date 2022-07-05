import React, { FC } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Input, ImgUploader, UploaderFile, Flex, TextArea } from '@gm-pc/react'

import { uploadQiniuImage } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import { ImageType } from '../../../common/interface'

export interface NoticeProps {
  title: string
  imageUrl: ImageType[]
  content: string
  onChangeImage(v: ImageType[]): void
  onChangeTitle(v: string): void
  onChangeContent(v: string): void
}

const Notice: FC<NoticeProps> = ({
  title,
  imageUrl,
  content,
  onChangeImage,
  onChangeTitle,
  onChangeContent,
}) => {
  const handleChange = (images: ImageType[]) => {
    onChangeImage(images)
  }

  const handleChangeTitle = (e: any) => {
    const value = e.target.value
    onChangeTitle(value)
  }

  const handleUpload = (files: UploaderFile[]) => {
    const res = _.map(files, (item) =>
      uploadQiniuImage(FileType.FILE_TYPE_PREFERENCE_SHOP_ANNOUNCEMENT, item),
    )
    return Promise.all(res).then((json) => _.map(json, (i) => i.data))
  }

  return (
    <Flex column>
      <span className='gm-margin-tb-10'>{t('通知栏的标题:')}</span>
      <Input value={title} onChange={handleChangeTitle} />
      <span className='gm-margin-tb-10'>{t('通知栏的图片:')}</span>
      <ImgUploader
        contentSize={{
          width: '100px',
          height: '100px',
        }}
        data={imageUrl || []}
        accept='image/*'
        max={1}
        onChange={handleChange}
        onUpload={handleUpload}
      />
      <span className='gm-margin-tb-10'>{t('通知栏的内容:')}</span>
      <TextArea
        value={content}
        onChange={(e) => {
          onChangeContent(e.target.value)
        }}
      />
    </Flex>
  )
}

export default Notice
