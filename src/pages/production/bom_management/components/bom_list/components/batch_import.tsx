import { uploadTengXunFile } from '@/common/service'
import globalStore from '@/stores/global'
import {
  Button,
  Flex,
  Modal,
  Radio,
  Tip,
  Uploader,
  UploaderFile,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FileType } from 'gm_api/src/cloudapi'
import { ProductionSettings_CookYieldSetting } from 'gm_api/src/preference'
import { ImportBom, OpType } from 'gm_api/src/production'
import React, { FC, useState } from 'react'

/**
 * 批量导入的属性
 */
interface Props {
  /** 取消时执行的动作 */
  onCancel: () => void
}

/**
 * 批量导入框的组件函数
 */
const BatchImport: FC<Props> = ({ onCancel }) => {
  const [value, setValue] = useState<OpType>(OpType.OPTYPE_CREATE)
  const [file, setFile] = useState<UploaderFile>()
  const isCookedBom =
    globalStore.productionSetting.cook_yield_setting ===
    ProductionSettings_CookYieldSetting.COOKYIELDSETTING_CLEANFOOD_COOKED_BOM_ON

  /**
   * 处理导入类型改变的事件
   * 设置导入类型
   * @param {OpType} type 导入类型
   */
  const handleImportTypeChange = (type: OpType) => {
    setValue(type)
  }

  /**
   * 处理下载按钮点击的事件
   * 下载模板
   */
  const handleDownloadButtonClick = () => {
    const url = isCookedBom
      ? 'https://file.guanmai.cn/test_bom_import_and_export_template_maturation_rate.xlsx'
      : 'https://file.guanmai.cn/test_bom_import_and_export_template.xlsx'

    window.open(url)
  }

  /**
   * 处理批量导入按钮点击的事件
   * 批量导入
   * @return {Promise<ImportBomResponse | null>} 包含导入结果的请求
   */
  const handleBatchImport = () => {
    if (!file) {
      Tip.danger(t('请上传文件'))
      return Promise.reject(new Error(''))
    }
    Modal.hide()

    return uploadTengXunFile(FileType.FILE_TYPE_PRODUCTION_BOM_IMPORT, file)
      .then((json) => {
        if (json && json.download_url) {
          return ImportBom({
            file_url: json.download_url,
            op_type: value,
          })
        }
        return null
      })
      .then((json) => {
        if (json) {
          onCancel()
          globalStore.showTaskPanel('1')
        } else {
          Tip.danger(t('文件处理失败，请重新上传'))
        }

        return json
      })
  }

  /**
   * 处理上传文件按钮点击的事件
   * 设置上传文件
   */
  const handleUploadButtonClick = (files: UploaderFile[]) => {
    setFile(files[0])
  }

  return (
    <div className='gm-padding-left-10'>
      <div className='gm-margin-bottom-15'>
        1. {t('选择导入类型：')}
        <Radio
          checked={value === OpType.OPTYPE_CREATE}
          value={OpType.OPTYPE_CREATE}
          onChange={() => handleImportTypeChange(OpType.OPTYPE_CREATE)}
          className='gm-margin-left-5 gm-margin-right-20'
        >
          {t('批量导入新建')}
        </Radio>
        <Radio
          checked={value === OpType.OPTYPE_UPDATE}
          value={OpType.OPTYPE_UPDATE}
          onChange={() => handleImportTypeChange(OpType.OPTYPE_UPDATE)}
        >
          {t('批量导入修改')}
        </Radio>
      </div>
      {value === 1 && (
        <div className='gm-margin-bottom-10'>
          2. {t('下载模板：')}
          <a
            href='javascript:;'
            onClick={handleDownloadButtonClick}
            rel='noopener noreferrer'
          >
            {t('下载新建模板')}
          </a>
        </div>
      )}
      {value === 1 && (
        <div>
          3. {t('上传文件：')}
          <Uploader onUpload={handleUploadButtonClick} accept='.xlsx'>
            <Button>{file ? t('重新上传') : t('上传')}</Button>
          </Uploader>
        </div>
      )}
      {value === 2 && (
        <div>
          2. {t('上传文件：')}
          <>
            <Uploader onUpload={handleUploadButtonClick} accept='.xlsx'>
              <Button>{file ? t('重新上传') : t('上传')}</Button>
            </Uploader>
            <div
              style={{ marginLeft: '75px' }}
              className='gm-margin-top-5 gm-text-desc'
            >
              {t('导出BOM信息，修改BOM信息后上传文件，完成导入')}
            </div>
          </>
        </div>
      )}
      <Flex justifyEnd className='gm-margin-top-5'>
        <Button onClick={() => onCancel()}>{t('取消')}</Button>
        <div className='gm-gap-5' />
        <Button type='primary' onClick={handleBatchImport} disabled={!file}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default BatchImport
