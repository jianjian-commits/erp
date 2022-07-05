/**
 * @description 批量导入-上传文件
 */
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Button, message } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'
import '../style.less'
import Dragger from 'antd/lib/upload/Dragger'
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { uploadTengXunFile } from '@/common/service'
import store from '../store'
import globalStore from '@/stores/global'

const BatchUpload: FC = observer(() => {
  const { pageConfig } = store
  const [fileList, setFileList] = useState<any[]>([])
  const [errorTips, setErrorTips] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  /** 上传文件到腾讯云 */
  const handleImport = () => {
    setIsLoading(true)
    let doneNum = fileList.length
    _.forEach(fileList, (fileItem) => {
      if (fileItem.status !== 'done') {
        doneNum -= 1
      }
    })

    if (!fileList.length) {
      message.error(t('请上传文件！'))
      setIsLoading(false)
      return
    } else if (doneNum === 0) {
      message.error(t('上传文件均为无效文件，请上传有效文件'))
      setIsLoading(false)
      return
    }

    uploadTengXunFile(500, fileList[0])
      .then(async (json) => {
        if (json && json.download_url) {
          // 步骤跳转后再改变按钮loading状态，防止二次点击
          await store.import(json?.download_url)
        } else {
          message.error(t('获取上传地址失败，请重新尝试'))
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }

  // 判断文件大小，不进行文件上传操作
  const customRequest = (options: any) => {
    const { file } = options

    const fileSize = file.size / (1024 * 1024)

    if (pageConfig.fileMaxSize && fileSize > pageConfig.fileMaxSize) {
      setErrorTips(t(`文件大小超过${pageConfig.fileMaxSize}M`))
      file.status = 'error'
    } else {
      file.status = 'done'
    }

    setFileList([file])
  }

  // 下载模版
  const download = () => {
    const { templateUrl, liteTemplateUrl } = pageConfig
    const url = globalStore.isLite
      ? liteTemplateUrl || templateUrl
      : templateUrl
    window.open(url)
  }

  const onCancel = () => {
    history.go(-1)
  }
  return (
    <>
      <div className='batch_import_upload batch_import_box'>
        {!!pageConfig.templateUrl && (
          <div className='batch_import_download'>
            <a onClick={download} className='batch_import_download_btn'>
              <DownloadOutlined />
              {t('下载模版')}
            </a>
            <span className='batch_import_download_tips'>
              {t('填写数据后上传')}
            </span>
          </div>
        )}
        <Dragger
          customRequest={customRequest}
          accept={pageConfig.fileFormat}
          fileList={fileList}
          maxCount={pageConfig.fileMaxCount}
          height={192}
        >
          <div className='batch_import_upload_icon'>
            <PlusOutlined style={{ color: '#0363FF' }} />
          </div>
          <p className='ant-upload-text'>{t('点击或将文件拖拽到这里上传')}</p>
          <p className='ant-upload-hint'>
            {fileList.length < pageConfig.fileMaxCount
              ? t(
                  pageConfig.uploadBoxTips ||
                    `导入文件仅支持.xls或.xlsx格式，大小不超过${pageConfig.fileMaxSize}M，单个excel条数不超过5000条`,
                )
              : t('重新上传会覆盖原文件')}
          </p>
        </Dragger>
        {errorTips && (
          <p className='batch_import_upload_error'>{t(errorTips)}</p>
        )}
      </div>
      <ButtonGroupFixed
        onCancel={onCancel}
        ButtonNode={
          <>
            <Button type='primary' loading={isLoading} onClick={handleImport}>
              {t('确定上传')}
            </Button>
          </>
        }
      />
    </>
  )
})

export default BatchUpload
