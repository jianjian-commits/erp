import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import timezone from 'moment-timezone'
import { Flex, Button, Tip, FunctionSet, Confirm, Modal } from '@gm-pc/react'
import _ from 'lodash'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import {
  CreateOrder,
  UpdateOrderDetail,
  Order_State,
  GetMergeOrder,
  Order_PayState,
  UpdateOrderPartField,
  Order_Type,
} from 'gm_api/src/order'
import store from '../store'
import OrderPrintModalNew from '@/pages/delivery/components/order_print_modal_new/order_print_modal_new'
import deliveryOrderStore from '@/pages/delivery/components/order_print_modal_new/store'

import { orderDiffMerge } from '../util'
import globalStore from '@/stores/global'
import { OrderSettings_MergeOrder } from 'gm_api/src/preference'
import CopyOrderConfirm from '@/pages/order/order_manage/components/detail/panel/components/copy_order_confirm'
import { isCombineSku } from '@/pages/order/util'
import {
  DetailListItem,
  Sku,
} from '@/pages/order/order_manage/components/interface'
import {
  ListSpecialBasicPriceV2,
  Quotation_Type,
  SetSpecialBasicPriceV2,
  SetSpecialBasicPriceV2Request_SpecialBasicPriceInfo,
} from 'gm_api/src/merchandise'
import { App_Type } from 'gm_api/src/common'
import bindQuotations from '@/pages/order/order_manage/components/detail/header/bind_quotations'
import { Permission } from 'gm_api/src/enterprise'
import { isZero } from '@/pages/order/number_utils'

