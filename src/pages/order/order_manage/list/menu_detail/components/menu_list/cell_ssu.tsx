import { t } from 'gm-i18n'
import React, {
  useState,
  useRef,
  FC,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
} from 'react'
import { KCTableSelect } from '@gm-pc/keyboard'
import _ from 'lodash'
import { Flex, Popover, Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import {
  Quotation_Type,
  Sku_SkuType,
  Quotation_Status,
  ListBasicPriceByCustomerID,
} from 'gm_api/src/merchandise'
import { ChinaVatInvoice_InvoiceType } from 'gm_api/src/enterprise'
import { pinYinFilter } from '@gm-common/tool'
import moment from 'moment'

import store, { SkuMap } from '../../store'
import globalStore from '@/stores/global'
import type { CellPropsWidthOriginal } from '../../../../components/detail/list/interface'
import type { TableSelectDataItem } from '@gm-pc/react'
import type { Sku } from '../../../../components/interface'
import { parseSsu, toFixedOrder } from '@/common/util'
import { ListSkuStock, SkuUnitStock_Config } from 'gm_api/src/inventory'
import { initSsu } from '../../../../components/init'
import { toJS } from 'mobx'
import SelectedBox from './select_box'
import { Signal_1, Signal_2, Signal_3, Signal_4, Signal_5 } from '@/svg/index'
import classNames from 'classnames'
import { handleFetchSkuResponse } from '@/pages/order/order_manage/components/detail/util'
import { isCombineSku } from '@/pages/order/util'

const CellSkuSelector: FC<CellPropsWidthOriginal> = observer(
  ({ sku, index, status }) => {
    const original = sku
    // 搜索的时候会直接带上组合商品及其原料信息
    const [skuList, setSkuList] = useState<TableSelectDataItem<string>[]>([])
    const [skuMap, setSkuMap] = useState<SkuMap>({})

    const productNameRef = useRef<string>()

    useEffect(() => {
      handleSearch(productNameRef.current)
    }, [store.order.view_type])

    const renderID = useCallback((cellProps) => {
      const sku = cellProps.original
      return (
        <SelectedBox
          className={classNames({ 'b-combine-goods-label': isCombineSku(sku) })}
          selected={sku.selected}
        >
          {sku.customize_code}
        </SelectedBox>
      )
    }, [])

    const renderNowStock = useCallback((cellProps) => {
      const sku = cellProps.original
      const { _skuStock } = sku
      const unitStock = _skuStock?.unit_stocks || {}
      const stock = unitStock[sku?.unit_id] || {}
      if (stock.config === SkuUnitStock_Config.SALE_STOCK_NO_CONFIG) {
        return (
          <SelectedBox selected={sku.selected}>{t('不限制库存')}</SelectedBox>
        )
      }

      if (stock.config === SkuUnitStock_Config.SALE_STOCK_AVAILABLE_STOCK) {
        const quantity = +_skuStock?.available_stock?.base_unit
          ?.quantity as number
        return (
          <SelectedBox selected={sku.selected}>
            {toFixedOrder(quantity || 0) +
              globalStore.unitMap[sku?.base_unit_id]?.text}
          </SelectedBox>
        )
      }

      if (stock.config === SkuUnitStock_Config.SALE_STOCK_VIRTUAL_STOCK) {
        return (
          <SelectedBox selected={sku.selected}>
            {toFixedOrder(+stock?.virtual_stock?.base_unit?.quantity || 0) +
              globalStore.unitMap[sku?.base_unit_id]?.text}
          </SelectedBox>
        )
      }

      return '-'
    }, [])

    const renderDesc = useCallback((cellProps) => {
      const sku = cellProps.original
      const { description } = sku
      const result = description || '-'
      return <SelectedBox selected={sku.selected}>{result}</SelectedBox>
    }, [])

    const renderSpec = useCallback((cellProps) => {
      const sku = cellProps.original
      const { unit } = sku
      const text = `${unit?.rate}${globalStore.getUnitName(unit?.parent_id)}/${
        unit?.name
      }`
      return <SelectedBox selected={sku.selected}>{text}</SelectedBox>
    }, [])

    const renderSalePrice = useCallback((cellProps) => {
      const sku: Sku = cellProps.original
      const { price } = sku
      if (sku.basic_price?.current_price) return t('时价')
      const parse = parseSsu(sku)

      return (
        <SelectedBox selected={sku.selected}>
          {price + Price.getUnit() + '/' + parse.ssu_unit_name}
        </SelectedBox>
      )
    }, [])

    const renderStdPrice = useCallback((cellProps) => {
      const sku: Sku = cellProps.original
      if (sku.basic_price?.current_price) return t('时价')
      const { stdPrice } = sku

      const parse = parseSsu(sku)

      return (
        <SelectedBox selected={sku.selected}>
          {stdPrice + Price.getUnit() + '/' + parse.ssu_unit_parent_name}
        </SelectedBox>
      )
    }, [])

    const renderName = useCallback((cellProps) => {
      const original = cellProps.original
      const { sku_hot } = original
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
        <Flex>
          <SelectedBox
            selected={original.selected}
            className='gm-margin-right-5'
          >
            <span className='gm-margin-right-5'>{original.name}</span>
            {signalSvgInfo && (
              <Popover type='hover' popup={signalSvgInfo.text}>
                <span>{signalSvgInfo.svg}</span>
              </Popover>
            )}
          </SelectedBox>
        </Flex>
      )
    }, [])

    const tableColumns = useMemo(
      () => [
        {
          Header: '商品编码',
          accessor: 'original.customize_code',
          width: 80,
          Cell: renderID,
        },
        {
          Header: '商品名',
          accessor: 'original.name',
          width: 130,
          Cell: renderName,
        },
        // {
        //   Header: '规格',
        //   accessor: 'original.spec',
        //   width: 70,
        //   Cell: renderSpec,
        // },
        {
          Header: '分类',
          accessor: 'original.category_name',
          width: 60,
          Cell: (cellProps) => {
            const sku = cellProps.original
            return (
              <SelectedBox selected={sku.selected}>
                {isCombineSku(sku) ? '-' : sku.category_name}
              </SelectedBox>
            )
          },
        },
        // {
        //   Header: '单价（包装单位）',
        //   accessor: 'original.price',
        //   width: 90,
        //   Cell: renderSalePrice,
        // },
        // {
        //   Header: '单价（计量单位）',
        //   accessor: 'original.price',
        //   width: 90,
        //   Cell: renderStdPrice,
        // },
        // !TODO
        // {
        //   Header: '销售库存',
        //   accessor: 'original.sale_stocks',
        //   width: 80,
        //   Cell: renderNowStock,
        // },
        {
          Header: '商品描述',
          accessor: 'original.desc',
          width: 80,
          Cell: renderDesc,
        },
        {
          Header: '报价单简称（对外）',
          accessor: 'original.supplier_name',
          width: 120,
          Cell: (cellProps) => (
            <SelectedBox selected={cellProps.original.selected}>
              {store.order.customer?.quotation?.outer_name || '-'}
            </SelectedBox>
          ),
        },
      ],
      [],
    )

    const handleSelect = useCallback(
      (selected: Sku & TableSelectDataItem<string>) => {
        if (!selected) {
          store.updateMenuListRow(index, {
            ...initSsu,
            isNewItem: true,
            quantity: null,
            quotationName: store.order.customer?.quotation?.outer_name || '-',
          })
          store.updateMergeSku(
            toJS(store.menuList.filter((v) => v.sku_id && v.unit_id)),
            store.skuMap,
            undefined,
            store.list,
            globalStore.orderSetting,
          )
          return
        }

        // 限制相同商品不能再次添加
        const hasSsu = _.find(
          store.menuList,
          (m) => m.sku_id === selected.sku_id && m.unit_id === selected.unit_id,
        )

        if (hasSsu) {
          return
        }

        const isOpenInvoice =
          +(
            store.order.customer?.settlement?.china_vat_invoice?.invoice_type ||
            0
          ) & ChinaVatInvoice_InvoiceType.VAT_SPECIAL

        store.updateMenuListRow(index, {
          ...selected,
          isNewItem: true,
          quantity: +(selected?.minimum_order_number || 1) || null,
          quotationName: store.order.customer?.quotation?.outer_name || '-',
          tax: isOpenInvoice ? selected.tax : '0',
          // 用于展示修改配比的table
          feIngredients: selected.ingredients,
          order_detail_id: '0', // 替换商品相当于新增
        })

        // 如果新增的为组合商品，那么组合商品的原料的信息没有在skuMap中，另外处理
        if (selected && selected.sku_type === Sku_SkuType.COMBINE) {
          const temp = store.skuMap
          console.log(temp)

          // 因为商品明细都是根据menuList汇总的，这里将组合商品原料信息放进skuMap中,来保证每次汇总都能获取sku信息
          // _.each(selected.single_ssu_infos || [], (s) => {
          //   const ssu_infos = store.skuMap[s?.ssu?.sku_id]?.ssu_map || {}

          //   if (!store.skuMap[s?.ssu?.sku_id]) {
          //     store.updateSkuMap(s?.ssu?.sku_id, {
          //       category_infos: s.category_infos,
          //       ssu_map: { ...ssu_infos, [s?.ssu?.unit_id]: s },
          //     })
          //   } else {
          //     if (!ssu_infos[s?.ssu?.unit_id]) {
          // 不存在该ssu，增加ssu信息
          //       store.updateSkuMap(s?.ssu?.sku_id, {
          //         ...store.skuMap[s?.ssu?.sku_id],
          //         ssu_map: { ...ssu_infos, [s?.ssu?.unit_id]: s },
          //       })
          //     }
          //   }
          // })
          _.each(selected.ingredientsInfo, (i) => {
            const sku = _.find(skuMap, (sku) => sku.sku_id === i.sku_id)
            if (!store.skuMap[`${i.sku_id}_${i.revision}`]) {
              store.updateSkuMap(`${i.sku_id}_${i.revision}`, sku!)
            }
          })
        }

        // 删除的话，不需要管skuMap
        // 在没有通过分拣或订单修改出库数的时候，修改下单数自动同步出库数；修改了出库数后，再修改下单数，不会自动同步“出库数”
        store.updateMergeSku(
          toJS(store.menuList.filter((v) => v.sku_id && v.unit_id)),
          store.skuMap,
          undefined,
          store.list,
          globalStore.orderSetting,
        )
      },
      [index, skuMap],
    )

    const handleSearch = useCallback((value: string) => {
      productNameRef.current = value
      const {
        quotation_id,
        menu_period_group_id,
        receive_time,
        quotation_type,
        service_period_id,
        customer,
      } = store.order
      const receive_cur_time = moment(new Date(+receive_time!)).startOf('day')
      // 区分普通下单和菜谱下单
      // ListSsuByCustomerOrQuotation({
      //   ...(quotation_type === Quotation_Type.WITH_TIME
      //     ? {
      //         q: value,
      //         quotation_id,
      //         menu_period_group_id,
      //         begin_menu_time: `${+receive_cur_time.toDate()}`, // 传订单的收货时间
      //         end_menu_time: `${+receive_cur_time.add(1, 'd').toDate()}`, // 暂时定 当前时间加1天
      //         paging: { limit: 999 },
      //       }
      //     : {
      //         q: value,
      //         service_period_id: service_period_id,
      //         customer_id: customer?.customer_id,
      //         quotation_id: quotation_id,
      //         on_sale: Filters_Bool.TRUE,
      //         paging: { limit: 999 },
      //       }),
      // })
      ListBasicPriceByCustomerID({
        ...(quotation_type === Quotation_Type.WITH_TIME ||
        quotation_type === Quotation_Type.PERIODIC
          ? // ! todo 菜谱
            {
              // q: value,
              // quotation_id,
              // menu_period_group_id,
              // begin_menu_time: `${+receive_cur_time.toDate()}`, // 传订单的收货时间
              // end_menu_time: `${+receive_cur_time.add(1, 'd').toDate()}`, // 暂时定 当前时间加1天
              paging: { limit: 999 },
              filter_params: {
                q: value,
                on_sale: 1,
                on_shelf: 1,
              },
            }
          : {
              filter_params: {
                q: value,
                on_sale: 1,
                on_shelf: 1,
                ...(globalStore.isLite
                  ? { sku_type: Sku_SkuType.NOT_PACKAGE }
                  : {
                      quotation_status: Quotation_Status.STATUS_VALID,
                      quotation_id: customer?.quotation?.quotation_id,
                    }),
                customer_id: customer?.customer_id!,
              },
              paging: { limit: 999 },
            }),
      })
        .then((json) => {
          const { ingredient_basic_price, sku_map } = json.response
          store.updateIngredientBasicPrice(ingredient_basic_price)
          setSkuMap(sku_map!)
          return json
        })
        .then((json) => {
          const isPeriodic =
            customer?.quotation?.type === Quotation_Type.PERIODIC
          let quotationId = customer?.quotation?.quotation_id!
          if (isPeriodic) {
            quotationId = _.find(json.response.quotation_map, {
              parent_id: quotationId,
            })?.quotation_id!
          }
          return handleFetchSkuResponse(setSkuList, quotationId, json)
        })
        .then((res) => {
          if (store.order.view_type !== 'view') {
            const { units, prices } =
              res.find(
                (item) => item.customize_code === original.customize_code,
              ) || {}
            store.updateMenuListRow(index, {
              ...store.menuList[index],
              units,
              prices,
            })
          }
        })
      // .then(async (json) => {
      // #region PRE
      // 返回结果中 ssu_infos为组合商品及单品信息，single_ssu_infos为组合商品原料信息，需要一起处理
      // const list = json.response.ssu_infos || []
      // const single_list = json.response.single_ssu_infos || []

      // const res = await ListSkuStock({
      //   paging: { limit: 999 },
      //   unit_stock_map: true,
      //   sku_ids: list.map((v) => v.ssu?.sku_id!),
      // })

      // const ssus = _.uniqBy(
      //   list,
      //   (ssu) => `${ssu.ssu?.sku_id}_${ssu.ssu?.unit_id}`,
      // )
      // getSsuFromSearch中会同步已下单商品价格到搜索的商品列表中
      // 因为选择后商品列表会被清空，所以只能把组合商品的原料信息放在商品里面
      // const skuStockMap = list2Map(res.response.sku_stocks, 'sku_id')
      // setSkuList(
      //   _.uniqBy(
      //     ssus.map((v) => {
      // 若是组合商品，带上原料信息
      //       let single_ssu_infos: SsuTotalInfo[] = []
      //       if (v.ssu?.type === Ssu_Type.TYPE_COMBINE) {
      //         single_ssu_infos = _.filter(
      //           single_list,
      //           (s) =>
      //             _.findIndex(
      //               v.ssu?.ingredients?.ssu_ratios || [],
      //               (r) =>
      //                 r.sku_id === s?.ssu?.sku_id &&
      //                 r.unit_id === s?.ssu?.unit_id,
      //             ) !== -1,
      //         )
      //       }
      //       const selected = _.find(
      //         store.menuList,
      //         (m) =>
      //           m.sku_id === v.ssu?.sku_id && m.unit_id === v.ssu?.unit_id,
      //       )
      //       return {
      //         ...getSsuFromSearch(
      //           { ...v, single_ssu_infos },
      //           store.menuList,
      //           store.list,
      //           skuStockMap,
      //         ),
      //         selected,
      //         original: v.ssu,
      //       }
      //     }),
      //     (s) => `${s.sku_id}_${s.unit_id}`,
      //   ),
      // )
      // #endregion
      //   return null
      // })
    }, [])
    const selected: TableSelectDataItem<string> | undefined = useMemo(
      () =>
        original.sku_id
          ? {
              value: original.sku_id,
              text: original.name!,
            }
          : undefined,
      [original.sku_id, original.name],
    )

    // 展示的时候过滤下搜索q
    return (
      <KCTableSelect
        data={pinYinFilter(skuList, productNameRef.current || '', (e) => e.name)
          .sort((a, b) => b.sku_hot - a.sku_hot)
          .slice()}
        columns={tableColumns}
        selected={selected!}
        onSearch={handleSearch}
        onSelect={handleSelect}
        renderListFilter={(data) => data}
        placeholder={t('输入商品编码或商品名')}
        style={{ width: '168px' }}
        disabled={!!(+status! & (1 << 12))}
      />
    )
  },
)

export default CellSkuSelector
