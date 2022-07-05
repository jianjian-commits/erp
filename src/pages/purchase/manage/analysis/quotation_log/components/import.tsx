import React, { useState, FC, ChangeEvent, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  Flex,
  MoreSelect,
  Uploader,
  Button,
  UploaderFile,
  MoreSelectDataItem,
  Tip,
} from '@gm-pc/react'
import _ from 'lodash'
import purchaseStore from '@/pages/purchase/store'
import { ImportInquiryPriceTmpl } from 'gm_api/src/purchase'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'
interface BatchImportProps {
  onCancel: () => void
  onSubmit: (file: UploaderFile) => void
}

const BatchImport: FC<BatchImportProps> = (props) => {
  function handleUploadFileChoosen(
    files: UploaderFile[],
    e: ChangeEvent<HTMLInputElement>,
  ) {
    setFile(files[0])
    e.target.value = ''
  }
  function handleCancel() {
    props.onCancel()
  }
  function handleSubmit() {
    if (!file) {
      Tip.danger(t('请上传文件'))
      return
    }
    props.onSubmit(file)
    props.onCancel()
  }

  const [file, setFile] = useState<UploaderFile>()
  const [supplier, setSupplier] = useState<MoreSelectDataItem<string>>()
  const [suppliers, setSuppliers] = useState<MoreSelectDataItem<string>[]>()
  useEffect(() => {
    purchaseStore.fetchSuppliers().then((list) => {
      setSuppliers(
        list.map((v) => ({
          ...v,
          value: v.supplier_id!,
          text: `${v.name}(${v.customized_code || '-'})`,
        })),
      )
      return null
    })
  }, [])

  function handleDownloadExcel() {
    if (!supplier) return Tip.danger('选择一个供应商')
    return ImportInquiryPriceTmpl({ supplier_id: supplier?.value }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  const lis = [
    t('规格编码：必填，若为空，则导入时系统对该行数据不做解析；'),
    // t('供应商编号：必填，若为空，则导入时系统对该行数据不做解析；'),
    t(
      '询价价格：必填，请填写正数，最多四位小数，若同时填写了计量单位和包装单位的价格，以计量单位价格为准；',
    ),
    t('若同一个供应商填写了多次询价价格，则系统将记录多次询价；'),
    t('若同一个商品填写了多次询价价格，则系统将记录多次询价；'),
  ]
  return (
    <Flex column className='gm-padding-5'>
      <div>
        <div>{t('第一步：选择供应商')}</div>
        <div
          className='gm-padding-left-20 gm-margin-tb-10'
          style={{ width: '150px' }}
        >
          <MoreSelect
            data={suppliers || []}
            selected={supplier}
            placeholder={t('选择供应商')}
            renderListFilterType='pinyin'
            onSelect={(selected: MoreSelectDataItem<string>) =>
              setSupplier(selected)
            }
          />
        </div>
        <div>
          {t('第二步：下载')}{' '}
          <a href='javascript:' onClick={handleDownloadExcel}>
            {t('xlsx 模板')}
          </a>
          {t('，请根据以下要求输入内容')}
        </div>
        <div className='gm-padding-left-20 gm-margin-tb-10'>
          <ul>
            {_.map(lis, (li, index) => (
              <li key={index}>{li}</li>
            ))}
          </ul>
        </div>
        <div>{t('第三步：上传 xlsx 文件')}</div>
        <div className='gm-padding-lr-10'>
          <div className='gm-padding-tb-10 gm-padding-lr-15 '>
            <Uploader onUpload={handleUploadFileChoosen} accept='.xlsx'>
              <Button>{file ? t('重新上传') : t('上传')}</Button>
            </Uploader>
            {file ? (
              <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className='gm-text-right gm-padding-top-10'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleSubmit}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default observer(BatchImport)
