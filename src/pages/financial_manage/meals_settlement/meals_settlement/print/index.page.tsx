import { t } from 'gm-i18n'
import React, { FC, useEffect, useState } from 'react'
import _ from 'lodash'
import store from '../store'
import { LoadingChunk, Flex } from '@gm-pc/react'
import moment from 'moment'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import { setTitle } from '@gm-common/tool'
import Big from 'big.js'
import { toFixed } from '@/common/util'

setTitle(t('打印'))

const MealSettlement: FC = observer(() => {
  const [loading, setLoading] = useState<boolean>(false)
  const { meal_time_map, school_map, print_data_ } = store

  const location = useGMLocation<{
    query?: string
  }>()
  const filter_data = location?.query.query
  const { begin_time, end_time } = JSON.parse(filter_data)
  useEffect(() => {
    setLoading(true)
    store.fetchPrinter(filter_data!).then(() => {
      setLoading(false)
      setTimeout(() => {
        window.print()
      }, 1500)
      return null
    })
    store.fetchMealTimes()
    return () => {}
  }, [])
  return (
    <LoadingChunk loading={loading} text={t('拼命加载中')}>
      <div className='gm-margin-15'>
        {print_data_.length &&
          _.map(print_data_, (item) => {
            return (
              <div
                className='gm-margin-top-20'
                style={{ pageBreakAfter: 'always' }}
              >
                <Flex column alignCenter>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {t('对账单')}
                  </div>
                </Flex>
                {/* 表头 */}
                <div>
                  <span>
                    {t('学校名称')}:{school_map[item?.school_name!] || '-'}
                  </span>
                </div>
                <div className='gm-margin-top-10'>
                  <span className='b-width-200'>
                    {t('收货日期')}:
                    {`${moment(+begin_time).format('YYYY-MM-DD')} ~ ${moment(
                      +end_time,
                    ).format('YYYY-MM-DD')}`}
                  </span>
                  <span className='gm-margin-left-20'>
                    {t('打印时间')}:{moment().format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
                {/* 汇总表格 */}
                <table
                  className='table table-hover table-bordered gm-margin-bottom-10 gm-margin-top-10'
                  width='50%'
                >
                  <tbody>
                    <tr className='gm-text-bold'>
                      <td width='100px'>{t('')}</td>
                      {_.map(item?.sum_table, (a) => {
                        return (
                          <td align='center'>
                            {meal_time_map[a?.key!] || '-'}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td width='35px' align='center' className='gm-text-bold'>
                        {t('用餐人次')}
                      </td>
                      {_.map(item?.sum_table, (a) => {
                        return <td align='center'>{a?.number! || '-'}</td>
                      })}
                    </tr>
                    <tr>
                      <td width='35px' align='center' className='gm-text-bold'>
                        {t('金额')}
                      </td>
                      {_.map(item?.sum_table, (a) => {
                        return (
                          <td align='center'>
                            {toFixed(Big(a?.money! || 0)) || '-'}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>

                {/* 表格 */}
                <table
                  className='table table-hover table-bordered gm-margin-top-10'
                  width='100%'
                >
                  <tbody>
                    <tr className='gm-text-bold'>
                      <td width='35px' align='center'>
                        {t('序号')}
                      </td>
                      <td align='center'>{t('日期')}</td>
                      <td align='center'>{t('餐次')}</td>
                      <td align='center'>{t('用餐人次')}</td>
                      <td align='center'>{t('金额')}</td>
                    </tr>
                    {_.map(item?.table!, (it, index) => {
                      return (
                        <tr key={index}>
                          <td align='center' className='gm-text-bold'>
                            {index + 1}
                          </td>
                          <td align='center'>
                            {moment(it?.receive_time_toYYYYMMDD!).format(
                              'YYYY-MM-DD',
                            )}
                          </td>
                          <td align='center'>
                            {meal_time_map[it?.service_period_id!] || '-'}
                          </td>
                          <td align='center'>{it?.order_id_count!}</td>
                          <td align='center'>
                            {toFixed(Big(it?.sale_price_sum! || 0)) || '-'}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className='gm-text-bold'>
                      <td colSpan={3} align='center'>
                        {t('小计')}
                      </td>
                      <td align='center'>
                        {Big(item?.meal_count!).toFixed(0) || '-'}
                      </td>
                      <td align='center'>
                        {toFixed(Big(item?.money_sum! || 0)) || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
      </div>
    </LoadingChunk>
  )
})

export default MealSettlement
