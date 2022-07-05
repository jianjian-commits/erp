import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Flex } from '@gm-pc/react'
import Panel from './panel'
import DateButton from './date_button'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import lineEChartsHoc from '@/common/components/customize_echarts/line_echarts_hoc'
import { PresetType, Query } from 'gm_api/src/databi'
import _ from 'lodash'
import { ProfixItemOptions } from '../interface'
import globalStore from '@/stores/global'

const LineECharts = lineEChartsHoc(BaseECharts)

let timer: number | undefined

const Profix = observer(() => {
  const [begin, setBegin] = useState(moment().subtract(7, 'd').toDate())
  const [end, setEnd] = useState(moment().toDate())
  const [list, setList] = useState<ProfixItemOptions[]>([])

  const clearTimer = () => {
    if (!timer) return
    window.clearInterval(timer)
    timer = undefined
  }

  const getData = () => {
    return Query({
      time_ranges: [
        {
          begin_time: `${+begin}`,
          end_time: `${+end}`,
        },
      ],
      preset_type: PresetType.PRESET_TYPE_ORDER_ORDER_TREND,
    }).then((json) => {
      const _list = _.map(
        json.response.data?.[0]?.model_values,
        ({ kv = {} }) => {
          return {
            ..._.pick(
              kv,
              'outstock_price_sum',
              'order_price_sum',
              'sale_price_sum',
            ),
            date: moment(kv.order_time).format('YYYY-MM-DD'),
          }
        },
      )
      _list.forEach((item) => {
        item.order_price_sum = Number(item.order_price_sum).toFixed(2)
        if (globalStore.isLite) return
        item.outstock_price_sum = Number(item.outstock_price_sum).toFixed(2)
        item.sale_price_sum = Number(item.sale_price_sum).toFixed(2)
      })
      setList(_list)
      return json
    })
  }

  useEffect(() => {
    getData().then(() => {
      timer = window.setInterval(() => {
        getData()
        return null
      }, 6000000)
      return null
    })
    return () => {
      clearTimer()
    }
  }, [begin, end])

  const handleSelectChange = (begin: Date, end: Date) => {
    setBegin(begin)
    setEnd(end)
  }
  const axiosGroups = [{ x: 'date', y: 'order_price_sum' }]

  if (!globalStore.isLite) {
    axiosGroups.push(
      { x: 'date', y: 'outstock_price_sum' },
      { x: 'date', y: 'sale_price_sum' },
    )
  }
  return (
    <Panel
      title={t(globalStore.isLite ? '下单金额趋势' : '销售额趋势')}
      right={
        <Flex alignStart style={{ height: '35px' }}>
          <DateButton
            range={[7, 15, 30]}
            onChange={(begin, end) => handleSelectChange(begin, end)}
          />
        </Flex>
      }
    >
      <LineECharts
        data={list}
        axisGroup={axiosGroups}
        axisGroupName={
          globalStore.isLite
            ? [t('下单金额')]
            : [t('下单金额'), t('出库金额'), t('销售额')]
        }
        fillAndFormatDate={{
          begin: begin,
          end: end,
          fillItemName: 'date',
          dateFormatType: 'MM-DD',
        }}
        style={{ height: '400px', width: '100%' }}
        hasNoData={!list.length}
        customOption={{
          mainColor: ['#007EFF', '#10CE6E', '#F95A59', '#FFB822'],
        }}
        onSetCustomOption={(option) => ({
          ...option,
          grid: {
            ...option.grid,
            left: '50px',
            right: '5%',
            bottom: '45px',
          },
          legend: {
            ...option.legend,
            top: '10px',
            show: !globalStore.isLite,
          },
        })}
      />
    </Panel>
  )
})

export default Profix
