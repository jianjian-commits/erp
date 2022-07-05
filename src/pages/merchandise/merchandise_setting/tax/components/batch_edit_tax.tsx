import { t } from 'gm-i18n'
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'

import { Tip, Flex, Uploader, UploaderFile } from '@gm-pc/react'
import { FileType } from 'gm_api/src/cloudapi'
import { Modal, Button } from 'antd'
import { uploadQiniuFile } from '@/common/service'
import store from '../store'
import globalStore from '@/stores/global'

export interface BatchEditTaxRef {
  handleOpen: () => void
  handleClose: () => void
}

/** 批量修改税率 */
const BatchEditTax = forwardRef<BatchEditTaxRef>((_, ref) => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<UploaderFile>()

  useEffect(() => {
    if (!visible) {
      setFile(undefined)
    }
  }, [visible])

  useImperativeHandle(ref, () => ({
    handleOpen: () => setVisible(true),
    handleClose: handleCancel,
  }))

  // 实际上就是导出
  const handleDownload = (): void => {
    handleCancel()
    store.export().then(() => globalStore.showTaskPanel('0'))
  }

  const handleUploadFile = (files: UploaderFile[]): void => {
    setFile(files[0])
  }

  const handleSubmit = () => {
    if (!file) {
      Tip.danger(t('请上传文件'))
      return
    }

    return uploadQiniuFile(FileType.FILE_TYPE_MERCHANDISE_SKU_IMPORT, file)
      .then((json) => {
        if (json && json.data.url) {
          return store.batchUpdate(json.data.url)
        }
        return null
      })
      .then((json) => {
        if (json) {
          setVisible(false)
          globalStore.showTaskPanel('1')
        } else {
          Tip.danger(t('文件处理失败，请重新上传'))
        }
        return json
      })
  }

  const handleCancel = () => {
    setVisible(false)
    setLoading(false)
  }

  return (
    <Modal
      visible={visible}
      destroyOnClose
      title={t('批量修改商品税率')}
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Button
        type='link'
        onClick={handleDownload}
        className='gm-margin-bottom-5'
      >
        {t('点击下载当前商品税率')}
      </Button>
      <Flex alignCenter className='gm-padding-lr-10 gm-margin-bottom-5'>
        {t('上传文件：')}
        <Uploader onUpload={handleUploadFile} accept='.xlsx'>
          <Button>{file ? t('重新上传') : t('上传')}</Button>
        </Uploader>
      </Flex>
      <Flex
        justifyCenter
        column
        className='gm-padding-lr-10 gm-margin-bottom-5'
      >
        <div>{t('注意点：')}</div>
        <div>
          1.
          {t(
            '商品税收分类请按系统已有的税收分类填写，填错或不填则不修改原有数据；',
          )}
        </div>
        <div>
          2.
          {t('税率填写0-100之间的整数，填错或不填则不修改原有数据；')}
        </div>
        <div>
          3.
          {t('商品名称和商品编号不可修改；')}
        </div>
      </Flex>
    </Modal>
  )
})

export default BatchEditTax
