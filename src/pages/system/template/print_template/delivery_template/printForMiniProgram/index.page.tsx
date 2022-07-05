import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { Flex, LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import { LocalStorage, setTitle, Storage } from '@gm-common/tool'
import _ from 'lodash'
import {
  PrintOrderListType,
  PrintDataType,
  PrintTemplateRelationType,
} from '../../types'
import {
  Application,
  GetPrintingTemplate,
  ListApplication,
  GetPrintingTemplateByCustomerId,
} from 'gm_api/src/preference'
import {
  ListOrderWithRelation,
  ListOrderWithRelationResponse,
} from 'gm_api/src/orderlogic'
import { UpdateOrderPartField, ListOrderResponse } from 'gm_api/src/order'
import { useGMLocation } from '@gm-common/router'
import { order as formatOrder, driverTaskData } from '../config/data_to_key'
import { driverTaskConfig } from '../config/template_config/index'
import {
  handleOrderPrinterData,
  handleDriverPrintList,
  handleMapOrderIds,
} from '../util'
import globalStore from '@/stores/global'
import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import { splitOrderData } from '@/pages/system/template/print_template/util'
import { Button } from 'antd'
import html2canvas from 'html2canvas'
import { accessTokenKey } from '@gm-common/x-request/src/util'
// import { authInfoKey, accessTokenKey } from './util'
import wx from 'weixin-js-sdk'

const MAX_LIMIT = 10

const Print = () => {
  const location = useGMLocation<{
    template_id: string
    query: string
    sort_by: string
    to_print_task: string
    delivery_task: string
    showRise: string
    token: string
    childTypeValue: childType
  }>()
  const { template_id, query, sort_by, showRise, childTypeValue, token } =
    location.query
  console.log('token', token)
  Storage.set(accessTokenKey, token)
  // 客户配置获取对应的模板
  const getTempplateIdByCustomer = (
    customer_ids: string[],
  ): Promise<undefined | PrintTemplateRelationType> => {
    const template_delivery_type = template_id === 'customer_config' ? 2 : 1
    const req = { customer_ids, template_delivery_type }
    return GetPrintingTemplateByCustomerId(req).then((json) => {
      return json.response.printing_template_relations
    })
  }

  // 获取单一模板
  function getSinglePrintTemplate(templateId: string = template_id) {
    return GetPrintingTemplate({
      printing_template_id: templateId,
    }).then((json) => {
      return json.response.printing_template
    })
  }

  /**
   * 使用单一模板打印
   */
  function getPrintData(): Promise<
    undefined | PrintDataType<ListOrderWithRelationResponse>
  > {
    const { order_ids } = JSON.parse(query)
    const req = {
      filter: {
        common_list_order: _.omit(JSON.parse(query), [
          'order_time_from_time',
          'order_time_to_time',
        ]),
        paging: { limit: MAX_LIMIT, offset: -MAX_LIMIT },
        relation_info: {
          need_customer_info: true,
          need_driver_info: true,
          need_quotation_info: true,
          need_sku_info: true,
          need_user_info: true,
          need_menu_period_group: true,
        },
      },
      relation: {
        need_customer_route_info: true,
        need_driver_sign: true,
      },
      sort_by: JSON.parse(sort_by),
    }
    /**
     * 数据量大的时候，进行分批请求，有待考虑, (打印全部)
     * 取值order_ids.length 为选择部分 订单打印
     * 取值 LocalStorage.get('delivory_order_count') 为表格全选打印
     */
    const orderTotalNum =
      (order_ids && order_ids.length) ||
      LocalStorage.get('delivory_order_count')
    const count = Math.ceil(orderTotalNum / MAX_LIMIT)
    const reqList = _.map(new Array(count).fill(1), () => {
      const { paging } = req.filter
      req.filter.paging = {
        ...paging,
        offset: MAX_LIMIT + paging.offset,
      }
      return ListOrderWithRelation(req)
    })

    return Promise.all(reqList)
      .then((res: any[]) => {
        const responseLists = _.map(res, (json) => {
          return json.response
        })
        const newResponseList = JSON.parse(JSON.stringify(responseLists))
        const orders = _.map(
          newResponseList,
          (json) => json.response.orders,
        ).flat()
        const dataList = _.reduce(responseLists, (prev, next) => {
          return _.merge(prev, next)
        })
        dataList.response.orders = orders
        return { dataList }
      })
      .catch(() => {
        window.alert(t('模板配置发生变化，请重试！'))
        window.close()
        return undefined
      })
  }

  async function getDeliveryConfigList(
    printData: PrintDataType<ListOrderWithRelationResponse>,
    targetAppObj: Application | undefined,
  ) {
    const { delivery_task, to_print_task } = location.query
    try {
      // 后台返回数据台乱。。 整理后台返回的数据
      const list = handleOrderPrinterData(printData.dataList)
      let printOrderList: PrintOrderListType[] | undefined
      if (
        template_id !== 'customer_config' &&
        template_id !== 'company_config'
      ) {
        // 正常模板配置
        const singLeTemplate = (await getSinglePrintTemplate()).attrs?.layout
        const template = JSON.parse(singLeTemplate as string)
        const driverTaskPrintList = [] // 司机配送任务清单数据

        // 配送单据
        if (delivery_task === 'true') {
          try {
            printOrderList = _.reduce(
              list,
              (all, next) => [
                ...all,
                ...splitOrderData({
                  item: next,
                  template,
                  targetAppObj,
                  showRise,
                  childTypeValue,
                  formatOrder,
                }),
              ],
              [] as PrintOrderListType[],
            )
          } catch (error) {
            console.log(error)
          }
        }
        // 打印 司机任务单
        if (to_print_task === 'true') {
          // 司机任务单
          const driverTaskList = driverTaskData(list)
          printOrderList = handleDriverPrintList(
            driverTaskList,
            driverTaskConfig,
            template,
          )
        }
        return printOrderList
      } else {
        // 按商户和账户配置
        const { relation_info, orders } = printData.dataList
          .response as ListOrderResponse
        // 抽取orders里面关联的customer_id
        const customer_ids = _.map(orders, (order) => {
          return relation_info?.customers?.[order.bill_customer_id]?.customer_id
        })
        // customeId和对应的template
        let printing_template_relations: PrintTemplateRelationType
        try {
          printing_template_relations = (await getTempplateIdByCustomer(
            customer_ids,
          )) as PrintTemplateRelationType
          if (JSON.stringify(printing_template_relations) === '{}') {
            throw new Error()
          }
        } catch (error) {
          window.alert(t('当前暂无模板数据，请配置后重试'))
          window.close()
          return
        }
        const printOrderList = _.reduce(
          customer_ids,
          async (all, customerId, index) => {
            const printTemplate = printing_template_relations?.[customerId]
            if (!printTemplate) {
              // 没有对应的模板数据时，说明没有配置对应的模板，不继续打印
              window.alert(t('模板配置发生变化，请重试！'))
              window.close()
            }
            // 当前订单对应的template_id
            const curTemplateId = printTemplate?.printing_template_id
            // 拿取到的模板字符串
            const templateStr = (await getSinglePrintTemplate(curTemplateId))
              .attrs?.layout

            return [
              ...(await all),
              ...splitOrderData({
                item: list[index],
                template: JSON.parse(templateStr as string),
                targetAppObj,
                showRise,
                childTypeValue,
                formatOrder,
              }),
            ]
          },
          [] as unknown as Promise<PrintOrderListType[]>,
        )
        return printOrderList
      }
    } catch (error) {
      window.alert(t('模板数据出错，请核对后重试！'))
      window.close()
    }
  }

  const start = async () => {
    // 获取打印数据
    const printData = await getPrintData()

    let targetAppObj: Application | undefined
    try {
      const getAppId = await ListApplication()
      const groupId = globalStore.userInfo.group_id
      targetAppObj = _.find(getAppId.response.applications, (item) => {
        return item.group_id === groupId
      })
    } catch (error) {
      window.alert(t('订单二维码获取商城小程序id失败'))
    }

    // 打印模板数据
    const printOrderList = await getDeliveryConfigList(
      printData as PrintDataType<ListOrderWithRelationResponse>,
      targetAppObj,
    )
    LoadingFullScreen.hide()

    // 执行打印
    doBatchPrint(printOrderList, false, { isPrint: false, isTipZoom: false })
    return printData && printData.dataList
  }

  useEffect(() => {
    // 常规自定义打印↓
    LoadingFullScreen.render({
      size: '100',
      text: t('正在加载数据，请耐心等待!'),
    })

    start().then((res) => {
      const order_ids = handleMapOrderIds(res.response.orders)
      UpdateOrderPartField({
        order_ids,
        status_is_print: true,
      })
      return null
    })
  }, [])

  return <MiniPrograme />
}

const MiniPrograme = () => {
  useEffect(() => {
    document.body.style.fontSize = '12px'
  }, [])

  return (
    <Flex
      column
      // justifyBetween
      justifyCenter
      alignCenter
      style={{
        borderTop: '1px solid #CCC',
        backgroundColor: 'white',
        width: '100vw',
        padding: '30px 0',
        position: 'fixed',
        bottom: '0',
        // right: '30px',
        // margin: '0 16px',
        zIndex: 9999,
      }}
    >
      {/* <Button
        disabled
        style={{
          background: '#4bb65d',
          color: '#FFF',
          height: '48px',
          borderRadius: '8px',
        }}
        onClick={() => {}}
        className='gm-margin-bottom-10'
      >
        {t('确认打印')}
      </Button> */}
      <Button
        style={{
          background: '#F5F5F5',
          color: '#4bb65d',
          border: 'none',
          fontWeight: 'bold',
          height: '48px',
          borderRadius: '8px',
          padding: '0 50px',
        }}
        onClick={() => {
          const iframeHtml = document.querySelector('iframe')?.contentDocument
          const iframeBody = iframeHtml?.querySelector('#appContainer')

          setTimeout(() => {
            html2canvas(iframeBody).then((canvas) => {
              const imgUrl = canvas.toDataURL('image/jpg')
              const image = document.createElement('img')
              image.src = imgUrl
              // 将生成的图片放到 类名为 content 的元素中
              document.querySelector('.content').appendChild(image)
              const a = document.createElement('a')
              a.href = imgUrl
              // a.download 后面的内容为自定义图片的名称
              a.download = '配送单.jpg'
              a.click()
              document.querySelector('.content').innerHTML = ''
              wx.miniProgram.navigateTo({
                url: `/pages/preview/picture/index?img=${imgUrl}`,
              })
            })
          }, 100)
        }}
      >
        分享图片
      </Button>
      <div className='content' />
    </Flex>
  )
}

export default Print
