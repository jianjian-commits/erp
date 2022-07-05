import { t } from 'gm-i18n'
import React, { useState, useEffect, useMemo, ReactNode, useRef } from 'react'
import _, { toFinite } from 'lodash'
import { Flex, Popover } from '@gm-pc/react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import {
  ListBestSaleSku,
  Sku_SkuType,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

import store, { initSsu } from '../../store'
import type { CellPropsWidthOriginal } from './types'
import type { TableSelectDataItem } from '@gm-pc/react'
import type { DetailListItem } from '@/pages/order/order_manage/components/interface'
import { Signal_1, Signal_2, Signal_3, Signal_4, Signal_5 } from '@/svg/index'
import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import searchSku, { SkuShape } from './search_merchandise'
import Selector, {
  SelectorData,
  SelectorValue,
  SelectorColumn,
} from './selector'
import { Tag } from 'antd'
import { isCombineSku } from '@/pages/order/util'

const WordBreak = styled.div`
  position: relative;
  word-break: break-all;
`

interface SkuSelectorProps extends CellPropsWidthOriginal {
  /**
   * 自定义空状态渲染
   */
  renderEmpty?(searchValue?: string): ReactNode
}

const renderID = (cellProps: {
  original: TableSelectDataItem<string>
  index: number
}) => {
  const sku = cellProps.original as SkuShape
  return <WordBreak>{sku.customize_code}</WordBreak>
}

const renderName = (cellProps) => {
  const original = cellProps.original
  const { sku_hot, name, sku_type } = original
  let signalSvgInfo: { svg: ReactNode; text: string } | undefined
  switch (+sku_hot) {
    case 1:
      signalSvgInfo = { svg: <Signal_1 />, text: t('此商户基本不下该商品') }
      break
    case 2:
      signalSvgInfo = { svg: <Signal_2 />, text: t('此商户很少下该商品') }
      break
    case 3:
      signalSvgInfo = {
        svg: <Signal_3 />,
        text: t('此商户下单该商品频次一般'),
      }
      break
    case 4:
      signalSvgInfo = {
        svg: <Signal_4 />,
        text: t('此商户下单该商品比较频繁'),
      }
      break
    case 5:
      signalSvgInfo = {
        svg: <Signal_5 />,
        text: t('此商户下单该商品特别频繁'),
      }
      break
    default:
      break
  }

  return (
    <Flex alignCenter>
      {signalSvgInfo && (
        <Popover type='hover' popup={signalSvgInfo.text}>
          <span>{signalSvgInfo.svg}</span>
        </Popover>
      )}
      <WordBreak className='gm-margin-left-5 gm-padding-right-4 tw-flex-grow'>
        {name}
      </WordBreak>
      {sku_type === Sku_SkuType.COMBINE && (
        <Tag className='tw-mr-0 tw-ml-1' color='processing'>
          组合
        </Tag>
      )}
    </Flex>
  )
}

