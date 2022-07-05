import globalStore from '@/stores/global'
import {
  Button,
  ControlledForm,
  ControlledFormItem,
  Flex,
  Tip,
  Uploader,
  UploaderFile,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FileType } from 'gm_api/src/cloudapi'
import {
  BatchImportSupplier,
  GetBatchImportSupplierTemplate,
} from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { uploadQiniuFile } from '../../../../../common/service'

/**
 * 批量导入供应商的上传弹窗的组件函数
 */
const BatchImportSupplierModal = observer((props: any) => {
  const { onHide } = props
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  /**
   * 处理下载事件，点击下载按钮时触发
   * 下载导入模板
   */
  const handleDownload = () => {
    GetBatchImportSupplierTemplate().then((json) =>
      window.open(json.response.file_url),
    )
  }

  /**
   * 处理上传事件，上传文件时触发
   * 上传导入文件
   * @param {UploaderFile[]} files 选择的上传文件数组，但是里面只有一个文件
   */
  const handleUpload = (files: UploaderFile[]) => {
    setUploadFile(files[0])
  }

  /**
   * 处理取消事件，点击取消按钮时触发
   * 隐藏弹窗
   */
  const handleCancel = () => {
    onHide(false)
  }

  /**
   * 处理提交事件，点击确定按钮时触发
   * 发送导入文件，批量创建供应商并显示右侧任务栏
   */
  const handleSubmit = () => {
    if (!uploadFile) {
      Tip.danger(t('未选择上传的文件'))
      return
    }

    uploadQiniuFile(
      FileType.FILE_TYPE_ENTERPRISE_CUSTOMER_IMPORT,
      uploadFile as File,
    )
      .then((json) => {
        onHide(false)
        return BatchImportSupplier({ file_url: json.data.url })
      })
      .then(() => {
        globalStore.showTaskPanel('1')
        return null
      })
  }

  return (
    <div>
      <ControlledForm className='gm-padding-10'>
        <ControlledFormItem label={t('1.下载模板')} className='gm-padding-5'>
          <Flex style={{ paddingTop: '6px' }}>
            <a style={{ cursor: 'pointer' }} onClick={handleDownload}>
              {t('下载新建模板')}
            </a>
          </Flex>
        </ControlledFormItem>
        <ControlledFormItem label={t('2.上传文件')} className='gm-padding-5'>
          <Flex>
            <Uploader onUpload={handleUpload} accept='.xlsx'>
              <Button>{t('上传')}</Button>
            </Uploader>
            <Flex>
              <span
                className='gm-text-desc gm-margin-left-5'
                style={{ margin: 'auto 0' }}
              >
                {uploadFile?.name}
              </span>
            </Flex>
          </Flex>
        </ControlledFormItem>
      </ControlledForm>
      <div style={{ textAlign: 'right' }}>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleSubmit}>
          {t('确定')}
        </Button>
      </div>
    </div>
  )
})

export default BatchImportSupplierModal
