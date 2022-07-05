import { t } from 'gm-i18n'
import React, { FC, useEffect, useState } from 'react'
import _ from 'lodash'
import store from '../detail/store'
import { LoadingChunk, Flex, Price } from '@gm-pc/react'
import moment from 'moment'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import { setTitle } from '@gm-common/tool'
import Big from 'big.js'
import { toFixed } from '@/common/util'

setTitle(t('打印'))

const MerchantSettlement: FC = observer(() => {
  const [loading, setLoading] = useState<boolean>(false)
  const { settle_sheet, detail_list, customer_info } = store
  const { china_vat_invoice } = customer_info?.settlement!
  const location = useGMLocation<{
    settle_sheet_id?: string
  }>()
  const { settle_sheet_id } = location?.query

  const summary = _.groupBy(detail_list, (order) => {
    return order?.receive_customer_id!
  })

  const show_summary: { customer_name: string; sale_price: number }[] = _.map(
    summary,
    (value, key) => {
      let total: number = 0
      _.forEach(value, (item) => {
        total = total + Number(item?.sale_price!)
      })
      return {
        customer_name: value![0]?.customer!,
        sale_price: total,
      }
    },
  )
  useEffect(() => {
    setLoading(true)
    store.fetchSettleSheetDetail(settle_sheet_id!).then(() => {
      setLoading(false)
      setTimeout(() => {
        window.print()
      }, 1000)
      return null
    })
  }, [])
  return (
    <LoadingChunk loading={loading} text={t('拼命加载中')}>
      <div className='gm-margin-15'>
        <div className='gm-margin-top-20' style={{ pageBreakAfter: 'always' }}>
          <Flex column alignCenter className='gm-margin-bottom-20'>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {t('对账单')}
            </div>
          </Flex>
          <Flex
            justifyBetween
            alignCenter
            width='65%'
            className='gm-margin-top-10'
          >
            <Flex column alignStart className='gm-margin-top-10'>
              <span className='gm-margin-bottom-20 gm-margin-left-20'>
                {t('公司')}: {settle_sheet?.company! || '-'}
              </span>
              <span className='gm-margin-bottom-20 gm-margin-left-20'>
                {t('联系人')}:{' '}
                {china_vat_invoice?.financial_contact_name! || '-'}
              </span>
              <span className='gm-margin-bottom-20 gm-margin-left-20'>
                {t('对账单总金额')}:
                <Price value={+settle_sheet.total_price! || 0} />
              </span>
              <span className='gm-margin-bottom-20 gm-margin-left-20'>
                {t('已结款金额')}:
                <Price value={+settle_sheet.actual_amount! || 0} />
              </span>
            </Flex>

            <Flex column alignStart className='gm-margin-top-10'>
              <span className='gm-margin-bottom-20'>
                {t('打印时间')}: {moment().format('YYYY-MM-DD HH:mm:ss')}
              </span>
              <span className='gm-margin-bottom-20'>
                {t('联系人电话')}:
                {china_vat_invoice?.financial_contact_phone! || '-'}
              </span>
              <span className='gm-margin-bottom-20' />
              <span className='gm-margin-bottom-20'>
                {t('待结款金额')}:
                <Price value={+settle_sheet.need_amount! || 0} />
              </span>
            </Flex>
          </Flex>

          {/* 客户明细 */}
          <Flex column className='gm-margin-left-20 gm-margin-top-20'>
            <strong>{t('客户明细: ')}</strong>
            <table
              className='table table-hover table-bordered gm-margin-top-5'
              width='100%'
            >
              <tbody>
                <tr className='gm-text-bold'>
                  <td width='35px' align='center'>
                    {t('序号')}
                  </td>
                  <td align='center'>{t('客户名称')}</td>
                  <td align='center'>{t('销售金额')}</td>
                </tr>
                {_.map(show_summary, (order, index) => {
                  return (
                    <tr key={index}>
                      <td align='center' className='gm-text-bold'>
                        {index + 1}
                      </td>
                      <td align='center'>{order?.customer_name! || '-'}</td>
                      <td align='center'>
                        <Price value={+order?.sale_price! || 0} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Flex>
          {/* 订单明细 */}
          <Flex column className='gm-margin-left-20 gm-margin-top-20'>
            <strong>{t('订单明细: ')}</strong>
            <table
              className='table table-hover table-bordered gm-margin-top-5'
              width='100%'
            >
              <tbody>
                <tr className='gm-text-bold'>
                  <td width='35px' align='center'>
                    {t('序号')}
                  </td>
                  <td align='center'>{t('客户名称')}</td>
                  <td align='center'>{t('下单日期')}</td>
                  <td align='center'>{t('收货日期')}</td>
                  <td align='center'>{t('订单号')}</td>
                  <td align='center'>{t('销售金额')}</td>
                </tr>
                {_.map(detail_list, (order, index) => {
                  return (
                    <tr key={index}>
                      <td align='center' className='gm-text-bold'>
                        {index + 1}
                      </td>
                      <td align='center'>{order?.customer! || '-'}</td>
                      <td align='center'>
                        {moment(+order?.create_time!).format(
                          'YYYY-MM-DD HH:mm:ss',
                        ) || '-'}
                      </td>
                      <td align='center'>
                        {moment(+order?.receive_time!).format(
                          'YYYY-MM-DD HH:mm:ss',
                        ) || '-'}
                      </td>
                      <td align='center'>{order?.serial_no! || '-'}</td>

                      <td align='center'>
                        <Price value={+order?.sale_price! || 0} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Flex>
        </div>
      </div>
    </LoadingChunk>
  )
})

export default MerchantSettlement
