import { t } from 'gm-i18n'
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import _, { toFinite } from 'lodash'
import { Flex, Popover, Price, RightSideModal } from '@gm-pc/react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import {
  Unit,
  ListBestSaleSku,
  Sku_SkuType,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'

import store, { initSsu } from '../../../store'
import globalStore from '@/stores/global'
import type { CellPropsWidthOriginal } from '../../interface'
import type { TableSelectDataItem } from '@gm-pc/react'
import type { Ssu, Sku, DetailListItem } from '../../../../interface'
import { parseSsu, getBaseRateFromBaseUnit, toFixedOrder } from '@/common/util'
import { Signal_1, Signal_2, Signal_3, Signal_4, Signal_5 } from '@/svg/index'
import FrequentSsu from '../cell_frequent_ssu'
import {
  getFeePriceByUnit,
  handleFetchSkuResponse,
  handleUnitName,
} from '@/pages/order/order_manage/components/detail/util'
import searchMerchandise, { SkuShape } from './search_merchandise'
import Selector, {
  SelectorData,
  SelectorValue,
  SelectorColumn,
} from './selector'
import { Tag } from 'antd'
import { App_Type } from 'gm_api/src/common'
import {
  getSkuDefaultUnitId,
  isCombineSku,
  transformOutStock,
} from '@/pages/order/util'
import { Order_Status } from 'gm_api/src/order'

const WordBreak = styled.div`
  position: relative;
  word-break: break-all;
`
const Title = styled.h3`
  margin: 0;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 400;
  color: #6d7278;
`

export type SkuSelectorRef = {
  /**
   * 搜索
   */
  search: (
    value: string,
    skipQueryMerchandiseLibrary?: boolean,
  ) => Promise<unknown>
}
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
// const renderSpec = (cellProps) => {
//   const ssu = cellProps.original
//   const { unit } = ssu
//   const text = `${unit?.rate}${globalStore.getUnitName(unit?.parent_id!)}/${
//     unit?.name
//   }`
//   return <span>{text}</span>
// }

// const renderSalePrice = (cellProps) => {
//   const ssu: Ssu = cellProps.original
//   const { price } = ssu
//   if (ssu.basic_price?.current_price) return t('时价')
//   const parse = parseSsu(ssu)

//   return price + Price.getUnit() + '/' + parse.ssu_unit_name
// }

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

