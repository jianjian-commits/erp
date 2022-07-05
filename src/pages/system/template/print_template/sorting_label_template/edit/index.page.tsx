import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import { useGMLocation } from '@gm-common/router'
import { PrinterEditShadow } from 'gm-printer-label'
import { Tip, LoadingFullScreen } from '@gm-pc/react'
import {
  PrintingTemplate,
  CreatePrintingTemplate,
  GetPrintingTemplate,
  PrintingTemplate_Type,
  UpdatePrintingTemplate,
} from 'gm_api/src/preference'
import defaultTempList from './config/template_config/default_temp'
import addFields from './config/add_fields'
import insertBlocksConfig from './config/insert_blocks_config'
import defaultConfig from './config/template_config/config'
import mock_data from './config/mock'
import toKey from './config/data_to_key'
import globalStore from '@/stores/global'
import { history, uploadQiniuImage } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'

const SortingLabelTemplateEdit = () => {
  const {
    query: { template_id },
  } = useGMLocation<{ template_id: string }>()

  const [content, setContent] = useState<any>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [current_template, setTemplate] = useState<PrintingTemplate | null>(
    null,
  )

  useEffect(() => {
    if (template_id) {
      GetPrintingTemplate({
        printing_template_id: template_id,
      }).then(({ response }) => {
        const content = JSON.parse(
          response.printing_template.attrs?.layout as string,
        )
        setContent(content)
        setTemplate(response.printing_template)
        setLoading(false)
        return response
      })
    } else {
      setLoading(false)
    }
  }, [])

  const validate = (config: any): boolean => {
    // 校验数据
    if (config.name === '') {
      Tip.danger(t('模板名称不能为空'))
      return false
    } else if (config.name.length > 10) {
      Tip.danger(t('模板名称不能超过10个汉字'))
      return false
    } else if (
      config.page.type === '-1' &&
      (!config.page.customizeWidth || !config.page.customizeHeight)
    ) {
      Tip.danger(t('自定义尺寸不能为空'))
      return false
    }
    return true
  }

  const handleSave = (config: any, isSaveAs: boolean) => {
    if (!validate(config)) {
      return
    }

    const new_printing_temp = {
      ...current_template,
      name: config.name,
      type: PrintingTemplate_Type.TYPE_SORTING,
      attrs: {
        layout: JSON.stringify(config),
      },
      paper_size:
        config.page.type !== '-1'
          ? config.page.type
          : `${config.page.customizeWidth}X${config.page.customizeHeight}`,
    }
    if (template_id && !isSaveAs) {
      return UpdatePrintingTemplate({
        printing_template: new_printing_temp as PrintingTemplate,
      }).then(() => {
        return Tip.success(t('保存成功'))
      })
    } else {
      delete (new_printing_temp as Partial<PrintingTemplate>)
        .printing_template_id
      return CreatePrintingTemplate({
        printing_template: new_printing_temp,
      }).then(({ response }) => {
        history.replace('/system/template/print_template')
        Tip.success('创建成功')
        return response
      })
    }
  }

  if (loading) {
    return <LoadingFullScreen text={t('数据请求中')} />
  }
  return (
    <PrinterEditShadow
      // 预设模板列表
      defaultTempList={defaultTempList}
      initDefaultTemp={!template_id ? 'default' : null}
      data={toKey(mock_data, globalStore.unitList)}
      config={content}
      onSave={handleSave}
      addFields={addFields}
      insertBlocksConfig={insertBlocksConfig}
      uploadQiniuImage={(file: File) => {
        return uploadQiniuImage(FileType.FILE_TYPE_SORTING_LABEL_TEMPLATE, file)
      }}
    />
  )
}

export default SortingLabelTemplateEdit
