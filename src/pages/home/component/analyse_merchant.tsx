import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex, Select, Price } from '@gm-pc/react'
import Panel from './panel'
import DateButton from './date_button'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import barEChartsHoc from '@/common/components/customize_echarts/bar_echarts_hoc'
import { Query, PresetType } from 'gm_api/src/databi'
import { GetManyCustomer } from 'gm_api/src/enterprise'
import { FieldValue } from 'gm_api/src/analytics'
import { AnalyseMerchantItemOptions } from '../interface'
import moment from 'moment'
import _ from 'lodash'
import Big from 'big.js'
import { getModelValuesKV, toFixed } from '@/common/util'
import globalStore from '@/stores/global'

const TYPE_LIST = [
  { text: t('下单金额'), value: 1 },
  { text: t('订单数'), value: 2 },
]

const BarECharts = barEChartsHoc(BaseECharts)

let timer: number | undefined
const AnalyseMerchant = observer(() => {
  const [begin, setBegin] = useState(
    moment().subtract(7, 'd').startOf('day').toDate(),
  )
  const [end, setEnd] = useState(moment().endOf('day').toDate())
  const [orderCountList, setOrderCountList] = useState<
    AnalyseMerchantItemOptions[]
  >([])
  const [orderPriceList, setOrderPriceList] = useState<
    AnalyseMerchantItemOptions[]
  >([])
  const [radio, setRadio] = useState<number>(1)

  const clearTimer = () => {
    if (!timer) return
    window.clearInterval(timer)
    timer = undefined
  }

  const getData = () => {
    return Promise.all([
      Query({
        time_ranges: [
          {
            begin_time: `${+begin}`,
            end_time: `${+end}`,
          },
        ],
        preset_type:
          PresetType.PRESET_TYPE_ORDER_ORDER_RANK_CUSTOMER_ORDER_PRICE_SUM,
      }),
      Query({
        time_ranges: [
          {
            begin_time: `${+begin}`,
            end_time: `${+end}`,
          },
        ],
        preset_type:
          PresetType.PRESET_TYPE_ORDER_ORDER_RANK_CUSTOMER_ORDER_ID_COUNT,
      }),
    ]).then((arr) => {
      const getList = (json: any, key: string) => {
        // const list = _.map(json.response.data[0].model_values, (mv) => {
        //   const customer_id = getValue(mv.field_values, 'receive_customer_id')
        //   return {
        //     customer_id,
        //     customer_name: '-',
        //     order_amount:
        //       key === 'order_id_count'
        //         ? getValue(mv.field_values, key)
        //         : toFixed(Big(getValue(mv.field_values, key))),
        //   }
        // })
        const list = getModelValuesKV(json.response.data[0].model_values).map(
          (item) => ({
            ...item,
            customer_id: item?.receive_customer_id,
            customer_name: '-',
            order_amount:
              key === 'order_id_count' ? item[key] : toFixed(Big(item[key])),
          }),
        )
        return _.slice(
          _.sortBy(list, (c) => _.toNumber(c.order_amount)),
          -10,
        )
      }
      const orderCountList = getList(arr[1], 'order_id_count')
      const orderPriceList = getList(arr[0], 'sale_price_sum')
      const customer_ids = _.map(
        [...orderCountList, ...orderPriceList],
        (mv) => {
          return mv?.customer_id
        },
      )
      return GetManyCustomer({ customer_ids }).then((json) => {
        const mapData = (list: AnalyseMerchantItemOptions[]) => {
          return _.map(list, (oc) => {
            return {
              ...oc,
              order_amount: Number(oc.order_amount).toFixed(2),
              customer_name: json.response.customers[oc.customer_id]?.name,
            }
          })
        }

        setOrderCountList(mapData(orderCountList))
        setOrderPriceList(mapData(orderPriceList))

        return json
      })
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

  const handleTypeChange = (value: number) => {
    setRadio(value)
  }
  const unit = radio === 1 ? Price.getUnit() : '笔'
  const data = radio === 1 ? orderPriceList : orderCountList

  return (
    <Panel
      title={t('商户销量排行')}
      right={
        <Flex alignStart height='35px'>
          <DateButton
            range={[7, 15, 30]}
            onChange={(begin, end) => handleSelectChange(begin, end)}
          />
          <Select
            className='gm-margin-left-10'
            value={radio}
            data={TYPE_LIST}
            onChange={handleTypeChange}
          />
        </Flex>
      }
    >
      <BarECharts
        // @ts-ignore
        style={{ height: '400px', width: '100%' }}
        data={data}
        axisGroup={[{ y: 'customer_name', x: 'order_amount' }]}
        hasNoData={data.length === 0}
        isHorizontal
        axisName={{ x: unit }}
        axisGroupName={[t('商户销量排行')]}
        onSetCustomOption={(option) => {
          return {
            ...option,
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                const { name, seriesName, value } = params
                return `${seriesName}<br/>${name}：${value.order_amount + unit}`
              },
            },
            grid: {
              left: '15%',
            },
            legend: {
              ...option.legend,
              show: !globalStore.isLite,
            },
            yAxis: {
              ...option.yAxis,
              axisLabel: {
                ...option.yAxis.axisLabel,
                formatter: (name: string) => {
                  return name?.length > 5 ? name.substr(0, 5) + '...' : name
                },
                margin: -10,
              },
            },
          }
        }}
      />
    </Panel>
  )
})

export default AnalyseMerchant
