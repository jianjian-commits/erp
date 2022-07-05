import React, { useEffect, useMemo, useState } from 'react'
import { Editor } from 'gm-x-printer'
import { Tip, LoadingChunk } from '@gm-pc/react'
import { defaultConfig } from '../config/template_config'
import mockData from '../config/mock_data'
import { setTitle } from '@gm-common/tool'
import { t } from 'gm-i18n'
import { useGMLocation } from '@gm-common/router'
import _ from 'lodash'
import { history, uploadQiniuImage } from '@/common/service'
import {
  CreatePrintingTemplate,
  UpdatePrintingTemplate,
  GetPrintingTemplate,
  PrintingTemplate_Type,
  PrintingTemplate,
  UpdatePrintingTemplateRequest,
} from 'gm_api/src/preference'
import { order as formatOrder } from '../config/data_to_key'
import addFields, { fakeOrderFields } from '../config/add_fields'
import { handleOrderPrinterData } from '../util'
import { FileType } from 'gm_api/src/cloudapi'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

setTitle(t('打印模板设置'))

// 判定是无效的长度
const isInvalidLength = (string: string) => {
  const number = parseFloat(string)
  return _.isNaN(number) || number <= 0
}

const TemEditor = () => {
  const [content, setContent] = useState(defaultConfig)
  const [template, setTemplate] = useState<PrintingTemplate>()
  const [loading, setLoading] = useState(true)
  const location = useGMLocation<{ template_id: string }>()
  const { template_id } = location.query

  const fields = useMemo(() => {
    if (
      globalStore.isLite ||
      !globalStore.hasPermission(
        Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
      )
    ) {
      return addFields
    }
    const result = { ...addFields }
    result.tableFields = { ...addFields.tableFields, ...fakeOrderFields }
    return result
  }, [])

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

  const handleSave = (config: any, isSaveAs?: boolean): any => {
    // 校验数据
    if (config.name === '') {
      return Tip.danger(t('模板名称不能为空'))
    } else if (config.name.length > 10) {
      return Tip.danger(t('模板名称不能超过10个汉字'))
    } else if (
      isInvalidLength(config.page.size.width) ||
      isInvalidLength(config.page.size.height)
    ) {
      return Tip.danger(t('请填入有效的纸张尺寸'))
    }

    // req的初始值
    const _printing_template = {
      name: config.name,
      type: PrintingTemplate_Type.TYPE_DELIVERY,
      attrs: {
        layout: JSON.stringify(config),
      },
      template_delivery_type: 2,
      paper_size:
        config.page.type !== '-1'
          ? config.page.type
          : `${config.page.customizeWidth}X${config.page.customizeHeight}`,
    }

    // 编辑模板
    if (template_id && !isSaveAs) {
      const req = {
        printing_template: {
          ...template,
          ..._printing_template,
        },
      } as UpdatePrintingTemplateRequest
      UpdatePrintingTemplate(req).then(() => {
        Tip.success('修改成功')
        history.replace(
          '/system/template/print_template?active=DeliveryTemplate',
        )
        return null
      })
    } else {
      // 新建模板
      const req = {
        printing_template: {
          ..._printing_template,
        },
      } as UpdatePrintingTemplateRequest
      CreatePrintingTemplate(req).then(() => {
        history.replace(
          '/system/template/print_template?active=DeliveryTemplate',
        )
        Tip.success('创建成功')
        return null
      })
    }
  }
  const canEdit = true
  // globalStore.hasPermission('edit_print_template_new')
  if (loading) {
    return (
      <LoadingChunk
        text={t('数据请求中...')}
        loading={loading}
        style={{ marginTop: '300px' }}
      >
        111
      </LoadingChunk>
    )
  } else {
    return (
      <Editor
        config={content}
        mockData={formatOrder(handleOrderPrinterData(mockData)[0])}
        onSave={handleSave}
        showEditor={canEdit}
        addFields={fields}
        showNewDate
        uploadQiniuImage={(file: File) => {
          return uploadQiniuImage(
            FileType.FILE_TYPE_DELIVERY_RECEIVE_IMAGE,
            file,
          )
        }}
      />
    )
  }
}

export default TemEditor
