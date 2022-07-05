import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, UploaderFile, Uploader, Button, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import {
  GetImportQuotationBasicPriceTemplate,
  GetImportQuotationBasicPriceTemplateRequest_Template,
} from 'gm_api/src/merchandise'
import SupplierSelector from '../../../components/supplier_selector'
import store from '../store'
import globalStore from '@/stores/global'

const SheetImport = observer(() => {
  const [uploadState, setUploadState] = useState(false)
  useEffect(() => {
    return () => {
      store.updateImportSupplier([])
    }
  }, [])
  const handleUpload = (files: UploaderFile[]) => {
    return uploadQiniuFile(
      FileType.FILE_TYPE_MERCHANDISE_QUOTATION_BASIC_PRICE_IMPORT,
      files[0],
    ).then((json) => {
      setUploadState(true)
      return store.setPriceImportUploadUrl(json.data.url)
    })
  }
  return (
    <>
      <Flex column className='gm-padding-10'>
        <Flex alignCenter className='tw-mb-1 tw-mr-2'>
          <span>{t('1.选择供应商')}:</span>
          <SupplierSelector
            multiple={false}
            selected={store.importSupplier}
            onSelect={(value) => store.updateImportSupplier(value)}
          />
        </Flex>

        <Flex alignCenter className='tw-mb-1 tw-mr-2'>
          <span>{t('2.下载模板')}:</span>
          <Button
            type='link'
            onClick={() => {
              const supplier_ids = [store.importSupplier.supplier_id]
              GetImportQuotationBasicPriceTemplate({
                supplier_ids,
                template:
                  GetImportQuotationBasicPriceTemplateRequest_Template.TMP_BY_QUOTATION,
              }).then((res) => {
                // return window.open(res.response.file_url)
                return globalStore.showTaskPanel()
                // return Tip.success(t('导出成功'))
              })
            }}
          >
            {t('下载新建模板')}
          </Button>
        </Flex>

        <Flex alignCenter className='tw-mb-1'>
          <span className='tw-mb-1 tw-mr-2'>{t('3.上传文件：')}</span>
          <Uploader onUpload={(files) => handleUpload(files)} accept='.xlsx'>
            <Button>{uploadState ? t('重新上传') : t('上传')}</Button>
          </Uploader>
        </Flex>
      </Flex>
    </>
  )
})

export default SheetImport