const renderDesc = (cellProps: any) => {
  const sku = cellProps.original
  const { desc } = sku
  const result = desc || '-'
  return (
    <Popover showArrow type='hover' popup={result}>
      <div
        style={{
          textOverflow: 'ellipsis',
          maxWidth: 'inherit',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {result}
      </div>
    </Popover>
  )
}

const tableColumns: SelectorColumn<string>[] = [
  {
    Header: '商品名',
    accessor: 'original.name',
    width: 178,
    Cell: renderName,
  },
  {
    Header: '商品编码',
    accessor: 'original.customize_code',
    width: 170,
    Cell: renderID,
  },
  {
    Header: '描述',
    accessor: 'original.desc',
    width: 166,
    Cell: renderDesc,
  },
]

/**
 * 搜索报价单中的商品，且搜索商品库中的商品（只搜索普通商品，不处理组合商品）。
 * 点击商品库中的商品可以加入列表，提交订单前需要关联报价单。
 * 轻巧版暂无上述功能，仅搜索报价单中的商品
 */
const SkuSelector: React.VFC<SkuSelectorProps> = observer((props) => {
  const { sku, index, orderIndex, renderEmpty } = props
  const order = store.list[orderIndex].info

  const original = sku
  const [skuList, setSkuList] = useState<SelectorValue<string>[]>([])
  const isOften = useRef(false)

  const selectorData = useMemo<SelectorData<string>>(() => {
    if (_.isEmpty(skuList)) {
      return []
    }
    return [
      {
        label: null,
        children: skuList,
      },
    ]
  }, [skuList])

  // 默认获取10个常购商品
  // 复制订单后，要拉下商品数据
  useEffect(() => {
    handleSearch(original.customize_code || '')
  }, [])

  const handleSelect = (e: SelectorValue & DetailListItem) => {
    const selected = e

    if (!selected) {
      store.updateSsuRow(orderIndex, index, {
        ...initSsu,
        isNewItem: true,
        quotationName: order.customer?.quotation?.outer_name || '-',
        tax: '0',
        detail_random_id: undefined,
      })
      return
    }

    // 处理税率，需要根据客户的开票情况处理税率默认值
    // 因为发票信息是挂在 level 为1 的customer 上，因此如果当前选择 customer level 为2，需要通过parent_id 查找
    // 直接在前面选择商户的时候处理
    const isOpenInvoice =
      +(order.customer?.settlement?.china_vat_invoice?.invoice_type || 0) &
      ChinaVatInvoice_InvoiceType.VAT_SPECIAL
    const detail_random_id = isCombineSku(selected)
      ? _.uniqueId(`${Date.now()}`)
      : _.uniqueId(`10${Date.now()}`)

    store.deleteSsuRow(orderIndex, index)

    store.addSsuRow(
      orderIndex,
      {
        ...(selected || initSsu),
        isNewItem: true,
        quotationName: order.customer?.quotation?.outer_name || '-',
        tax: isOpenInvoice ? selected?.tax : '0',
        detail_random_id,
      },
      index - 1,
    )

    // 用这个唯一ID构建这个订单下组合商品和子商品的映射关系
    // 组合商品，把原料添加进列表
    if (isCombineSku(selected)) {
      _.forEach(selected.ingredientsInfo, (item, i) => {
        store.addSsuRow(
          orderIndex,
          {
            ...(item || initSsu),
            isNewItem: true,
            quotationName: order.customer?.quotation?.outer_name || '-',
            tax: isOpenInvoice ? item.tax : '0',
            order_detail_id: '',
            sort_num: '',
            detail_random_id,
          },
          index + i,
        )
      })
    }
  }

  const handleSearch = async (value: string) => {
    const { customer } = order
    const customerId = customer?.customer_id!
    const quotationId = customer?.quotation?.quotation_id!
    const quotationType = customer?.quotation.type

    const isPeriodic = quotationType === Quotation_Type.PERIODIC

    if (value === '' && _.isEmpty(skuList)) {
      isOften.current = true
      // 常购商品
      return ListBestSaleSku({
        customer_id: customer?.customer_id!,
        // quotation_id: customer?.quotation?.quotation_id!,
        limit: '10',
      }).then((json) => {
        let id = quotationId
        // 周期报价单需要查询子报价单 id 再使用
        if (isPeriodic) {
          id = _.find(json.response.quotation_map, {
            parent_id: quotationId,
          })?.quotation_id!
        }
        handleFetchSkuResponse(setSkuList, id, json)
      })
    } else {
      isOften.current = false
      const skuList = await searchSku({
        keyword: value,
        quotation_id: quotationId,
        customer_id: customerId,
      })
      setSkuList(
        skuList.sort(
          (a, b) => toFinite(b.sku_hot || '') - toFinite(a.sku_hot || ''),
        ),
      )
      const { units, prices } =
        _.find(
          skuList,
          (item) => item.customize_code === original.customize_code,
        ) || {}
      store.updateSsuRowItem(orderIndex, index, 'units', units)
      store.updateSsuRowItem(orderIndex, index, 'prices', prices)
    }
  }

  const selected: TableSelectDataItem<string> | undefined = useMemo(
    () =>
      original.sku_id && original.name
        ? {
            value: original.sku_id,
            text: original.name!,
          }
        : undefined,
    [original.sku_id, original.name],
  )

  const renderCustomizedBottom = (
    popoverRef: React.RefObject<Popover>,
  ): ReactNode => {
    return !selected ? (
      <Flex
        justifyCenter
        alignCenter
        style={{ minHeight: '30px', color: '#56a3f2', fontWeight: 'bolder' }}
      >
        <div
          className='hover:tw-underline tw-cursor-pointer'
          onClick={() => {
            popoverRef.current && popoverRef.current.apiDoSetActive(false)
          }}
        >
          {t('更多常购商品')}
        </div>
      </Flex>
    ) : null
  }

  return (
    <Selector
      data={selectorData}
      columns={tableColumns}
      selected={selected!}
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder={t('输入商品编码或商品名')}
      disabled={!!(+sku.detail_status! & (1 << 12) || sku.parentId)}
      renderEmpty={renderEmpty}
      renderCustomizedBottom={renderCustomizedBottom}
    />
  )
})

SkuSelector.displayName = 'SkuSelector'

export default SkuSelector
