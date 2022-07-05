import React, { useState, useEffect } from 'react'
import { t, i18next } from 'gm-i18n'
import _ from 'lodash'
import { EditorProduction } from 'gm-x-printer'
import { Tip, LoadingChunk } from '@gm-pc/react'
import { clearFoodData, packData } from '../config/mock_data/index'
import { setTitle } from '@gm-common/tool'
import clearFoodDataKey from '../config/data_to_key'
import {
  CreatePrintingTemplate,
  UpdatePrintingTemplate,
  PrintingTemplate_Type,
  PrintingTemplate,
  GetPrintingTemplate,
  PrintingTemplate_TemplateProductionType,
} from 'gm_api/src/preference'
import { history, uploadQiniuImage } from '@/common/service'
import { useGMLocation } from '@gm-common/router'
import {
  productionBasicsData,
  processMerge,
} from '@/pages/system/template/print_template/production_template/util'
import {
  addFieldsType,
  MergeType,
  templateConfigType,
} from '@/pages/system/template/print_template/production_template/interface'
import { ProduceType } from 'gm_api/src/production'
import { PRINT_COMMAND_VAlUE } from '@/pages/production/task_command/enum'
import { FileType } from 'gm_api/src/cloudapi'

setTitle(i18next.t('净菜生产单据模板设置'))

// 判定是无效的长度
const isInvalidLength = (string: string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}
const TemEditor = () => {
  const location = useGMLocation<{
    template_id: string
    template_production_type: PrintingTemplate_TemplateProductionType
    template_type: MergeType
  }>()
  const { template_id, template_production_type, template_type } =
    location.query

  const [content, setContent] = useState<any>(
    templateConfigType[template_type ?? MergeType.TYPE_PROCESS],
  )
  const [addFields, setAddFields] = useState<any>(
    addFieldsType[template_type ?? MergeType.TYPE_PROCESS],
  )
  const [templateType, setTemplateType] = useState(template_type)
  const [template, setTemplate] = useState<PrintingTemplate>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 有id => 编辑模板, 没有id => 新建模板,用本地默认的config
    if (template_id) {
      GetPrintingTemplate({ printing_template_id: template_id }).then(
        (json) => {
          const { printing_template } = json.response
          const content = JSON.parse(printing_template.attrs?.layout as string)
          setAddFields(addFieldsType[content.productionMergeType])
          setTemplateType(content.productionMergeType)
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
        template_production_type,
        name: config.name,
        type: PrintingTemplate_Type.TYPE_PRODUCTION,
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
      const { printing_template_id, ...other } = req.printing_template
      const reqData = {
        ...req,
        printing_template: { ...other },
      }
      CreatePrintingTemplate(reqData).then(() => {
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
    // 包装的数据和净菜熟食的不同
    const mockData =
      +template_type === MergeType.TYPE_PACK ? packData : clearFoodData
    // produceType要区分包装和净菜熟食
    const produceType =
      +template_type === MergeType.TYPE_PACK
        ? ProduceType.PRODUCE_TYPE_PACK
        : ProduceType.PRODUCE_TYPE_CLEANFOOD
    const data = productionBasicsData(produceType, mockData)[0]
    return (
      <EditorProduction
        config={content}
        mockData={clearFoodDataKey(
          processMerge(data, templateType),
          PRINT_COMMAND_VAlUE.team_production,
          t('生产单'),
        )}
        onSave={handleSave}
        showEditor
        addFields={addFields}
        uploadQiniuImage={(file: File) => {
          return uploadQiniuImage(
            FileType.FILE_TYPE_PRODUCTION_PRINT_TEMPLATE,
            file,
          )
        }}
      />
    )
  }
}

export default TemEditor
