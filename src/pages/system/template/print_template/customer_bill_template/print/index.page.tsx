import React, { useEffect } from 'react'
import { LoadingFullScreen } from '@gm-pc/react'
import { i18next } from 'gm-i18n'
import useDetailRouterParams from './use_detail_router_params'
import { doBatchPrint } from 'gm-x-printer'
import formatData from '../config/data_to_key'
import getPrintTemplate from './service/get_print_template'
import getTableData from './service/get_table_data'
import getBillInfo from './service/get_bill_info'
import getTemplateTableType from './utils/get_template_table_type'

const Print: React.VFC = () => {
  const { customerId, template_id, timeFilter, beginMoment, endMoment } =
    useDetailRouterParams()

  useEffect(() => {
    if (!template_id || !customerId) {
      window.alert('缺少打印模板信息')
      return
    }
    LoadingFullScreen.render({
      size: '100px',
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    const fetcher = async () => {
      try {
        const template = await getPrintTemplate(template_id)
        const billInfo = await getBillInfo({
          customerId,
          timeFilter,
        })
        const tableData = await getTableData(getTemplateTableType(template), {
          customerId,
          timeFilter,
        })

        const data = formatData(
          { common: billInfo, tableData },
          `${beginMoment.format('YYYY-MM-DD')} ~ ${endMoment.format(
            'YYYY-MM-DD',
          )}`,
        )
        console.log(data, { common: billInfo, tableData })

        LoadingFullScreen.hide()
        doBatchPrint([
          {
            data: data,
            config: template,
          },
        ])
        return undefined
      } catch (error) {
        return Promise.reject(error)
      }
    }
    fetcher().catch((err) => {
      console.error(err)
      window.alert(err.message || '未知错误')
    })
  }, [beginMoment, customerId, endMoment, template_id, timeFilter])

  return null
}

export default Print