const renderUnit = (cellProps: any) => {
  const sku = cellProps.original
  return (
    <div
      style={{
        textOverflow: 'ellipsis',
        maxWidth: 'inherit',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {handleUnitName(sku) || '-'}
    </div>
  )
}

const renderFrequentSsu = () => {
  RightSideModal.render({
    children: <FrequentSsu />,
    onHide: RightSideModal.hide,
    opacityMask: false,
    style: {
      width: '630px',
    },
  })
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
    Header: globalStore.isLite ? '单位' : '描述',
    accessor: 'original.desc',
    width: 166,
    Cell: globalStore.isLite ? renderUnit : renderDesc,
  },
  // {
  //   Header: '规格',
  //   accessor: 'original.spec',
  //   width: 70,
  //   Cell: renderSpec,
  // },
  // {
  //   Header: '分类',
  //   accessor: 'original.category_name',
  //   width: 60,
  //   Cell: (cellProps) => {
  //     const sku = cellProps.original
  //     return sku.category_name
  //   },
  // },
  // {
  //   Header: '单价（包装单位）',
  //   accessor: 'original.price',
  //   width: 100,
  //   Cell: renderSalePrice,
  // },
  // {
  //   Header: '单价（计量单位）',
  //   accessor: 'original.price',
  //   width: 90,
  //   Cell: renderStdPrice,
  // },
  // {
  //   Header: '销售库存',
  //   accessor: 'original.sale_stocks',
  //   width: 80,
  //   Cell: renderNowStock,
  // },
  // {
  //   Header: '报价单简称（对外）',
  //   accessor: 'original.supplier_name',
  //   width: 120,
  //   Cell: () => store.order.customer?.quotation?.outer_name || '-',
  // },
]

/**
 * 搜索报价单中的商品，且搜索商品库中的商品（只搜索普通商品，不处理组合商品）。
 * 点击商品库中的商品可以加入列表，提交订单前需要关联报价单。
 * 轻巧版暂无上述功能，仅搜索报价单中的商品
 */
const SkuSelector = observer(
  forwardRef<SkuSelectorRef, SkuSelectorProps>((props, ref) => {
    const { sku, index, renderEmpty } = props
    const original = sku
    const [skuList, setSkuList] = useState<SelectorValue<string>[]>([])
    const [merchandiseSkus, setMerchandiseSkus] = useState<
      SelectorValue<string>[]
    >([])

    const isMenuOrder = store.order.quotation_type === Quotation_Type.WITH_TIME

    const isOften = useRef(false)
    const selectorData = useMemo<SelectorData<string>>(() => {
      const skuEmpty = _.isEmpty(skuList)
      const merchandiseEmpty = _.isEmpty(merchandiseSkus)
      if (skuEmpty && merchandiseEmpty) {
        return []
      }

      if (globalStore.isLite || isMenuOrder) {
        return [
          {
            label: null,
            children: skuList,
          },
        ]
      }

      if (isOften.current) {
        return [
          {
            label: (
              <Title>
                {t('常购商品')}
                {skuEmpty && t('：无')}
              </Title>
            ),
            children: skuList,
          },
        ]
      }

      return [
        {
          label: (
            <Title>
              {t('报价单商品')}
              {skuEmpty && t('：无')}
            </Title>
          ),
          children: skuList,
        },
        {
          label: (
            <Title>
              {t('商品库商品')}
              {merchandiseEmpty && t('：无')}
            </Title>
          ),
          children: merchandiseSkus,
        },
      ]
    }, [merchandiseSkus, skuList, isMenuOrder])

    // 默认获取10个常购商品
    // 复制订单后，要拉下商品数据
    useEffect(() => {
      // debugger

      handleSearch(original.customize_code || '', true)
    }, [store.order.customer])

    const getIngredientsQuantity = (
      ratio: string,
      use_unit_id: string,
      unit: Unit,
      parentQuantity: number,
    ): number => {
      const rate = getBaseRateFromBaseUnit(use_unit_id, unit.parent_id)
      // return +toFixedOrder(
      //   Big(ratio).times(parentQuantity).times(rate).div(unit.rate),
      // )
      // 因为配比是四位小数，这里暂时不舍入
      return +Big(ratio).times(parentQuantity).times(rate).div(unit.rate)
    }

    const updateSkuData = (
      selected: SelectorValue & DetailListItem,
      unit_id: string,
    ) => {
      const {
        second_base_unit_id,
        prices,
        isUsingSecondUnitOutStock,
        base_unit_id,
        withoutInQuotations,
        units,
      } = selected
      let updates = {}

      const unit = units?.find(
        (unitItem) =>
          unitItem.unit_id === unit_id || unitItem.value === unit_id,
      )

      const sameGroupWithSecondUnit = globalStore.isSameUnitGroup(
        unit_id,
        second_base_unit_id!,
      )

      // 最小下单数
      const minimum_order_number = prices?.find(
        (item) => item.order_unit_id === unit_id,
      )?.minimum_order_number

      // 初始化出库单位
      if (isUsingSecondUnitOutStock) {
        // 若选中的下单单位和辅助单位是同系单位
        if (sameGroupWithSecondUnit) {
          updates = {
            std_unit_id: base_unit_id,
            std_unit_id_second: unit_id,
            std_quantity: minimum_order_number
              ? toFixedOrder(
                  transformOutStock(
                    +minimum_order_number,
                    unit_id,
                    selected,
                    'FROM_SECONDUNIT',
                  ),
                )
              : '',
            std_quantity_second: minimum_order_number,
          }
        } else {
          updates = {
            std_unit_id: unit_id,
            std_unit_id_second: second_base_unit_id,
            std_quantity: minimum_order_number || '',
            std_quantity_second: minimum_order_number
              ? toFixedOrder(
                  transformOutStock(
                    +minimum_order_number,
                    unit_id,
                    selected,
                    'TO_SECONDUNIT',
                  ),
                )
              : '',
          }
        }
      } else {
        updates = {
          std_unit_id: unit_id,
          std_quantity: minimum_order_number || '',
        }
      }
      if (!withoutInQuotations) {
        const { price, fee_unit_id } = getFeePriceByUnit(
          unit_id,
          prices!,
          units!,
        )
        Object.assign(updates, {
          unit_id: unit_id,
          // 用来展示下单单位名称
          unit,
          minimum_order_number,
          price,
          fee_unit_id,
          quantity: minimum_order_number,
        })
      } else {
        // 不在报价单里，但是在商品库里的sku
        Object.assign(updates, {
          unit_id: unit_id,
          // 用来展示下单单位名称
          unit,
          minimum_order_number: '',
          price: '',
          fee_unit_id: unit_id,
          quantity: '',
        })
      }
      return updates
    }

    const handleSelect = useCallback(
      (e: SelectorValue & DetailListItem) => {
        const selected = e
        // 处理税率，需要根据客户的开票情况处理税率默认值
        // 因为发票信息是挂在 level 为1 的customer 上，因此如果当前选择 customer level 为2，需要通过parent_id 查找
        // 直接在前面选择商户的时候处理
        const isOpenInvoice =
          +(
            store.order.customer?.settlement?.china_vat_invoice?.invoice_type ||
            0
          ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL
        const detail_random_id = isCombineSku(e || {})
          ? _.uniqueId(`${Date.now()}`)
          : _.uniqueId(`10${Date.now()}`)

        if (selected?.sku_type === Sku_SkuType.NOT_PACKAGE) {
          // 获取商品默认下单单位：基本单位 》辅助单位 》第一个下单单位
          const { base_unit_id, second_base_unit_id, units } = selected
          const unit_id = getSkuDefaultUnitId(
            base_unit_id,
            second_base_unit_id,
            units,
          )
          const skuData = updateSkuData(selected || initSsu, unit_id)
          store.updateRow(index, {
            ...(selected || initSsu),
            ...skuData,
            isNewItem: true,
            quotationName: store.order.customer?.quotation?.outer_name || '-',
            tax: isOpenInvoice ? selected?.tax : '0',
            detail_random_id,
          })
        } else {
          store.updateRow(index, {
            ...(selected || initSsu),
            isNewItem: true,
            // quantity: +(selected?.minimum_order_number || 0) || null,
            // quantity: null,
            quotationName: store.order.customer?.quotation?.outer_name || '-',
            tax: isOpenInvoice ? selected?.tax : '0',
            detail_random_id,
          })
        }

        // 用这个唯一ID构建这个订单下组合商品和子商品的映射关系
        // 组合商品，把原料添加进列表
        if (selected?.sku_type === Sku_SkuType.COMBINE) {
          // const { ingredients } = selected.ingredients as Ingredients
          _.forEach(selected.ingredientsInfo, (item, count) => {
            // 下单数要根据配比计算,
            // const ratioInfo = ssu_ratios?.find(
            //   (item2) => item2.ssu_id === item.ssu_id,
            // )
            // 获取原料的数量,包装单位，舍入两位

            // TODO 取整逻辑有调整,先pass
            // const quantity = getQuantity(
            //   getIngredientsQuantity(Î
            //     ratioInfo?.ratio!,
            //     ratioInfo?.use_unit_id!,
            //     item.unit,
            //     +selected?.minimum_order_number!,
            //   ),
            //   globalStore.orderSetting,
            //   item.unit,
            //   item.unit_type,
            //   false,
            // )
            // ratio配比，order_unit_id下单单位
            // const { price, quantity, unit_id, fee_unit_id, sku_id } = item
            // const skuInfo = selected.ingredientsInfo?.find(
            //   (item) => item.sku_id === sku_id,
            // )
            store.addRow(+index + +count, {
              ...(item || initSsu),
              isNewItem: true,
              quotationName: store.order.customer?.quotation?.outer_name || '-',
              tax: isOpenInvoice ? item.tax : '0',
              order_detail_id: '',
              sort_num: '',
              detail_random_id,
            })
          })
        }
      },
      [index],
    )

    const handleSearch = useCallback(
      async (value: string, skipQueryMerchandiseLibrary = false) => {
        const { service_period_id, customer, quotation_type, status } =
          store.order
        const isMenuOrder = quotation_type === Quotation_Type.WITH_TIME
        if (
          value === '' &&
          skuList.length === 0 &&
          merchandiseSkus.length === 0 &&
          !isMenuOrder
        ) {
          const quotationId = customer?.quotation?.quotation_id!
          const isPeriodic =
            customer?.quotation.type === Quotation_Type.PERIODIC
          isOften.current = true
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
          const { skuWithoutQuotationsList, skuWithQuotationsList } =
            await searchMerchandise(
              value,
              globalStore.isLite || isMenuOrder || skipQueryMerchandiseLibrary,
            )
          setSkuList(
            skuWithQuotationsList.sort(
              (a, b) => toFinite(b.sku_hot || '') - toFinite(a.sku_hot || ''),
            ),
          )
          setMerchandiseSkus(skuWithoutQuotationsList)
          if (store.order.view_type !== 'view') {
            const { units, prices } =
              _.find(
                skuWithQuotationsList,
                (item) => item.customize_code === original.customize_code,
              ) || {}
            const minimum_order_number =
              _.find(
                prices,
                (p) => p.order_unit_id === store.list[index]?.unit_id,
              )?.minimum_order_number || ''
            store.updateRowItem(index, 'units', units)
            store.updateRowItem(index, 'prices', prices)
            store.updateRowItem(
              index,
              'minimum_order_number',
              minimum_order_number,
            )
          }
        }
      },
      [original.customize_code, skuList.length, merchandiseSkus.length],
    )

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
              renderFrequentSsu()
            }}
          >
            {t('更多常购商品')}
          </div>
        </Flex>
      ) : null
    }

    useImperativeHandle(
      ref,
      () => ({
        search: handleSearch,
      }),
      [handleSearch],
    )

    return (
      <Selector
        data={selectorData}
        columns={tableColumns}
        selected={selected!}
        // 注意：onSearch 有两个回调参数，会覆盖 handleSearch 第二个参数的默认值
        // 但是 handleSearch 内部接收时处理了这种情况
        onSearch={handleSearch}
        onSelect={handleSelect}
        placeholder={t('请输入商品名称/别名/编码')}
        // style={{ width: globalStore.isLite ? '280px' : '168px' }}
        disabled={
          !!(
            +sku.detail_status! & (1 << 12) ||
            sku.parentId ||
            store.type === App_Type.TYPE_ESHOP
          )
        }
        renderEmpty={renderEmpty}
        renderCustomizedBottom={
          isMenuOrder ? undefined : renderCustomizedBottom
        }
      />
    )
  }),
)

SkuSelector.displayName = 'SkuSelector'

export default SkuSelector
