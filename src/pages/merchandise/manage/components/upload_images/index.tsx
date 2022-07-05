import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Upload, Modal } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { getQiniuToken, imageDomain } from '@/common/service'
import { UploadImageProps } from '@/pages/merchandise/manage/merchandise_list/create/type'
import { Storage, UUID } from '@gm-common/tool'
import { QiniuInfo } from '@gm-common/qiniup'
import { UploadFile } from 'antd/lib/upload/interface'
import { PlusOutlined } from '@ant-design/icons'
import './style.less'

const TOKEN_KEY_BASE = 'x_qiniu_token_'
const TOKEN_KEY_CACHE_TIME_BASE = 'x_qiniu_token_cache_time_'

const UploadImage: FC<UploadImageProps> = observer((props) => {
  const { fileType, fileLength, upload, setFileList } = props
  const [uploadData, setUploadData] = useState<any>({})
  const [previewVisible, setPreviewVisible] = useState<boolean>(false)
  const [previewImage, setpPeviewImage] = useState<string>('')
  const uploadChange = (info: any) => {
    setFileList(info.fileList)
  }

  const getUploadFileName = (blob: File) => {
    const { type, name } = blob
    let suf = type.includes('image') ? type.split('/').pop() : ''
    if (!suf) {
      suf = name.split('.').pop()
    }

    if (!suf) throw new Error('Can not find the suffix')

    return `${UUID.generate()}.${suf}`
  }

  const getCacheInfo = async (
    fetchInfo: () => Promise<QiniuInfo>,
    fileType: string,
  ) => {
    const TOKEN_INFO_KEY = TOKEN_KEY_BASE + fileType
    const TOKEN_KEY_CACHE_TIME = TOKEN_KEY_CACHE_TIME_BASE + fileType
    let info = Storage.get(TOKEN_INFO_KEY)
    const _cache = Storage.get(TOKEN_KEY_CACHE_TIME)
    let _cacheTime: Date | undefined = _cache && new Date(_cache)
    if (info && _cacheTime && +new Date() - +_cacheTime < 5 * 60 * 1000) {
      return info
    }
    info = await fetchInfo()
    _cacheTime = new Date()

    Storage.set(TOKEN_INFO_KEY, info)
    Storage.set(TOKEN_KEY_CACHE_TIME, `${_cacheTime}`)

    return info
  }

  const beforeUpload = async (file: File, fileList: File[]) => {
    const { prefix, token } = await getCacheInfo(
      () => getQiniuToken(fileType),
      fileType.toString(),
    )
    const name = getUploadFileName(file)
    const key = prefix ? `${prefix}${name}` : name
    setUploadData({
      token,
      key,
      domain: imageDomain,
      fileType: `IMAGE_TYPE_${fileType}`,
    })
  }

  const handlePreview = (file: UploadFile) => {
    const path = `https://qncdn.guanmai.cn/${file.response.key}`
    setpPeviewImage(path)
    setPreviewVisible(true)
  }

  const handleCancel = () => {
    setPreviewVisible(false)
  }

  return (
    <>
      <Upload
        action='https://upload-z2.qiniup.com/'
        data={uploadData}
        beforeUpload={beforeUpload}
        onChange={uploadChange}
        onPreview={handlePreview}
        accept='image/*'
        {...upload}
      >
        {fileLength > upload.fileList!.length && (
          <div>
            <PlusOutlined style={{ color: '#0363ff', fontSize: 20 }} />
            <p className='upload-text'>{t('上传图片')}</p>
          </div>
        )}
      </Upload>
      <Modal
        className='image-modal'
        visible={previewVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt='example' style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  )
})

export default UploadImage

UploadImage.defaultProps = {}
