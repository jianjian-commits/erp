import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import _ from 'lodash'

import { setTitle } from '@gm-common/tool'
import materialRequisitionDataKey from '../config/data_to_key'

import { useGMLocation } from '@gm-common/router'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import { ListTaskInputRequest, PrintMaterialOrder } from 'gm_api/src/production'
import { handleMaterialOrderDetail } from '@/pages/system/template/print_template/material_requisition_template/util'

setTitle(i18next.t('打印'))
interface Query {
  printId: string
  filter: string // ListStockSheetRequest的序列化
}

const MaterialRequisitionPrinter = () => {
  const location = useGMLocation<Query>()

  function getMaterialRequisitionData() {
    const { printId, filter } = location.query

    const params: ListTaskInputRequest = {
      ...JSON.parse(filter),
    }

    return Promise.all([
      PrintMaterialOrder({ filter: { ...params } }).then(
        (json) => json.response,
      ),
      GetPrintingTemplate({ printing_template_id: printId }).then(
        (json) => json.response,
      ),
    ])
      .then((res) => {
        const [materialRequisitionData, config] = res
        const layout = JSON.parse(config.printing_template.attrs?.layout || '')
        const singleLine = !_.find(
          layout?.contents?.[0]?.columns,
          (v) => v.text === '{{列.菜品明细}}',
        )
        return _.map(
          handleMaterialOrderDetail(materialRequisitionData, singleLine),
          (item) => {
            return {
              data: materialRequisitionDataKey(item),
              config: JSON.parse(config.printing_template.attrs?.layout || ''),
            }
          },
        )
      })
      .catch((e) => {
        // window.alert(i18next.t('模板配置发生变化，请返回上一页'))
        LoadingFullScreen.hide()
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(new Error(''))
      })
  }

  async function handleDoIt() {
    LoadingFullScreen.render({
      size: '100px',
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    const list: any[] = await getMaterialRequisitionData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }
  useEffect(() => {
    handleDoIt()
  }, [])
  return null
}

export default MaterialRequisitionPrinter
