import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import Panel from './panel'
import Bulletin from './bulletin'
import { Query, PresetType } from 'gm_api/src/databi'
import { CountNewCustomer } from 'gm_api/src/enterprise'
import moment from 'moment'
import _ from 'lodash'
import { BulletinInfosOptions } from '../interface'

import { findIndexbyDate, getValue, getCustomerPrice } from '../utils'

let timer: number | undefined

const OperatingBulletin = observer(() => {
  const core = [
    'order_id_count',
    'order_price_sum',
    'customer_price_sum',
    'new_customer_num',
  ]
  const initInfos: BulletinInfosOptions = {
    customer_price_sum: {
      tAcount: 0,
      tName: '今日客单价（元）',
      color: '#F95A59',
      tLink: '/order/order_manage/list',
      yLink: '/order/order_manage/list',
      yAcount: 0,
      yName: '昨日客单价',
    },
    order_price_sum: {
      tAcount: 0,
      tName: '今日订单金额（元）',
      color: '#10CE6E',
      tLink: '/order/order_manage/list',
      yLink: '/order/order_manage/list',
      yAcount: 0,
      yName: '昨日订单金额',
    },
    order_id_count: {
      tAcount: 0,
      tName: '今日订单数（笔）',
      color: '#007EFF',
      tLink: '/order/order_manage/list',
      yLink: '/order/order_manage/list',
      yAcount: 0,
      yName: '昨日订单数',
    },
    new_customer_num: {
      tAcount: 0,
      tName: '今日新增商户数（个）',
      color: '#FFB822',
      tLink: '/customer/society/catering_customer_management',
      yLink: '/customer/society/catering_customer_management',
      yAcount: 0,
      yName: '昨日新增商户数',
    },
  }
  const [infos, setInfos] = useState(initInfos)
  const [updateTime, setUpdateTime] = useState(
    moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  )

  const clearTimer = () => {
    if (!timer) return
    window.clearInterval(timer)
    timer = undefined
  }

  const getData = () => {
    const y_begin = `${+moment().subtract(1, 'd').startOf('day').toDate()}`
    const t_begin = `${+moment().startOf('day').toDate()}`
    const t_end = `${+moment().add(1, 'd').startOf('day').toDate()}`
    return Promise.all([
      Query({
        time_ranges: [
          {
            begin_time: y_begin,
            end_time: t_begin,
          },
          {
            begin_time: t_begin,
            end_time: t_end,
          },
        ],
        preset_type: PresetType.PRESET_TYPE_ORDER_ORDER_SUMMARY,
      }),
      CountNewCustomer({
        begin_datetime: y_begin,
        end_datetime: t_end,
      }),
    ]).then((json) => {
      const [json1, json2] = json
      const { ranges } = json2.response
      const data1 = json1.response.data
      const _infos: BulletinInfosOptions = { ...initInfos }
      // 找到今天和昨天所在的索引
      const todayIndex = findIndexbyDate(data1, moment())
      const yesterdayIndex = findIndexbyDate(data1, moment().subtract(1, 'd'))
      core.forEach((key) => {
        if (['order_id_count', 'order_price_sum'].includes(key)) {
          _infos[key].tAcount = getValue(data1, todayIndex, key)
          _infos[key].yAcount = getValue(data1, yesterdayIndex, key)
        } else if (key === 'customer_price_sum') {
          _infos[key].tAcount = getCustomerPrice(data1, todayIndex)
          _infos[key].yAcount = getCustomerPrice(data1, yesterdayIndex)
        }
      })

      _infos.new_customer_num.tAcount =
        _.find(ranges, (range) => range.begin_datetime === y_begin)?.count || 0
      _infos.new_customer_num.yAcount =
        _.find(ranges, (range) => range.end_datetime === t_end)?.count || 0
      setUpdateTime(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))
      setInfos(_infos)

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
  }, [])

  return (
    <Panel
      title={
        <>
          <span className='tw-mr-3'>{t('运营简报')}</span>
          {updateTime && (
            <span className='tw-text-desc'>{t('更新时间：') + updateTime}</span>
          )}
        </>
      }
    >
      <Flex>
        {core.map((key, index) => {
          return (
            infos && (
              <Bulletin
                className={`tw-text-white tw-m-2 b-home-bulletin-${index}`}
                key={key}
                flip
                options={infos[key]}
              />
            )
          )
        })}
      </Flex>
    </Panel>
  )
})

export default OperatingBulletin
