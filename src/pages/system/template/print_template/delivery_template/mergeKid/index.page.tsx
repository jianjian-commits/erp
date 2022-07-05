import React, { useEffect, useState, FC } from 'react'
import { t } from 'gm-i18n'
import { LoadingFullScreen, Button } from '@gm-pc/react'
import { setTitle, LocalStorage } from '@gm-common/tool'
import _ from 'lodash'
import {
  ListOrderWithRelation,
  ListOrderWithRelationResponse,
} from 'gm_api/src/orderlogic'
import { useGMLocation } from '@gm-common/router'
import { handleOrderPrinterData, handleKidPrintData } from '../util'
import { ListCustomer } from 'gm_api/src/enterprise'
import KidPrintItem from './components/kidPrintItem'
import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import { groupByType } from '../../enum'

setTitle(t('打印'))
const MAX_LIMIT = 10

const MergeKidPrint: FC = () => {
  const location = useGMLocation<{
    query: string
    showRise: string
    childTypeValue: childType
  }>()
  const { query, showRise, childTypeValue } = location.query
  const [list, setList] = useState({})
  /**
   * 获取打印数据
   */
  function getPrintData() {
    const req = {
      calc_only_print: true,
      filter: {
        common_list_order: JSON.parse(query),
        paging: { limit: MAX_LIMIT, offset: -MAX_LIMIT },
        relation_info: {
          need_customer_info: true,
          need_driver_info: true,
          need_quotation_info: true,
          need_sku_info: true,
          need_user_info: true,
        },
      },
      relation: {
        need_customer_route_info: true,
      },
    }
    /**
     * 数据量大的时候，进行分批请求，有待考虑, (打印全部)
     * 取值order_ids.length 为选择部分 订单打印
     * 取值 LocalStorage.get('delivory_order_count') 为表格全选打印
     */
    const orderTotalNum = LocalStorage.get('delivory_order_count')
    const count = Math.ceil(orderTotalNum / MAX_LIMIT)
    //! count在订单打印是为1，因为订单没有做批量打印
    const reqList = _.map(new Array(count || 1).fill(1), () => {
      const { paging } = req.filter
      req.filter.paging = {
        ...paging,
        offset: MAX_LIMIT + paging.offset,
      }
      return ListOrderWithRelation(req)
    })
    reqList.push(ListCustomer({ paging: { limit: 999 }, level: 1 }))
    // const reqList = [
    //   ListOrderWithRelation(req),
    //   ListCustomer({ paging: { limit: 999 }, level: 1 }),
    // ]

    return Promise.all(reqList)
      .then((res: any[]) => {
        const responseLists: ListOrderWithRelationResponse[] = _.map(
          res.filter((item, i) => i !== res.length - 1),
          (json) => {
            return json.response
          },
        )
        const newResponseList = JSON.parse(JSON.stringify(responseLists))

        const orders = _.map(
          newResponseList,
          (json) => json.response.orders,
        ).flat()
        const dataList = _.reduce(responseLists, (prev, next) => {
          return _.merge(prev, next)
        })
        dataList.response.orders = orders
        const parentCustomerList = res[res.length - 1].response
        return { dataList, parentCustomerList }
      })
      .catch(() => {
        window.alert(t('数据异常，请重试！'))
        window.close()
      })
  }

  const start = async () => {
    const { dataList, parentCustomerList } = await getPrintData()

    LoadingFullScreen.hide()
    // 打平，组装数据
    const list = handleOrderPrinterData(dataList, parentCustomerList.customers)
    // 转kid数据结构
    const kidPrintList = handleKidPrintData(list)
    setList(kidPrintList)
  }

  useEffect(() => {
    // 常规自定义打印↓
    LoadingFullScreen.render({
      size: '100',
      text: t('正在加载数据，请耐心等待!'),
    })

    start()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Button
          type='primary'
          className='hidden-print'
          style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            overflow: 'hidden',
          }}
          onClick={handlePrint}
        >
          {t('打印')}
        </Button>
      </div>
      {/* 按商品类型拆分 */}
      {_.reduce(
        list,
        (all, item, index) => {
          let num = 0
          const orderData = _.groupBy(
            item.details,
            (v) => v[groupByType[childTypeValue]],
          )
          const orderDataLength = Object.keys(orderData).length
          const data = _.map(orderData, (value, key) => {
            const itemData = {
              ..._.omit(item, 'details'),
              details: _.reduce(
                value,
                (all, item) => ({ ...all, [item.ssu_name]: item }),
                {},
              ),
            }
            num++
            return (
              <KidPrintItem
                data={itemData}
                key={index}
                riseTitle={t(
                  `配送单${
                    JSON.parse(showRise)
                      ? '(' + num + '/' + orderDataLength + key + ')'
                      : ''
                  }`,
                )}
              />
            )
          })
          return [...all, ...data]
        },
        [] as any[],
      )}
    </>
  )
}

export default MergeKidPrint
