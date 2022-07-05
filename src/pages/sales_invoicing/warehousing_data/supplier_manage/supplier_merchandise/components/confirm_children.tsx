import React, { useState, FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import globalStore from '@/stores/global'
import {
  Flex,
  Uploader,
  Button,
  UploaderFile,
  ControlledForm,
  ControlledFormItem,
  Tip,
} from '@gm-pc/react'
import { BatchUpdateSkuSsu } from 'gm_api/src/merchandise'
import store from '../store/store'
interface ConfirmChildrenProps {
  onHide: (hide: boolean) => void
}
const ConfirmChildren: FC<ConfirmChildrenProps> = observer(({ onHide }) => {
  const [uploadFile, setUploadFile] = useState<UploaderFile>()
  const handleDownload = () => {
    store.export().then(() => {
      globalStore.showTaskPanel()
      onHide(false)
    })
  }

  const handleUpload = (files: UploaderFile[]) => {
    setUploadFile(files[0])
  }
  const handleSubmit = () => {
    if (!uploadFile) {
      Tip.danger(t('请上传文件'))
      return
    }
    uploadQiniuFile(
      FileType.FILE_TYPE_MERCHANDISE_COMBINE_SSU_IMPORT,
      uploadFile as UploaderFile,
    )
      .then((json) => {
        if (json && json.data.url) {
          const url = {
            file_url: json.data.url,
          }
          onHide(false)
          return BatchUpdateSkuSsu({
            file_url: url.file_url,
            supplier_id: store.supplier_id,
          })
        }
      })
      .then((json) => {
        if (json) {
          globalStore.showTaskPanel('1')
          onHide(true)
        } else {
          Tip.danger(t('文件处理失败，请重新上传'))
        }

        return json
      })
  }
  const handleCancel = () => {
    onHide(false)
  }
  return (
    <div className='tw-pl-2 tw-box-border'>
      <ControlledForm>
        <ControlledFormItem label={t('第一步')}>
          <a
            className='tw-mt-1'
            style={{ cursor: 'pointer', display: 'block' }}
            onClick={handleDownload}
          >
            {t('下载新建模板')}
          </a>
        </ControlledFormItem>
        <ControlledFormItem label={t('第二步')}>
          <p className='tw-mt-1'>{t('完成模板内容填写并上传的导入系统')}</p>
        </ControlledFormItem>
        <ControlledFormItem className='gm-padding-5'>
          <>
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
          </>
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

export default ConfirmChildren
