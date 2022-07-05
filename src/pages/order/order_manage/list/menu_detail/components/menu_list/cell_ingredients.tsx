import React, { FC, useCallback, useMemo, useRef } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  Flex,
  Popover,
  PopupContentConfirm,
  InputNumber,
  Tip,
} from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import store from '../../store'
import type { CellPropsWidthOriginal } from '../../../../components/detail/list/interface'
import { Ingredient, Ingredients } from 'gm_api/src/merchandise'
import { toJS } from 'mobx'
import { updateCombineSkuPriceByRatio } from '../../util'
import { Sku } from '../../../../components/interface'
import SVGCombineSsu from '@/svg/combine_ssu.svg'
import { getOrderUnitName } from '@/pages/order/util'

const CellName: FC<{ original: Ingredient }> = observer(({ original }) => {
  const { skuMap } = store
  return (
    <div>
      {(_.find(skuMap, (sku) => sku.sku_id === original.sku_id) || {}).name ||
        '-'}
    </div>
  )
})

const CellQuantity: FC<{
  original: Ingredient
  index: number
  skuIndex: number
  combine_quantity: number
}> = observer(({ original, skuIndex, index }) => {
  const handleChange = (value: number | null) => {
    store.updateMenuRowIngredients(
      skuIndex,
      index,
      _.isNumber(value) ? `${value}` : '',
    )
  }

  const quantity: number | null = original.ratio === '' ? null : +original.ratio

  const className = useMemo(
    () =>
      classNames({
        'b-bg-warning': !_.isNumber(quantity),
      }),
    [quantity],
  )

  const { unit } =
    _.find(store.list, (sku) => sku.sku_id === original.sku_id) || {}

  return (
    <Flex alignCenter>
      <InputNumber
        value={quantity!}
        className={className}
        onChange={handleChange}
        precision={4}
        min={0}
      />
      <Flex className='gm-padding-left-5'>{unit?.name}</Flex>
    </Flex>
  )
})

const IngredientsTable: FC<CellPropsWidthOriginal> = observer(
  ({ sku, index }) => {
    const columns = useMemo(() => {
      return [
        {
          Header: t('组成物料'),
          id: 'index',
          fixed: 'left',
          width: 80,
          Cell: (cellProps) => <CellName original={cellProps.original} />,
        },
        {
          Header: t('单份数量'),
          accessor: 'name',
          minWidth: 80,
          Cell: (cellProps) => {
            return (
              <CellQuantity
                index={cellProps.index}
                original={cellProps.original}
                skuIndex={index}
                combine_quantity={sku.quantity!}
              />
            )
          },
        },
      ] as Column<Ingredient>[]
    }, [index])
    return (
      <Table
        style={{ maxHeight: '340px' }}
        tiled
        data={sku?.feIngredients?.ingredients || []}
        columns={columns}
      />
    )
  },
)

const CellIngredients: FC<CellPropsWidthOriginal> = ({
  index,
  sku,
  status,
}) => {
  const { view_type } = store.order

  const popoverRef = useRef<Popover>(null)

  const updateOrderDetail = async <T extends keyof Sku>(
    index: number,
    ingredients: Ingredients,
    field: T,
    needUpdatePrice: boolean,
  ): Promise<unknown> => {
    store.updateMenuRowItem(index, field, ingredients)
    // 根据信息重新计算组合商品单价
    if (needUpdatePrice) {
      const { skuMap, list: skuList, orderSetting } = store

      const combine_price = updateCombineSkuPriceByRatio(skuList, ingredients)

      store.updateMenuRowItem(index, 'price', combine_price)
      // 同时还要更新商品明细
      store.updateMergeSku(
        store.menuList.filter((v) => v.sku_id && v.unit_id),
        skuMap,
        undefined,
        skuList,
        orderSetting,
      )
    }
    return Promise.resolve(null)
  }

  const handleClose = (): void => {
    popoverRef.current!.apiDoSetActive()
  }

  const handleSave = useCallback((): void => {
    const sku = store.menuList[index]
    const ingredients = toJS(sku.feIngredients)
    if (ingredients?.ingredients?.some((i) => !Number(i.ratio))) {
      Tip.danger(t('配比不能为空或者0'))
      return
    }
    updateOrderDetail(index, ingredients!, 'ingredients', true)
    handleClose()
  }, [index])

  const handleCancel = useCallback(() => {
    const ssu = store.menuList[index]
    const ingredients = toJS(ssu.ingredients)
    updateOrderDetail(index, ingredients!, 'feIngredients', false)
    handleClose()
  }, [index])

  const popup = useMemo(
    () => (
      <PopupContentConfirm
        type='save'
        title={t('修改配比')}
        onCancel={handleCancel}
        onSave={handleSave}
      >
        <div style={{ minWidth: '200px' }}>
          <IngredientsTable sku={sku} index={index} />
          <p className='gm-margin-top-5'>
            {t(
              '修改组成物料的配比后将自动更新此订单中的商品明细数量，请谨慎操作',
            )}
          </p>
        </div>
      </PopupContentConfirm>
    ),
    [sku, index, handleSave, handleCancel],
  )
  const label = useMemo(
    () => (
      <div className='gm-margin-left-10'>
        <SVGCombineSsu />
        <span
          className={classNames('gm-text-primary gm-margin-left-5', {
            'gm-cursor': view_type === 'edit',
          })}
        >
          {view_type === 'edit' ? t('修改配比') : t('组合')}
        </span>
      </div>
    ),
    [view_type],
  )

  if (!sku.ingredients?.ingredients?.length) return null
  if (view_type === 'view') return label
  if (view_type === 'edit')
    return (
      <Popover
        showArrow
        type='click'
        popup={popup}
        ref={popoverRef}
        disabled={!!(+status! & (1 << 12))}
      >
        {label}
      </Popover>
    )
  return null
}

export default observer(CellIngredients)