const Action = () => {
  const { order, list, hasEditPermission, relation } = store
  const validSkuList = list.filter((v) => v.sku_id && v.unit_id)
  const [saving, setSaving] = useState(false)
  const location = useGMLocation<{ id: string }>()

  function handleBack() {
    if (store.order.view_type === 'edit') {
      Confirm({
        title: t('提示'),
        children: t('确认放弃此次修改吗？'),
      }).then(() => {
        store.fetchOrder(location.query.id)
        return null
      })
    } else {
      window.close() // history.goBack()
    }
  }

  function handleEdit() {
    store.updateOrderInfo('view_type', 'edit')
  }

  async function validateIfWithCombine(): Promise<boolean> {
    return await Confirm({
      children: (
        <Flex column className='gm-margin-lr-20'>
          <Flex justifyStart className='gm-text-16 '>
            {t('确定要保存此订单吗？')}
          </Flex>
          <Flex justifyStart className='gm-text-danger gm-margin-top-10'>
            {t(
              '检测到该订单中含有组合商品，保存订单时，相同的商品将会自动进行价格合并，可能会导致订单的下单金额变动，请谨慎操作。',
            )}
          </Flex>
        </Flex>
      ),
      title: t('提示'),
    })
      .then(() => {
        return true
      })
      .catch(() => {
        setSaving(false)
        return false
      })
  }

  /**
   * 兼容一下lite特殊价绑定逻辑
   */
  const saveOrderHandler = (foo: Function) =>
    new Proxy(foo, {
      apply(target: Function, ctx: any, args: ArrayLike<any>) {
        return Reflect.apply(
          () => {
            return handleSetSpecialBasicPrice(
              store.list.filter((v) => v.sku_id && v.unit_id),
            )
              .catch(() => {
                Tip.danger('sku特殊价绑定失败')
              })
              .then((res) => {
                return target()
              })
          },
          ctx,
          args,
        )
      },
    })

  /**
   * 绑定客户特殊报价，lite用到
   * @param list
   * @returns
   */
  async function handleSetSpecialBasicPrice(list: DetailListItem[]) {
    if (!globalStore.isLite) return Promise.resolve()
    const {
      response: { basic_prices },
    } = await ListSpecialBasicPriceV2({
      customer_id: order.customer?.customer_id!,
      // @ts-ignore
      paging: {
        all: true,
      },
    })

    // 已存在的特殊价
    const exitBasicPrices: string[] = []
    _.each(basic_prices, (basic_price) => {
      _.each(basic_price?.items?.basic_price_items, (basic_price_item) => {
        exitBasicPrices.push(
          `${basic_price.sku_id}-${basic_price_item.order_unit_id}`,
        )
      })
    })

    const groupBySkuId = _.groupBy(list, 'sku_id') // 根据sku_id聚合
    const special_basic_price_infos = []
    for (const [k, v] of Object.entries(groupBySkuId)) {
      const groupByUnitId = _.groupBy(v, 'unit_id') // 根据unit_id聚合
      const special_basic_price_info = {
        customer_id: order.customer?.customer_id,
        basic_price: {
          sku_id: k,
          items: {
            basic_price_items: _.map(_.uniqBy(v, 'unit_id'), (sku) => {
              const maxValItem = _.maxBy(groupByUnitId[sku?.unit_id!], 'price') // 相同单位，找到最大val的那个
              return {
                fee_unit_price: {
                  unit_id: sku.fee_unit_id,
                  val: maxValItem?.price + '',
                },
                order_unit_id: sku.unit_id,
                on_shelf: true,
              }
            }).filter(
              (f) => !exitBasicPrices.includes(`${k}-${f.order_unit_id}`), // 过滤已存在的特殊价
            ),
          },
        },
      }

      if (
        (
          _.get(
            special_basic_price_info,
            'basic_price.items.basic_price_items',
          ) || []
        ).length
      ) {
        special_basic_price_infos.push(special_basic_price_info)
      }
    }

    if (!special_basic_price_infos.length) return

    return SetSpecialBasicPriceV2({
      special_basic_price_infos:
        special_basic_price_infos as SetSpecialBasicPriceV2Request_SpecialBasicPriceInfo[],
    })
  }

  async function handleSave(isEdit = false) {
    setSaving(true)
    if (store.summary.orderPrice > 1e9) {
      Tip.danger('下单金额不能超过10亿')
      setSaving(false)
      throw new Error('orderPrice over maximum error')
    }
    let res
    const list = store.list.filter((v) => v.sku_id && v.unit_id)
    try {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        // 加单数
        const addOrderValue = [
          _.trim(item.add_order_value1?.quantity?.val || '0'),
          _.trim(item.add_order_value2?.quantity?.val || '0'),
          _.trim(item.add_order_value3?.quantity?.val || '0'),
          _.trim(item.add_order_value4?.quantity?.val || '0'),
        ]
        // 判断是否填写加单数量
        const hasAddOrderPrice = addOrderValue.some((item) => {
          const maybeNumber = Number(item)
          return !Number.isNaN(maybeNumber) && maybeNumber > 0
        })
        if (!item.parentId && isZero(item.quantity)) {
          // 是否有套账权限
          const hasFakeOrderPermission =
            !globalStore.isLite &&
            globalStore.hasPermission(
              Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
            )
          if (hasFakeOrderPermission) {
            item.quantity = 0
            if (!hasAddOrderPrice) {
              // 没填写加单数
              Tip.danger(
                `${item.name} 下单数、加单数至少必选任意一项，且不能为 0`,
              )
              throw new Error('num error')
            }
          }
        } else {
          if (
            !item.parentId &&
            !hasAddOrderPrice &&
            item.quantity! < (item.minimum_order_number || 0)
          ) {
            Tip.danger(
              `${item.name} 数量必须大于0，且不小于最小下单数${
                item.minimum_order_number || 0
              }`,
            )
            throw new Error('num error')
          }
        }
        // if (_.isNil(item.price) || _.trim(item.price).length === 0) {
        //   Tip.danger(`${item.name} 单价不能为空`)
        //   throw new Error('num error')
        // }
        if (item.std_quantity === null || item.std_quantity_second === null) {
          Tip.danger(`${item.name} 出库数不能为空`)
          throw new Error('num error')
        }
        // if (
        //   +item.price! === 0 &&
        //   !item.basic_price?.current_price &&
        //   !globalStore.isLite
        // ) {
        //   Tip.danger(`${item.name} 单价不能为0，请重新输入`)
        //   throw new Error('num error')
        // }
      }

      if (!_.isEmpty(list)) {
        const bindSkuList = await bindQuotations(
          store.order.customer?.quotation?.quotation_id!,
          // @ts-ignore
          list,
        )
        bindSkuList.map((skuName) =>
          Tip.success({
            children: (
              <span>
                <span className='tw-font-bold'>{skuName}</span>
                已被同步绑定到报价单中
              </span>
            ),
          }),
        )
      }

      // 单价为0/时价二次确认
      const priceWarn = list.find((item) => {
        return (
          _.isNil(item.price) ||
          _.trim(String(item.price)).length === 0 ||
          String(item.price) === '0'
        )
      })
      if (priceWarn) {
        await Confirm({
          children: `存在销售价为0或为时价的商品，确定要保存吗？`,
          title: t('提示'),
        })
      }

      if (!isEdit) {
        const params = await store.getCreateParams()
        // 如果有组合商品，需要提示
        // if (
        //   params.order_raw_details?.order_details?.find((item) =>
        //     // @ts-ignore
        //     isCombineSku(item),
        //   )
        // ) {
        //   if (!(await validateIfWithCombine())) {
        //     setSaving(false)
        //     return Promise.reject(new Error(''))
        //   }
        // }

        // 判断是否设置了合单
        if (
          globalStore.orderSetting.merge_order! &
          OrderSettings_MergeOrder.MERGEORDER_ERP
        ) {
          const {
            response: { order },
          } = await GetMergeOrder({ order: params }).catch(() => ({
            response: { order: undefined },
          }))
          if (order) {
            res = await Confirm({
              children: `${t('商户有可合并的订单')}: ${
                order.serial_no
              }，是否合并？`,
              title: t('提示'),
            })
              .then(async () =>
                saveOrderHandler(
                  UpdateOrderDetail.bind(null, {
                    order: orderDiffMerge(order, params),
                    need_delete_fake: true,
                  }),
                )(),
              )
              .catch(async (e) => {
                return e.message === 'cancel'
                  ? saveOrderHandler(
                      CreateOrder.bind(null, {
                        order: params,
                        time_zone: timezone.tz.guess(),
                      }),
                    )()
                  : new Error(e.message)
              })
          } else {
            res = saveOrderHandler(
              CreateOrder.bind(null, {
                order: params,
                time_zone: timezone.tz.guess(),
              }),
            )()
          }
        } else {
          res = saveOrderHandler(
            CreateOrder.bind(null, {
              order: params,
              time_zone: timezone.tz.guess(),
            }),
          )()
        }
      } else {
        const params = await store.getUpdateParams()
        // if (
        //   params.order_raw_details?.order_details?.find((item) =>
        //     // @ts-ignore
        //     isCombineSku(item),
        //   )
        // ) {
        //   if (!(await validateIfWithCombine())) {
        //     setSaving(false)
        //     return Promise.reject(new Error(''))
        //   }
        // }
        res = saveOrderHandler(
          UpdateOrderDetail.bind(null, {
            order: params,
            need_delete_fake: true,
          }),
        )()
      }
    } catch (error) {
      setSaving(false)
      return Promise.reject(error)
    }
    setSaving(false)
    return res
  }

  async function handleEditSave() {
    const isEdit = true
    if (store.type === App_Type.TYPE_ESHOP) {
      // 说明是eshop的订单 只能修改订单的状态
      UpdateOrderPartField({
        order_ids: [store.order.order_id],
        order_state: store.order.state!,
      }).then(() => {
        Tip.success('更新成功')
        store.fetchOrder(location.query.id)
      })
      return
    }

    handleSave(isEdit).then((res) => {
      // 判断需要该订单是否包含组合商品
      const { order_details } = res?.response?.order?.order_raw_details!
      Tip.success('更新成功')
      // @ts-ignore
      if (
        _.find(order_details, (item) => isCombineSku(item)) &&
        globalStore.isLite
      ) {
        history.replace(
          `/order/order_manage/list/menu_detail?id=${res.response.order?.serial_no}`,
        )
        return null
      }
      store.fetchOrder(location.query.id)
      return null
    })
  }

  function handleSaveAndBack() {
    handleSave().then((res) => {
      if (res?.response.order?.serial_no) {
        // 判断需要该订单是否包含组合商品
        const { order_details } = res.response.order.order_raw_details!
        // @ts-ignore
        if (
          _.find(order_details, (item) => isCombineSku(item)) &&
          globalStore.isLite
        ) {
          history.replace(
            `/order/order_manage/list/menu_detail?id=${res.response.order?.serial_no}`,
          )
        } else {
          history.replace(
            `/order/order_manage/list/detail?id=${res.response.order?.serial_no}`,
          )
        }
      }
      Tip.success('创建成功')
      return null
    })
  }

  function handleSaveAndContinue() {
    handleSave().then(() => {
      store.init()
      Tip.success('创建成功')
      return null
    })
  }

  function handlePrint() {
    const {
      printModalOptions: { needPopUp },
      goToPrint,
    } = deliveryOrderStore
    if (needPopUp) {
      goToPrint(JSON.stringify({ order_ids: [order.order_id] }))
    } else {
      Modal.render({
        onHide: Modal.hide,
        size: 'lg',
        noContentPadding: true,
        children: (
          <OrderPrintModalNew
            onHide={Modal.hide}
            query={JSON.stringify({ order_ids: [order.order_id] })}
          />
        ),
      })
    }
  }

  function renderEditButton() {
    const ele = (
      <Button
        onClick={handleEdit}
        disabled={
          Boolean(+order?.status! & (1 << 15)) ||
          order.state === Order_State.STATE_DELETE ||
          !hasEditPermission
        }
        className='gm-margin-right-10'
        type='primary'
      >
        {order.state! >= Order_State.STATE_DELIVERYING && !order.has_after_sale
          ? '追加修改'
          : '修改'}
      </Button>
    )

    if (globalStore.isLite) {
      return (
        order.state! < Order_State.STATE_DELIVERYING &&
        order.pay_state !== Order_PayState.PAYSTATE_PAID &&
        ele
      )
    } else {
      return order.state !== Order_State.STATE_RECEIVABLE && ele
    }
  }

  // 是否为菜谱订单
  const isMenuOrder = order.quotation_type === Quotation_Type.WITH_TIME

  return (
    <Flex row justifyEnd alignCenter>
      {order.view_type === 'view' && (
        <>
          {/* lite已出库、已支付的订单不能修改 */}
          {renderEditButton()}
          {!isMenuOrder && (
            <CopyOrderConfirm
              order={order}
              relation={relation}
              customer_id={order.customer?.customer_id || ''}
              service_period_id={order.service_period_id}
            >
              <Button className='gm-margin-right-10'>{t('复制')}</Button>
            </CopyOrderConfirm>
          )}
          <Button className='gm-margin-right-10' onClick={handlePrint}>
            打印
          </Button>
          {order.is_real_order !== 2 && (
            <FunctionSet
              right
              data={[
                {
                  text: t('售后'),
                  onClick: () =>
                    history.push(
                      `/order/after_sales/after_sales_list/create?order_id=${order.serial_no}&type=create`,
                    ),
                },
              ]}
            />
          )}
        </>
      )}
      {order.view_type !== 'view' && (
        <Button className='gm-margin-right-10' onClick={handleBack}>
          取消
        </Button>
      )}
      {order.view_type === 'edit' && (
        <Button
          type='primary'
          className='gm-margin-right-10'
          disabled={saving || !order.service_period_id || !validSkuList.length}
          onClick={handleEditSave}
        >
          保存
        </Button>
      )}
      {order.view_type === 'create' && (
        <>
          <Button
            type='primary'
            className='gm-margin-right-10'
            disabled={
              saving || !order.service_period_id || !validSkuList.length
            }
            onClick={handleSaveAndBack}
          >
            保存
          </Button>
          <Button
            type='primary'
            disabled={
              saving || !order.service_period_id || !validSkuList.length
            }
            onClick={handleSaveAndContinue}
          >
            保存并新建
          </Button>
        </>
      )}
    </Flex>
  )
}

export default observer(Action)
