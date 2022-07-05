import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  UploaderFile,
  Uploader,
  Button,
  RadioGroup,
  Radio,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import { GetBatchImportCustomerTemplate } from 'gm_api/src/enterprise'
import store from '../store'

const BatchImportCustomerAction = observer(() => {
  const { setBatchImportUploadUrl } = store
  const [type, setType] = useState(1)
  const [filesName, setFilesName] = useState('')
  const handleUpload = (files: UploaderFile[]) => {
    return uploadQiniuFile(
      FileType.FILE_TYPE_ENTERPRISE_CUSTOMER_IMPORT,
      files[0],
    ).then((json) => {
      setFilesName(files[0].name)
      return setBatchImportUploadUrl(json.data.url)
    })
  }
  return (
    <>
      <Flex column className='gm-padding-10'>
        <Flex alignCenter className='gm-margin-bottom-5'>
          <span>1.{t('选择导入类型')}:</span>
          <RadioGroup
            className='gm-margin-left-10'
            name='import_type'
            value={type}
            onChange={(value) => setType(value)}
          >
            <Radio value={1}>{t('批量导入新建')}</Radio>
            <Radio value={2}>{t('批量导入修改')}</Radio>
          </RadioGroup>
        </Flex>
        {type === 1 && (
          <Flex alignCenter>
            <span>2.{t('下载模板')}:</span>
            <span className='gm-margin-left-20'>
              <Button
                type='link'
                onClick={() =>
                  GetBatchImportCustomerTemplate().then((json) =>
                    window.open(json.response.file_url),
                  )
                }
              >
                {t('下载新建模板')}
              </Button>
            </span>
          </Flex>
        )}
        <Flex alignCenter>
          <span>
            {type === 1 ? 3 : 2}.{t('上传文件')}:
          </span>
          <Uploader
            className='gm-margin-left-20'
            onUpload={(files) => handleUpload(files)}
            accept='.xlsx'
          >
            <Button className='gm-margin-left-10'>{t('上传')}</Button>
            <span className='gm-text-desc gm-margin-left-10'>{filesName}</span>
          </Uploader>
        </Flex>
        {type === 2 && (
          <Flex
            justifyCenter
            alignCenter
            className='gm-text-desc gm-margin-top-10'
          >
            {t('导出客户信息，修改客户信息后上传文件，完成导入')}
          </Flex>
        )}
      </Flex>
    </>
  )
})

export default BatchImportCustomerAction
