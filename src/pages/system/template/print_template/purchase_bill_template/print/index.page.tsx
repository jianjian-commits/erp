import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import { setTitle } from '@gm-common/tool'
import purchaseBill from '../config/data_to_key'
import { useGMLocation } from '@gm-common/router'
import { GetPurchaseSheet } from 'gm_api/src/purchase'
import { GetPrintingTemplate } from 'gm_api/src/preference'

setTitle(i18next.t('打印'))
interface Query {
  print_what: 'bill' | 'task'
  tpl_id: string
  sheet_no: string
  [key: string]: any
}

const PurchasePrinter = () => {
  const location = useGMLocation<Query>()

  function getBillData() {
    const { sheet_no, tpl_id } = location.query

    return Promise.all([
      GetPurchaseSheet({ purchase_sheet_id: sheet_no }).then(
        (json) => json.response,
      ),
      GetPrintingTemplate({ printing_template_id: tpl_id }).then(
        (json) => json.response,
      ),
    ])
      .then((res) => {
        const [bill, config] = res
        const { purchase_sheet, ...rest } = bill
        return [
          {
            data: purchaseBill(purchase_sheet, rest),
            config: JSON.parse(config.printing_template.attrs?.layout || ''),
          },
        ]
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
    const list: any[] = await getBillData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  useEffect(() => {
    handleDoIt()
  }, [])

  return null
}

export default PurchasePrinter
