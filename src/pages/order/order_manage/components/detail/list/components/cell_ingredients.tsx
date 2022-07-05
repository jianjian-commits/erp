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
import SVGCombineSsu from '@/svg/combine_ssu.svg'
import { isCombineSku } from '@/pages/order/util'
import { DetailListItem } from '@/pages/order/order_manage/components/interface'
import Big from 'big.js'
import { SortingStatus } from 'gm_api/src/order'

/**
 * @description: 修改配比,feIngredients
 * @param {*}
 * @return {*}
 */
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
          Cell: (cellProps) => {
            const { sku_name, name } =
              sku.ingredientsInfo?.find(
                (i) => i.sku_id === cellProps.original.sku_id,
              ) || {}
            return sku_name || name || '-'
          },
          // 新建的时候物料名是sku.name， 编辑的时候物料名是orderdetail.sku_name
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
                combine_quantity={+sku.quantity!}
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

  const updateOrderDetail = async <T extends keyof DetailListItem>(
    index: number,
    ingredients: Ingredients,
    field: T,
    needUpdatePrice: boolean,
  ): Promise<unknown> => {
    store.updateRowItem(index, field, ingredients)
    // 根据信息重新计算组合商品单价
    if (needUpdatePrice) {
      const { list } = store
      const combine_price = updateCombineSkuPriceByRatio(
        list,
        ingredients as Ingredients,
      )
      // 更新组合商品单价
      store.updateRowItem(index, 'price', combine_price)
      const combineSku = store.list[index] // 这个组合商品

      // 更新子商品信息
      _.forEach(combineSku.ingredientsInfo, (i) => {
        const index = _.findIndex(
          store.list,
          (item) =>
            item.detail_random_id === combineSku.detail_random_id &&
            item.sku_id === i.sku_id &&
            item.unit_id === i.unit_id,
        )
        if (index === -1) throw Error('修改配比失败')

        store.updateRowItem(
          index,
          'quantity',
          +Big(
            _.find(
              ingredients.ingredients,
              (ig) =>
                ig.sku_id === store.list[index].sku_id &&
                ig.order_unit_id === store.list[index].unit_id,
            )?.ratio || 0,
          ).times(combineSku.quantity!),
        )
        // 未称重才去同步出库数
        if (
          store.list[index].sorting_status! <=
          SortingStatus.SORTINGSTATUS_UNWEIGHT
        ) {
          store.updateRowItem(
            index,
            'std_quantity',
            +Big(
              _.find(
                ingredients.ingredients,
                (ig) =>
                  ig.sku_id === store.list[index].sku_id &&
                  ig.order_unit_id === store.list[index].unit_id,
              )?.ratio || 0,
            ).times(combineSku.quantity!),
          )
        }
      })
    }
    return Promise.resolve(null)
  }

  const handleClose = (): void => {
    popoverRef.current!.apiDoSetActive()
  }

  const handleSave = useCallback((): void => {
    const sku = store.list[index]
    const ingredients = toJS(sku.feIngredients)
    if (ingredients?.ingredients?.some((i) => !Number(i.ratio))) {
      Tip.danger(t('配比不能为空或者0'))
      return
    }
    updateOrderDetail(index, ingredients!, 'ingredients', true)
    handleClose()
  }, [index])

  const handleCancel = useCallback(() => {
    const sku = store.list[index]
    const ingredients = toJS(sku.ingredients)
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
              '修改组成物料的配比后将自动更新此组合商品子商品的下单数量，请谨慎操作',
            )}
          </p>
        </div>
      </PopupContentConfirm>
    ),
    [sku, index, handleSave, handleCancel],
  )

  const label = useMemo(() => {
    let text = ''
    if (view_type === 'view') {
      if (isCombineSku(sku)) text = t('组合商品')
      if (sku.parentId) text = t('子商品')
    } else {
      if (isCombineSku(sku)) text = t('修改配比')
    }
    if (!text) return <></>
    return (
      <div className='gm-margin-left-10'>
        <SVGCombineSsu />
        <span
          className={classNames('gm-text-primary gm-margin-left-5', {
            'gm-cursor': view_type !== 'view',
          })}
        >
          {text}
        </span>
      </div>
    )
  }, [view_type, sku])

  if (
    !isCombineSku(sku) &&
    !sku.parentId &&
    !sku.ingredients?.ingredients?.length
  ) {
    return null
  }

  if (view_type === 'view') return label

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
}

export default observer(CellIngredients)
