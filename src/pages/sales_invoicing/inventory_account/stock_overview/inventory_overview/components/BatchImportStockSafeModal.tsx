import { uploadTengXunFile } from '@/common/service'
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
import { ExportStockWarning, ImportStockWarning } from 'gm_api/src/inventory'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import store from '@/pages/sales_invoicing/inventory_account/stock_overview/inventory_overview/stores/store'
import globalStore from '@/stores/global'

/**
 * 批量导入安全库存的上传弹窗的组件函数
 */
const BatchImportStockSafeModal: React.FC<{
  onHide: (brefresh: boolean) => void
  selected: string[]
  isSelectedAll: boolean
}> = observer((props) => {
  const { onHide, selected, isSelectedAll } = props
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  /**
   * 处理下载事件，点击下载按钮时触发
   * 下载导入模板
   */
  const handleDownload = () => {
    ExportStockWarning({
      list_sku_stock_request: Object.assign(store.getSearchData(), {
        paging: {
          limit: 0,
        },
        sku_ids: isSelectedAll ? void 0 : selected,
      }),
    }).then(() => {
      onHide(false)
      globalStore.showTaskPanel()
      return null
    })
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

    uploadTengXunFile(
      FileType.FILE_TYPE_INVENTORY_STOCK_WARNING_IMPORT,
      uploadFile,
    )
      .then((json) => {
        if (json && json.download_url) {
          const url = {
            file_url: json.download_url,
          }
          return ImportStockWarning(url)
        }
        Tip.danger(t('文件处理失败，请重新上传'))
        return null
      })
      .then((d) => {
        if (d !== null) {
          onHide(true)
        }
        globalStore.showTaskPanel('1')
        return null
      })
  }

  return (
    <div>
      <ControlledForm className='gm-padding-10'>
        <ControlledFormItem
          label={t('第一步：按格式填写模版')}
          className='gm-padding-5'
        >
          <Flex style={{ paddingTop: '6px' }}>
            <a style={{ cursor: 'pointer' }} onClick={handleDownload}>
              {t('下载导入模板')}
            </a>
          </Flex>
        </ControlledFormItem>
        <ControlledFormItem
          label={t('第二步：上传导入模版完成修改')}
          className='gm-padding-5'
          style={{
            minWidth: '100%',
          }}
        >
          <Flex>
            <Uploader onUpload={handleUpload} accept='.xlsx'>
              <Button>{uploadFile ? t('重新上传') : t('上传')}</Button>
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

export default BatchImportStockSafeModal
