import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import {
  Flex,
  UploaderFile,
  Uploader,
  Button,
  RadioGroup,
  Radio,
  Tip,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import {
  GetImportQuotationBasicPriceTemplate,
  GetImportQuotationBasicPriceTemplateRequest_Template,
} from 'gm_api/src/merchandise'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'
import SupplierSelector from '@/pages/purchase/manage/components/supplier_selector'
import store from '../store'

const PriceImport = observer(() => {
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
          <span>{t('1.选择导入类型：')}</span>
          <RadioGroup
            name='import_type'
            value={store.priceImportType}
            onChange={(value) => {
              setUploadState(false)
              store.setPriceImportType(value)
            }}
          >
            <Flex>
              <Radio value={1}>{t('批量导入新建')}</Radio>
              <PermissionJudge
                permission={
                  Permission.PERMISSION_PURCHASE_UPDATE_AGREEMENT_PRICE
                }
              >
                <Radio value={2}>{t('批量导入修改')}</Radio>
              </PermissionJudge>
            </Flex>
          </RadioGroup>
        </Flex>

        {store.priceImportType === 1 && (
          <Flex alignCenter className='tw-mb-1 tw-mr-2'>
            <span>{t('2.选择供应商')}:</span>
            <SupplierSelector
              selected={store.importSupplier}
              onSelect={(value) => {
                store.updateImportSupplier(value)
              }}
            />
          </Flex>
        )}

        {store.priceImportType === 1 && (
          <Flex alignCenter className='tw-mb-1 tw-mr-2'>
            <span>{t('3.下载模板')}:</span>
            <Button
              type='link'
              onClick={() => {
                const supplier_ids = store.importSupplier.map(
                  (e: any) => e.supplier_id,
                )
                GetImportQuotationBasicPriceTemplate({
                  supplier_ids,
                  template:
                    GetImportQuotationBasicPriceTemplateRequest_Template.TMP_BY_SSU,
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
        )}

        <Flex alignCenter className='tw-mb-1'>
          <span className='tw-mb-1 tw-mr-2'>
            {store.priceImportType === 1
              ? t('4.上传文件：')
              : t('2.上传文件：')}
          </span>
          <Uploader onUpload={(files) => handleUpload(files)} accept='.xlsx'>
            <Button>{uploadState ? t('重新上传') : t('上传')}</Button>
          </Uploader>
        </Flex>

        <Flex alignCenter className='gm-text-desc'>
          <span className='tw-ml-16'>
            {store.priceImportType === 1
              ? t('导入成功后，将同步生成协议单')
              : t(
                  '导出协议价信息，修改协议价信息后上传文件，完成导入修改成功后，协议单中协议价也同步修改',
                )}
          </span>
        </Flex>
      </Flex>
    </>
  )
})

export default PriceImport
