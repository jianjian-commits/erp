import React, { useCallback, useEffect, useState } from 'react'
import { EditorStatement } from 'gm-x-printer'
import defaultConfig from '../config/template_config/default_config'
import {
  tableFieldsGrouped,
  getCommonFields,
  getTableFields,
  getTableFieldsOfOrderType,
  AddFields,
} from '../config/add_fields'
import mockData from '../config/mock_data/default_data'
import formatData from '../config/data_to_key'
import { LoadingChunk, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { history } from '@/common/service'
import {
  CreatePrintingTemplate,
  GetPrintingTemplate,
  PrintingTemplate,
  PrintingTemplate_Type,
  UpdatePrintingTemplate,
  ReqCreatePrintingTemplate,
} from 'gm_api/src/preference'
import { useGMLocation } from '@gm-common/router'

// 判定是无效的长度
const isInvalidLength = (string: string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}

/**
 * 财务模块 - 客户账单
 */
const CustomerBillTemplateEdit: React.VFC = () => {
  const location = useGMLocation<{ template_id: string }>()
  const { template_id } = location.query

  const [content, setContent] = useState(defaultConfig)
  const [template, setTemplate] = useState<PrintingTemplate>()
  const [loading, setLoading] = useState(true)

  const [addFields, setAddFields] = useState<AddFields>({
    commonFields: {},
    tableFields: {},
  })
  const getAddFields = useCallback(async () => {
    const commonFields = getCommonFields()
    const commonTableFields = getTableFields()
    const orderTypeFields = await getTableFieldsOfOrderType()
    setAddFields({
      commonFields,
      tableFields: {
        ...commonTableFields,
        ...orderTypeFields,
      },
    })
  }, [])

  const getTemplate = useCallback(async (templateId: string) => {
    try {
      const json = await GetPrintingTemplate({
        printing_template_id: templateId,
      })
      const { printing_template } = json.response
      const content = JSON.parse(printing_template.attrs?.layout as string)
      setContent(content)
      setTemplate(printing_template)
      setLoading(false)
      return null
    } catch (error) {
      return Promise.reject(error)
    }
  }, [])

  useEffect(() => {
    const fetcher = async () => {
      try {
        await getAddFields()
        if (template_id) {
          await getTemplate(template_id)
        }
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    fetcher()
  }, [template_id, getAddFields, getTemplate])

  const onSave = (config: any, isSaveAs?: boolean) => {
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

    const printTemplate: ReqCreatePrintingTemplate = {
      name: config.name,
      type: PrintingTemplate_Type.TYPE_BILL,
      attrs: {
        layout: JSON.stringify(config),
      },
      paper_size:
        config.page.type !== '-1'
          ? config.page.type
          : `${config.page.customizeWidth}X${config.page.customizeHeight}`,
    }

    // 编辑模板
    if (template_id && !isSaveAs) {
      UpdatePrintingTemplate({
        printing_template: {
          ...template,
          ...printTemplate,
        },
      }).then(() => {
        Tip.success('修改成功')
        history.replace('/system/template/print_template')
      })
      return
    }

    // 创建模板
    CreatePrintingTemplate({
      printing_template: printTemplate,
    }).then(() => {
      Tip.success('创建成功')
      history.replace('/system/template/print_template')
    })
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
    <EditorStatement
      config={content}
      addFields={addFields}
      tableFieldsGrouped={tableFieldsGrouped}
      showEditor
      mockData={formatData(mockData, '2020-12-12 ~ 2020-12-14')}
      onSave={onSave}
    />
  )
}

export default CustomerBillTemplateEdit
