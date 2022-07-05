import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import { setTitle } from '@gm-common/tool'
import purchaseTask from '../config/data_to_key'
import { useGMLocation } from '@gm-common/router'
import {
  ListPurchaseTask,
  ListPurchaseTaskRequest,
  ListBatch,
  TimeType,
} from 'gm_api/src/purchase'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import { purchaseTaskGroupBy } from '../util'

setTitle(i18next.t('打印'))
interface Query {
  print_what: 'bill' | 'task'
  tpl_id: string
  sheet_no: string
  [key: string]: any
}

const PurchasePrinter = () => {
  const location = useGMLocation<Query>()

  function getTaskData() {
    const {
      tpl_id,
      print_what,
      sheet_no,
      limit,
      begin_time,
      end_time,
      all,
      ...query
    } = location.query
    const req = { ...query, begin_time, end_time, paging: { limit, all } }

    return Promise.all([
      ListPurchaseTask(req as ListPurchaseTaskRequest).then(
        (json) => json.response,
      ),
      GetPrintingTemplate({ printing_template_id: tpl_id }).then(
        (json) => json.response,
      ),
      ListBatch({
        begin_time,
        end_time,
        filter_time_type: TimeType.CREATE_TIME,
      }).then((json) => json.response.batches),
    ])
      .then((res) => {
        const [tasks, config, batchMap] = res
        const { purchase_tasks, ...rest } = tasks
        const list = purchaseTaskGroupBy(purchase_tasks, batchMap)
        return list.map((item) => {
          return {
            data: purchaseTask(item, rest),
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
    const list: any[] = await getTaskData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  useEffect(() => {
    handleDoIt()
  }, [])

  return null
}

export default PurchasePrinter
