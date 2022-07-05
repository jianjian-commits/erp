import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import _ from 'lodash'

import { setTitle } from '@gm-common/tool'
import settleDataKey from '../config/data_to_key'
import { useGMLocation } from '@gm-common/router'
import { GetPrintingTemplate } from 'gm_api/src/preference'

import { GetSettleSheetDetail } from 'gm_api/src/finance'

setTitle(i18next.t('打印'))
interface Query {
  tpl_id: string
  stock_sheet_req: string // ListStockSheetRequest的序列化
  [key: string]: any
}

const SettlePrinter = () => {
  const location = useGMLocation<Query>()

  function getSettleSheetData() {
    const { tpl_id, settle_sheet_req } = location.query

    const req: any = _.omit({ ...JSON.parse(settle_sheet_req) }, 'paging')

    return Promise.all([
      GetSettleSheetDetail(req).then((json) => json.response),
      GetPrintingTemplate({ printing_template_id: tpl_id }).then(
        (json) => json.response,
      ),
    ])
      .then((res) => {
        const [settleSheetRes, config] = res
        return {
          data: settleDataKey(settleSheetRes),
          config: JSON.parse(config.printing_template.attrs?.layout || ''),
        }
      })
      .catch(() => {
        window.alert(i18next.t('模板配置发生变化，请返回上一页'))
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(new Error(''))
      })
  }

  async function handleDoIt() {
    LoadingFullScreen.render({
      size: '100px',
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    const list: any[] = [await getSettleSheetData()]
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  useEffect(() => {
    handleDoIt()
  }, [])

  return null
}

export default SettlePrinter
