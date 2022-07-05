import React, { useState, useEffect } from 'react'
import { t, i18next } from 'gm-i18n'
import _ from 'lodash'
import { EditorPurchase } from 'gm-x-printer'
import { Tip, LoadingChunk } from '@gm-pc/react'
import defaultConfig from '../config/template_config/purchase_config'
import mockData from '../config/mock_data/purchase_task_data.json'
import { setTitle } from '@gm-common/tool'
import purchaseTask from '../config/data_to_key'
import addFields from '../config/add_fields'
import { purchaseTaskGroupBy } from '../util'
import {
  CreatePrintingTemplate,
  UpdatePrintingTemplate,
  PrintingTemplate_Type,
  PrintingTemplate,
  GetPrintingTemplate,
} from 'gm_api/src/preference'
import { history, uploadQiniuImage } from '@/common/service'
import { useGMLocation } from '@gm-common/router'
import { FileType } from 'gm_api/src/cloudapi'

setTitle(i18next.t('采购计划模板设置'))

// 判定是无效的长度
const isInvalidLength = (string: string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}
const TemEditor = () => {
  const [content, setContent] = useState<any>(defaultConfig)
  const [template, setTemplate] = useState<PrintingTemplate>()
  const [loading, setLoading] = useState(true)
  const location = useGMLocation<{ template_id: string }>()
  const { template_id } = location.query
  useEffect(() => {
    // 有id => 编辑模板, 没有id => 新建模板,用本地默认的config
    if (template_id) {
      GetPrintingTemplate({ printing_template_id: template_id }).then(
        (json) => {
          const { printing_template } = json.response
          const content = JSON.parse(printing_template.attrs?.layout as string)
          setContent(content)
          setTemplate(printing_template)
          setLoading(false)
          return null
        },
      )
    } else {
      setLoading(false)
    }
  }, [])

  const handleSave = (config: any, isSaveAs?: boolean): void => {
    // 校验数据
    if (config.name === '') {
      Tip.danger(t('模板名称不能为空'))
      return
    } else if (config.name.length > 10) {
      Tip.danger(t('模板名称不能超过10个汉字'))
      return
    } else if (
      isInvalidLength(config.page.size.width) ||
      isInvalidLength(config.page.size.height)
    ) {
      Tip.danger(t('请填入有效的纸张尺寸'))
      return
    }

    const req = {
      printing_template: {
        ...template!,
        name: config.name,
        type: PrintingTemplate_Type.TYPE_PURCHASE_TASK,
        attrs: {
          layout: JSON.stringify(config),
        },
        paper_size:
          config.page.type !== '-1'
            ? config.page.type
            : `${config.page.customizeWidth}X${config.page.customizeHeight}`,
      },
    }

    // 编辑模板
    if (template_id && !isSaveAs) {
      UpdatePrintingTemplate(req).then(() => {
        history.replace('/system/template/print_template')
        Tip.success('更新成功')
        return null
      })
    } else {
      // 新建模板
      delete req.printing_template.printing_template_id
      CreatePrintingTemplate(req).then(() => {
        history.replace('/system/template/print_template')
        Tip.success('创建成功')
        return null
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
  } else {
    const { purchase_tasks, ...rest } = mockData
    const list = purchaseTaskGroupBy(purchase_tasks)
    return (
      <EditorPurchase
        config={content}
        mockData={purchaseTask(list[0], rest)}
        onSave={handleSave}
        showEditor
        addFields={addFields}
        isPurchase
        uploadQiniuImage={(file: File) => {
          return uploadQiniuImage(
            FileType.FILE_TYPE_PURCHASE_TASK_TEMPLATE,
            file,
          )
        }}
      />
    )
  }
}

export default TemEditor
