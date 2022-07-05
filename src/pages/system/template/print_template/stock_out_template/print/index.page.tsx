import { useEffect } from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'

import { setTitle } from '@gm-common/tool'
import { useGMLocation } from '@gm-common/router'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import {
  ListShelf,
  ListStockSheet,
  ListSaleOutStockSheet,
} from 'gm_api/src/inventory'

import stockOutDataKey from '../config/data_to_key'

setTitle(i18next.t('打印'))
interface Query {
  tpl_id: string
  stock_sheet_req: string // ListStockSheetRequest的序列化
  [key: string]: any
}

type ApiType = 'sale_out'

const getRestfulApi = (type: ApiType) => {
  let apiFn
  switch (type) {
    case 'sale_out':
      apiFn = ListSaleOutStockSheet
      break
    default:
      apiFn = ListStockSheet
  }

  return apiFn
}

const StockOutPrinter = () => {
  const location = useGMLocation<Query>()
  const { tpl_id, stock_sheet_req, type } = location.query
  function getStockSheetData() {
    const req: any = _.omit(
      { ...JSON.parse(stock_sheet_req), with_additional: true },
      'paging',
    )

    return Promise.all([
      getRestfulApi(type)(req).then((json) => json.response),
      GetPrintingTemplate({ printing_template_id: tpl_id }).then(
        (json) => json.response,
      ),
      ListShelf({ with_deleted: true }).then((json) => json.response),
    ])
      .then((res) => {
        const [listStockSheetRes, config, shelf] = res
        return _.map(listStockSheetRes.stock_sheets, (stock_sheet) => {
          const stockSheetRes = {
            stock_sheet,
            additional: listStockSheetRes.additional!,
          }
          return {
            data: stockOutDataKey(
              stockSheetRes,
              { shelfList: shelf.shelves },
              type,
            ),
            config: JSON.parse(config.printing_template.attrs?.layout || ''),
          }
        })
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
    const list: any[] = await getStockSheetData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  useEffect(() => {
    handleDoIt()
  }, [])

  return null
}

export default StockOutPrinter
