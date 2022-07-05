import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import defaultConfig from './config/template_config/config'
import { Tip, LoadingChunk } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import addFields from './config/add_fields'
import mock_data from './config/mock'
import toKey from './config/data_to_key'
import { EditorBoxLabel } from 'gm-x-printer'
import {
  PrintingTemplate,
  CreatePrintingTemplate,
  GetPrintingTemplate,
  PrintingTemplate_Type,
  UpdatePrintingTemplate,
} from 'gm_api/src/preference'
import { history, uploadQiniuImage } from '@/common/service'
import { observer } from 'mobx-react'
import { FileType } from 'gm_api/src/cloudapi'

const BoxTemplateEdit = () => {
  const {
    query: { printing_template_id },
  } = useGMLocation<{ printing_template_id: string | undefined }>()

  const [content, setContent] = useState<any>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [current_template, setTemplate] = useState<PrintingTemplate | null>(
    null,
  )

  useEffect(() => {
    if (printing_template_id) {
      GetPrintingTemplate({
        printing_template_id,
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
    if (config.name.trim() === '') {
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

  const handleSave = (config: any, isSaveAs?: boolean) => {
    if (!validate(config)) {
      return
    }

    const new_printing_temp = {
      ...current_template,
      printing_template_id,
      name: config.name,
      type: PrintingTemplate_Type.TYPE_BOX,
      attrs: {
        layout: JSON.stringify(config),
      },
      paper_size:
        config.page.type !== '-1'
          ? config.page.type
          : `${config.page.customizeWidth}X${config.page.customizeHeight}`,
    }
    if (printing_template_id && !isSaveAs) {
      UpdatePrintingTemplate({
        printing_template: new_printing_temp as PrintingTemplate,
      }).then(() => {
        return Tip.success(t('保存成功'))
      })
    } else {
      delete new_printing_temp.printing_template_id

      CreatePrintingTemplate({
        printing_template: new_printing_temp,
      }).then(({ response }) => {
        history.replace('/production/production_tools/print_box_label')
        Tip.success('创建成功')
        return response
      })
    }
  }

  if (loading) {
    return (
      <LoadingChunk
        text={t('数据请求中...')}
        loading={loading}
        style={{ marginTop: '300px' }}
      >
        {null}
      </LoadingChunk>
    )
  }

  return (
    <EditorBoxLabel
      config={content}
      mockData={toKey(mock_data)}
      showEditor
      addFields={addFields}
      onSave={handleSave}
      uploadQiniuImage={(file: File) => {
        return uploadQiniuImage(
          FileType.FILE_TYPE_BOX_LABEL_TEMPLATE_IMAGE,
          file,
        )
      }}
    />
  )
}

export default observer(BoxTemplateEdit)
