import { t } from 'gm-i18n'
import React, { useState, FC } from 'react'
import { Uploader, UploaderFile, Flex } from '@gm-pc/react'
import { uploadTengXunFile } from '@/common/service'
import { observer } from 'mobx-react'
import { FileType } from 'gm_api/src/cloudapi'
import { Button, message, Radio } from 'antd'
import store from '../store/listStore'
import globalStore from '@/stores/global'

enum OpType {
  OPTYPE_CREATE = 1,
  OPTYPE_UPDATE = 2,
}
interface BatchImportProps {
  handleVisible: (visible: boolean) => void
}
const BatchImport: FC<BatchImportProps> = ({ handleVisible }) => {
  const [value, setValue] = useState<OpType>(OpType.OPTYPE_CREATE)
  const [file, setFile] = useState<UploaderFile>()
  const [filesName, setFilesName] = useState('')

  const handleValueChange = (value: OpType) => {
    setValue(value)
  }

  const handleDownload = () => {
    const url =
      'https://gmfiles-1251112841.cos.ap-guangzhou.myqcloud.com/enterprise/budget_export/%E8%B5%84%E9%87%91%E9%A2%84%E7%AE%97%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx'
    window.open(url)
  }

  const handleBatchImport = () => {
    if (!file) {
      message.error(t('请上传文件'))
      return Promise.reject(new Error(''))
    }
    return uploadTengXunFile(FileType.FILE_TYPE_PRODUCTION_BOM_IMPORT, file)
      .then((json) => {
        if (json && json.download_url) {
          if (value === 1) {
            store.batchImportBudget(json.download_url)
          } else {
            store.batchUpdateBudget(json.download_url)
          }
          globalStore.showTaskPanel()
        }
        handleVisible(false)
        return json
      })
      .then((json) => {
        if (json) {
          globalStore.showTaskPanel()
        } else {
          message.error(t('文件处理失败，请重新上传'))
        }
        return json
      })
  }

  const handleUploadFile = (files: UploaderFile[]) => {
    setFile(files[0])
    setFilesName(files[0].name)
  }

  return (
    <div className='gm-padding-left-10'>
      <div className='gm-margin-bottom-15'>
        1. {t('选择导入类型：')}
        <Radio
          checked={value === OpType.OPTYPE_CREATE}
          value={OpType.OPTYPE_CREATE}
          onChange={() => handleValueChange(OpType.OPTYPE_CREATE)}
          className='gm-margin-left-5 gm-margin-right-20'
        >
          {t('批量导入新建')}
        </Radio>
        <Radio
          checked={value === OpType.OPTYPE_UPDATE}
          value={OpType.OPTYPE_UPDATE}
          onChange={() => handleValueChange(OpType.OPTYPE_UPDATE)}
        >
          {t('批量导入修改')}
        </Radio>
      </div>
      <div className='gm-margin-bottom-10'>
        2. {t('下载模版：')}
        <a
          href='javascript:;'
          onClick={handleDownload}
          rel='noopener noreferrer'
        >
          {t(`下载${value === 1 ? '新建' : '编辑'}模版`)}
        </a>
      </div>
      <div>
        3. {t('上传文件：')}
        <>
          <Uploader onUpload={handleUploadFile} accept='.xlsx'>
            <Button>{file ? t('重新上传') : t('上传')}</Button>
            <span className='gm-text-desc gm-margin-left-10'>{filesName}</span>
          </Uploader>
          <div
            style={{ marginLeft: '75px' }}
            className='gm-margin-top-5 gm-text-desc'
          >
            {t('导出资金预算模版，修改预算模版后上传文件，完成导入')}
          </div>
        </>
      </div>
      <Flex justifyEnd className='gm-margin-top-5'>
        <Button onClick={() => handleVisible(false)}>{t('取消')}</Button>
        <div className='gm-gap-5' />
        <Button type='primary' onClick={handleBatchImport} disabled={!file}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default observer(BatchImport)
