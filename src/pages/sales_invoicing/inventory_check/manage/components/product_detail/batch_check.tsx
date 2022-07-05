import { uploadTengXunFile } from '@/common/service'
import globalStore from '@/stores/global'
import { Button, Select, Flex, Tip, Uploader, UploaderFile } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FileType } from 'gm_api/src/cloudapi'
import {
  ExportShelfStock,
  ImportBatchCheck,
  ExportNotBatchShelfStock,
  ImportNotBatchCheck,
} from 'gm_api/src/inventory'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'
import React, { useState } from 'react'
interface Props {
  onHide: () => void
}

const BatchCheck = (props: Props) => {
  const [file, setFile] = useState<UploaderFile>()
  const [batchOption, setBatchOption] = useState('')
  const [stockOption, setStockOption] = useState('')

  async function downloadExcelFile(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()

    if (!stockOption && globalStore.isOpenMultWarehouse) {
      Tip.danger(t('请选择盘点仓库'))
      return
    }

    if (!batchOption) {
      Tip.danger(t('请选择盘点模板'))
      return
    }
    const params = {
      for_check: true,
      warehouse_id: stockOption || undefined,
    }
    if (batchOption === '1') {
      // 无批次盘点
      await ExportNotBatchShelfStock(params)
    } else {
      // 有批次盘点
      await ExportShelfStock(params)
    }
    props.onHide()
    await globalStore.showTaskPanel()
  }

  function handleUpload() {
    if (!stockOption && globalStore.isOpenMultWarehouse) {
      Tip.danger(t('请选择盘点仓库'))
      return
    }

    if (!batchOption) {
      Tip.danger(t('请选择盘点模板'))
      return
    }
    if (!file) {
      Tip.danger(t('请上传文件'))
      return
    }
    props.onHide()
    if (batchOption === '1') {
      // 无批次盘点上传
      uploadTengXunFile(FileType.FILE_TYPE_INVENTORY_BATCH_CHECK_IMPORT, file)
        .then((json) => {
          if (json && json.download_url) {
            return ImportNotBatchCheck({
              file_url: json.download_url,
              warehouse_id: stockOption || undefined,
            })
          }
          return null
        })
        .then((json) => {
          if (json) {
            globalStore.showTaskPanel('1')
          } else {
            Tip.danger(t('文件处理失败，请重新上传'))
          }
          return json
        })
    } else {
      // 有批次盘点上传
      uploadTengXunFile(FileType.FILE_TYPE_INVENTORY_BATCH_CHECK_IMPORT, file)
        .then((json) => {
          if (json && json.download_url) {
            return ImportBatchCheck({
              file_url: json.download_url,
              warehouse_id: stockOption || undefined,
            })
          }
          return null
        })
        .then((json) => {
          if (json) {
            globalStore.showTaskPanel('1')
          } else {
            Tip.danger(t('文件处理失败，请重新上传'))
          }
          return json
        })
    }
  }

  function handleFileSelect(files: UploaderFile[]) {
    setFile(files[0])
  }

  const handleSelect = (selected: string) => {
    setBatchOption(selected)
  }

  const handlSelectStock = (selected: string) => {
    setStockOption(selected)
  }

  return (
    <Flex className='gm-padding-left-15f' column>
      {globalStore.isOpenMultWarehouse && (
        <div>
          <span>{t('盘点仓库：')}</span>
          <span className='gm-margin-top-10'>
            <Select_Warehouse
              value={stockOption}
              placeholder='请选择仓库'
              style={{
                maxWidth: '180px',
              }}
              onChange={handlSelectStock}
            />
          </span>
        </div>
      )}
      <div className='gm-margin-top-20'>
        {t('第一步: 选择导入模式，并下载盘点模板')}
      </div>
      <div className='gm-margin-top-10'>
        {/* warning: 使用antd的Selectd存在层级问题 */}
        <Select
          value={batchOption}
          placeholder='请选择盘点模板'
          data={[
            { text: '无批次盘点', value: '1' },
            { text: '有批次盘点', value: '2' },
          ]}
          style={{ width: '40%' }}
          onChange={handleSelect}
        />
        <a
          className='tw-cursor-pointer gm-margin-left-10'
          onClick={downloadExcelFile}
        >
          {t('点击下载')}
        </a>
      </div>
      <div className='gm-margin-top-10'>
        {t(
          `第二步: 根据盘点需要在Excel 表格中筛选货位或商品, 
          录入商品实盘数.`,
        )}
        {/* {t(
          `第二步: 根据盘点需要在Excel 表格中筛选货位或商品, 
          录入商品实盘数. 实盘数 (基本单位) 和 实盘数 (包装单位(废弃)) 二选一填写即可 若两个字段都填写, 
          则以基本单位数为准`,
        )} */}
      </div>
      <div className='gm-margin-top-10'>{t('第三步: 导入盘点单')}</div>
      <div className='gm-margin-top-10'>
        <Uploader
          className='gm-margin-right-10'
          onUpload={(files) => handleFileSelect(files)}
          accept='.xlsx'
        >
          <Button>{file ? t('重新上传') : t('上传')}</Button>
        </Uploader>
        {file ? file.name : null}
      </div>
      <div className='gm-margin-top-10'>
        {t(`说明: 仅" 实盘数 (基本单位) "和" 实盘数 (包装单位(废弃)) "可修改`)}
      </div>
      <div className='gm-margin-top-20 gm-text-right'>
        <Button onClick={() => props.onHide()}>{t('取消')}</Button>
        <Button
          className='gm-margin-left-10'
          type='primary'
          onClick={handleUpload}
        >
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default BatchCheck
