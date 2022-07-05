import React, { FC } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import moment from 'moment'
import { Flex } from '@gm-pc/react'
import Big from 'big.js'
import { summation } from '../../util'

interface KidPrintItemProps {
  data: any
  riseTitle: string
}

const KidPrintItem: FC<KidPrintItemProps> = ({ data, riseTitle }) => {
  const { details, customers, parent_customer_name, receive_time } = data
  // 表头商户数组对象去重排序
  const merchandiseList = _.uniqWith(customers, _.isEqual)
  let i = 1
  const productPanel = _.map(details, (p) => {
    // 商户分组
    const detailMerchandise = _.groupBy(p.ssuDetails, 'receive_customer')
    return (
      <tr key={i}>
        <td>{i++}</td>
        <td>{p.category_name_1}</td>
        <td>{p.ssu_name}</td>
        {/* 去掉规格 */}
        {/* <td>{p.unit_text}</td> */}
        {_.map(merchandiseList, (item, index) => {
          // 根据表头的商户顺序插入数据 有数据返回数据，无数据返回空
          if (detailMerchandise[item.receive_customer]) {
            // 合并同商户下的下单总数
            const sum = detailMerchandise[item.receive_customer].reduce(
              (acc, cur) => {
                return acc + +cur.quantity
              },
              0,
            )
            return (
              <td key={index}>
                {`${parseInt(Big(sum || 0).toFixed(2))}
                ${p.ssu_unit_name}`}
              </td>
            )
          } else {
            return <td>{}</td>
          }
        })}
        <td>{`${p.quantity}${p.ssu_unit_name}`}</td>
        {/* 暂时出库数单位取下单单位 */}
        <td>{`${p.ssu_outstock_quantity}${p.ssu_unit_name}\n${p.ssu_outstock_quantity_second}${p.ssu_outstock_unit_second}`}</td>
        <td>{`${Big(p?.real_item_price || 0)
          .div(p?.ssu_outstock_quantity || 1)
          .toFixed(2)}${p.sa_unit}`}</td>
        <td>{p.real_item_price}</td>
      </tr>
    )
  })

  // 下单金额
  const total_price = summation(data.details, 'order_price')
  // 出库金额
  const real_price = summation(data.details, 'real_item_price')
  const footerList = [
    {
      name: t('下单金额'),
      value: total_price,
    },
    {
      name: t('出库金额'),
      value: real_price,
    },
  ]
  return (
    <div className='gm-margin-15' style={{ pageBreakAfter: 'always' }}>
      {/* 页眉 */}
      <Flex column alignCenter>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{riseTitle}</div>
      </Flex>
      <div>
        <span>
          {t('商户公司')}:{parent_customer_name || '-'}
        </span>
      </div>
      <div className='gm-margin-top-10'>
        <span className='b-width-200'>
          {t('收货日期')}:{moment(+receive_time).format('YYYY-MM-DD')}
        </span>
        <span className='gm-margin-left-20'>
          {t('打印时间')}:{moment().format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </div>
      {/* 表格 */}
      <table
        className='table table-hover table-bordered gm-margin-top-10'
        width='100%'
      >
        <tbody>
          <tr>
            <td width='35px'>{t('序号')}</td>
            <td width='35px'>{t('类别')}</td>
            <td>{t('商品名')}</td>
            {/* <td>{t('规格')}</td> */}
            {_.map(merchandiseList, (item, index) => (
              // 去重后的商户列表
              <td key={index} className='gm-text-bold'>
                {item.receive_customer}
              </td>
            ))}
            <td>
              {t('下单数')}
              {/* <br />
              {t('(包装单位)')} */}
            </td>
            <td>
              &nbsp;&nbsp;{t('出库数')}
              {/* <br />
              {t('(包装单位)')} */}
            </td>
            {/* <td>{t('单价(包装单位)')}</td>
             */}
            <td>{t('单价')}</td>
            <td>{t('出库金额')}</td>
          </tr>
          {/* 各商户下单数据 */}
          {productPanel}
        </tbody>
      </table>
      {/* 页脚 */}
      <Flex className='gm-margin-top-10 gm-margin-lr-10'>
        {_.map(footerList, (item, index) => (
          <Flex flex={1} key={index}>
            {item.name}:{item.value}
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
export default KidPrintItem
