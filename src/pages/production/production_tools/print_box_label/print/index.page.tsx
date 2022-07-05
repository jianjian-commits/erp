import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import { LoadingFullScreen } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import _ from 'lodash'
import toKey from '../edit/config/data_to_key'
import { doBatchPrint } from 'gm-x-printer'

const PrintBox = () => {
  const {
    query: { id, datas, type, times },
  } = useGMLocation<{
    id: string
    datas: string
    type: 'table' | 'text'
    times: string
  }>()
  const printDatas: any[] = JSON.parse(datas)

  useEffect(() => {
    handleDoIt()
  }, [])

  async function handleDoIt() {
    LoadingFullScreen.render({
      size: '100px',
      text: t('正在加载数据，请耐心等待!'),
    })
    const list: any[] = await prepareData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  const prepareData = () => {
    return GetPrintingTemplate({
      printing_template_id: id,
    })
      .then(({ response }) => {
        const content = JSON.parse(
          response.printing_template.attrs?.layout as string,
        )
        if (!printDatas.length && type === 'text') {
          return _.times(+times, () => {
            return {
              data: [],
              config: content,
            }
          })
        }

        return _.map(printDatas, (data) => {
          return {
            data: toKey(data),
            config: content,
          }
        })
      })
      .catch(() => {
        window.alert(t('模板配置发生变化，请返回上一页'))
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(new Error(''))
      })
  }

  return null
}

export default PrintBox
