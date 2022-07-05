import React, { FC } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import TipBox from './tip_box'
import classNames from 'classnames'
import batchStore, { BatchOrder, initSsu } from '../store'
import { observer } from 'mobx-react'
import { Flex, Button } from '@gm-pc/react'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { isCombineSku } from '@/pages/order/util'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'

interface RecommendRowProps {
  orderIndex: number
  order: BatchOrder
  row: any
}

const RecommendRow: FC<RecommendRowProps> = ({ row, order, orderIndex }) => {
  const orderInfo = batchStore.list[orderIndex].info
  const data = row.original

  let recommendList: DetailListItem[] = data?.recommendSsus
  const index = row.index
  let parent: DetailListItem | undefined
  const isCombineSkuLast = !!data.parentId

  // 组合商品本身不显示“更多推荐”，而在最后一个子商品处显示
  if (
    isCombineSku(data) ||
    (!data?.parentId && (!data?.recommendSsus || !_.size(recommendList)))
  ) {
    return null
  }

  // 遇到组合商品，在最后一个子商品处显示“更多推荐”
  if (data.parentId) {
    parent = _.find(order.list, (item) => item.sku_id === data.parentId)
    // 正在渲染的是否为组合商品中最后一个
    if (parent && data.sku_id === _.last(parent?.ingredientsInfo)?.sku_id) {
      // 使用组合商品的推荐数据
      recommendList = parent?.recommendSsus || []
    } else {
      return null
    }
  }

  if (_.isEmpty(recommendList)) {
    return null
  }

  return (
    <TipBox
      tip={t('更多推荐：')}
      others={
        <Flex>
          {_.map(recommendList, (selected) => {
            if (!selected?.sku_id) return t('数据异常')
            return (
              <Button
                className='gm-margin-right-5'
                key={selected.sku_id}
                onClick={() => {
                  // 处理税率，需要根据客户的开票情况处理税率默认值
                  // 因为发票信息是挂在 level 为1 的customer 上，因此如果当前选择 customer level 为2，需要通过parent_id 查找
                  // 直接在前面选择商户的时候处理
                  const isOpenInvoice =
                    +(
                      orderInfo.customer?.settlement?.china_vat_invoice
                        ?.invoice_type || 0
                    ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL
                  const detail_random_id = isCombineSku(selected)
                    ? _.uniqueId(`${Date.now()}`)
                    : _.uniqueId(`10${Date.now()}`)

                  // 处理原料
                  if (isCombineSkuLast) {
                    const startIndex = index - _.size(parent?.ingredientsInfo)
                    batchStore.deleteSsuRow(orderIndex, startIndex)
                    batchStore.addSsuRow(
                      orderIndex,
                      {
                        ...(selected || initSsu),
                        isNewItem: true,
                        quotationName:
                          orderInfo.customer?.quotation?.outer_name || '-',
                        tax: isOpenInvoice ? selected?.tax : '0',
                        detail_random_id,
                      },
                      startIndex - 1,
                    )
                    if (isCombineSku(selected)) {
                      _.forEach(selected?.ingredientsInfo, (item, i) => {
                        batchStore.addSsuRow(
                          orderIndex,
                          {
                            ...(item || initSsu),
                            isNewItem: true,
                            quotationName:
                              orderInfo.customer?.quotation?.outer_name || '-',
                            tax: isOpenInvoice ? item.tax : '0',
                            order_detail_id: '',
                            sort_num: '',
                            detail_random_id,
                          },
                          startIndex + i,
                        )
                      })
                    }
                  } else {
                    // 替换当前索引数据
                    batchStore.updateSsuRow(orderIndex, index, {
                      ...(selected || initSsu),
                      isNewItem: true,
                      quotationName:
                        orderInfo.customer?.quotation?.outer_name || '-',
                      tax: isOpenInvoice ? selected?.tax : '0',
                      detail_random_id,
                    })
                  }
                }}
              >
                {selected?.name}
              </Button>
            )
          })}
        </Flex>
      }
      className={classNames({
        'gm-back-bg': row.index % 2,
        'gm-border-bottom': row.index !== order.list.length - 1,
      })}
    />
  )
}

export default observer(RecommendRow)
