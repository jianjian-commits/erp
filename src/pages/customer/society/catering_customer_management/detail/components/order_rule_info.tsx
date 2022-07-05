import React, { forwardRef } from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  FormPanel,
  Form,
  FormItem,
  InputNumber,
  Flex,
  Transfer,
  Switch,
  Tip,
  RightSideModal,
} from '@gm-pc/react'
import PureCalendar from './pure_calendar/index'
import Big from 'big.js'
import _ from 'lodash'
import moment, { Moment } from 'moment'
import { useGMLocation } from '@gm-common/router'
import {
  TableCell,
  MonthAverageV2Cell,
  HistoricalCostCell,
} from './order_rule_cell/index'
import { CustomerDetailLocationQuery } from '../index.page'

interface OrderRuleInfoProps {
  store: any
}

/**
|--------------------------------------------------
|  @components
| #下单限制组件，德保定制需求
|  包括：下单金额限制和商品分类限制
|--------------------------------------------------
*/

const OrderRuleInfo = observer(
  forwardRef<Form, OrderRuleInfoProps>(({ store }, ref) => {
    const {
      orderRuleConfig: { on_off, total_price_rule, category_1_rule },
      setOrderRuleConfig,
      isOrderLimit,
    } = store

    const location = useGMLocation<CustomerDetailLocationQuery>()
    const { customer_id, type } = location.query

    /** 参考营业额 */
    const handleReferenceTurnover = () => {
      // 挂载请求当前月数据
      if (isOrderLimit && customer_id) {
        store.fetchAnalyticsCustomerMealRecord(customer_id)
        store.fetchListCustomerMealRecord(customer_id, moment())
      }

      RightSideModal.render({
        children: (
          <Observer>
            {() => {
              const { analyticsList, customerMealRecordListMap } = store
              let average = 0
              _.forEach(analyticsList, (it) => {
                average += it.total_price
              })
              return (
                <Flex column>
                  <PureCalendar
                    data={analyticsList}
                    customerMealRecordListMap={customerMealRecordListMap}
                    fetchData={(date: Moment) =>
                      store.fetchListCustomerMealRecord(customer_id, date)
                    }
                  />
                  <MonthAverageV2Cell
                    title={t('月均营业额（近三月）')}
                    desc={t('月均营业额（元）')}
                    average={+Big(average).div(3).toFixed(2)}
                  />
                </Flex>
              )
            }}
          </Observer>
        ),
        onHide: RightSideModal.hide,
        noCloseBtn: false,
        style: {
          width: '731px',
        },
        title: t('参考营业额详情'),
      })
    }

    /** 历史成本额 */
    const handleHistoryTurnover = () => {
      if (isOrderLimit && customer_id) {
        // store.fetchTotalCost(customer_id)
        store.fetchAnalyticsData(customer_id)
      }
      RightSideModal.render({
        children: (
          <Observer>
            {() => {
              const { totalCostList, analyticsList } = store
              let average = 0
              _.forEach(totalCostList, (it) => {
                average += it.total_price
              })
              return (
                <Flex column>
                  <HistoricalCostCell data={totalCostList} />
                  <MonthAverageV2Cell
                    title={t('月均成本额（近三月）')}
                    desc={t('月均成本额（元）')}
                    average={+Big(average).div(3).toFixed(2)}
                  />
                </Flex>
              )
            }}
          </Observer>
        ),
        onHide: RightSideModal.hide,
        noCloseBtn: false,
        style: {
          width: '731px',
        },
        title: t('历史成本额详情'),
      })
    }

    return (
      <FormPanel title={t('下单限制')}>
        <Form ref={ref} labelWidth='166px' disabledCol>
          <FormItem label={t('下单限制规则')}>
            <Observer>
              {() => {
                return (
                  <Switch
                    onChange={(value) => {
                      setOrderRuleConfig('on_off', value)
                      if (!value) {
                        store.reSetOrderRuleConfig('All', type)
                      }
                    }}
                    checked={on_off}
                    type='primary'
                    on='开启'
                    off='关闭'
                  />
                )
              }}
            </Observer>

            <div className='gm-padding-5 gm-text-desc'>
              {t('开启后，可针对客户设置下单限制规则。')}
            </div>
          </FormItem>
          {on_off && (
            <>
              <FormItem label={t('订单金额限制')}>
                <Observer>
                  {() => {
                    return (
                      <Switch
                        onChange={(value) => {
                          setOrderRuleConfig('total_price_rule.on_off', value)
                          if (!value) {
                            store.reSetOrderRuleConfig('TOTAL_PRICE_RULE', type)
                          }
                        }}
                        checked={total_price_rule.on_off}
                        type='primary'
                        on='开启'
                        off='关闭'
                      />
                    )
                  }}
                </Observer>

                <div className='gm-padding-5 gm-text-desc'>
                  {t('开启后，可以设置当前周期客户最大订单总金额。')}
                </div>
              </FormItem>
              <Observer>
                {() => {
                  const {
                    orderRuleConfig: { total_price_rule },
                    setOrderRuleConfig,
                  } = store
                  const totalSale = _.get(total_price_rule, 'total_sale.val')
                  const totalCost = _.get(total_price_rule, 'total_cost.val')
                  const totalCostPercent = _.get(
                    total_price_rule,
                    'total_cost_percent.val',
                  )
                  const planOrderPrice = _.get(
                    total_price_rule,
                    'plan_order_price.val',
                  )
                  const orderDays = _.get(total_price_rule, 'order_days.val')

                  return (
                    <>
                      {total_price_rule.on_off && (
                        <>
                          <FormItem label={t('每月营业总额')}>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={
                                  totalSale === -1
                                    ? null
                                    : parseFloat(totalSale)
                                }
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  setOrderRuleConfig(
                                    'total_price_rule.total_sale.val',
                                    value === null ? -1 : value,
                                  )
                                  const percent =
                                    value === null || 0
                                      ? -1
                                      : +Big(+totalCost)
                                          .div(+value)
                                          .times(100)
                                          .toFixed(2) > 100
                                      ? 100
                                      : +Big(+totalCost)
                                          .div(+value)
                                          .times(100)
                                          .toFixed(2)
                                  // 三者不为空的时候
                                  if (
                                    totalCostPercent !== (-1 || 0) &&
                                    totalCost
                                  ) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost_percent.val',
                                      percent,
                                    )
                                    return
                                  }
                                  // 成本占比不为空，计算成本总额
                                  if (totalCostPercent !== (-1 || 0)) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost.val',
                                      value === null || 0
                                        ? 0
                                        : +Big(+totalCostPercent)
                                            .div(100)
                                            .times(+value)
                                            .toFixed(2),
                                    )
                                  }
                                  // 每月成本不为空，计算成本占比
                                  if (totalCost) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost_percent.val',
                                      percent,
                                    )
                                  }
                                }}
                                min={0}
                                // max={1000000}
                                precision={2}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('元')}
                              </span>
                              {type === 'updateCustomer' && (
                                <span
                                  className='gm-cursor gm-text-primary gm-margin-left-10'
                                  onClick={handleReferenceTurnover}
                                >
                                  {t('参考营业额')}
                                </span>
                              )}
                            </Flex>
                          </FormItem>
                          <FormItem label={t('每月成本总额占比')}>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={
                                  totalCostPercent === -1
                                    ? null
                                    : parseFloat(totalCostPercent)
                                }
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  /** 设置每月成本总额占比 */
                                  setOrderRuleConfig(
                                    'total_price_rule.total_cost_percent.val',
                                    value === null ? -1 : value,
                                  )

                                  const totalCost_v2 =
                                    value === null || 0
                                      ? 0
                                      : +Big(+value)
                                          .div(100)
                                          .times(+totalSale)
                                          .toFixed(2)

                                  // 每月下单天数和每月成本额不为空，计算每日计划下单金额
                                  if (
                                    totalSale !== (0 || -1) &&
                                    orderDays !== (0 || -1) &&
                                    totalCost_v2 > 0
                                  ) {
                                    setOrderRuleConfig(
                                      'total_price_rule.plan_order_price.val',
                                      +Big(+totalCost_v2)
                                        .div(+orderDays)
                                        .toFixed(2),
                                    )
                                  } else {
                                    setOrderRuleConfig(
                                      'total_price_rule.plan_order_price.val',
                                      -1,
                                    )
                                  }
                                  // 三者不为空
                                  if (totalSale !== (0 || -1) && totalCost) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost.val',
                                      totalCost_v2,
                                    )
                                    return
                                  }
                                  // 总营业额不为空，计算成本总额
                                  if (totalSale !== (0 || -1)) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost.val',
                                      value === null || 0
                                        ? 0
                                        : +Big(+value)
                                            .div(100)
                                            .times(+totalSale)
                                            .toFixed(2),
                                    )
                                  }

                                  // 成本额不为空，计算总营业额
                                  if (totalCost) {
                                    setTimeout(() => {
                                      setOrderRuleConfig(
                                        'total_price_rule.total_sale.val',
                                        value === null || 0
                                          ? -1
                                          : +Big(totalCost)
                                              .div(+value)
                                              .times(100)
                                              .toFixed(2),
                                      )
                                    }, 800)
                                  }
                                }}
                                min={0}
                                max={100}
                                precision={2}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('%')}
                              </span>
                            </Flex>
                            <div className='gm-padding-5 gm-text-desc'>
                              {t('填写每月成本总额占每月营业总额的百分比。')}
                            </div>
                          </FormItem>
                          <FormItem label={t('每月成本总额')} required>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={totalCost}
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  // 每月设置成本总额
                                  setOrderRuleConfig(
                                    'total_price_rule.total_cost.val',
                                    value,
                                  )

                                  // 设置每日计划下单金额
                                  if (
                                    _.get(
                                      total_price_rule,
                                      'order_days.val',
                                    ) !== (0 || -1)
                                  ) {
                                    const value_new =
                                      value === null
                                        ? -1
                                        : +Big(+value)
                                            .div(
                                              +_.get(
                                                total_price_rule,
                                                'order_days.val',
                                              ),
                                            )
                                            .toFixed(2)
                                    setOrderRuleConfig(
                                      'total_price_rule.plan_order_price.val',
                                      value_new,
                                    )
                                  }

                                  // 三者不为空
                                  if (
                                    totalCostPercent !== (-1 || 0) &&
                                    totalSale !== (-1 || 0)
                                  ) {
                                    setOrderRuleConfig(
                                      'total_price_rule.total_cost_percent.val',
                                      value === null || 0
                                        ? -1
                                        : +Big(+value)
                                            .div(+totalSale)
                                            .times(100)
                                            .toFixed(2) > 100
                                        ? 100
                                        : +Big(+value)
                                            .div(+totalSale)
                                            .times(100)
                                            .toFixed(2),
                                    )
                                  }
                                }}
                                min={0}
                                precision={2}
                                // max={1000000}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('元')}
                              </span>
                              {type === 'updateCustomer' && (
                                <span
                                  className='gm-cursor gm-text-primary gm-margin-left-10'
                                  onClick={handleHistoryTurnover}
                                >
                                  {t('历史成本额')}
                                </span>
                              )}
                            </Flex>
                          </FormItem>
                          <FormItem label={t('每月下单天数')}>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={
                                  _.get(total_price_rule, 'order_days.val') ===
                                  -1
                                    ? null
                                    : parseFloat(orderDays)
                                }
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  setOrderRuleConfig(
                                    'total_price_rule.order_days.val',
                                    value === null ? -1 : value,
                                  )
                                  if (
                                    _.get(
                                      total_price_rule,
                                      'total_cost.val',
                                    ) !== (0 || -1)
                                  ) {
                                    const value_new =
                                      value === null
                                        ? -1
                                        : +Big(
                                            +_.get(
                                              total_price_rule,
                                              'total_cost.val',
                                            ),
                                          )
                                            .div(+value)
                                            .toFixed(2)

                                    setOrderRuleConfig(
                                      'total_price_rule.plan_order_price.val',
                                      value_new,
                                    )
                                  } else {
                                    setOrderRuleConfig(
                                      'total_price_rule.plan_order_price.val',
                                      -1,
                                    )
                                  }
                                }}
                                min={1}
                                max={31}
                                precision={0}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('天')}
                              </span>
                            </Flex>
                          </FormItem>
                          <FormItem label={t('每日计划下单金额')}>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={
                                  planOrderPrice === -1
                                    ? null
                                    : parseFloat(planOrderPrice)
                                }
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  const value_new = value === null ? -1 : value
                                  setOrderRuleConfig(
                                    'total_price_rule.plan_order_price.val',
                                    value_new,
                                  )
                                }}
                                min={0}
                                // max={1000000}
                                precision={2}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('元')}
                              </span>
                            </Flex>
                            <div className='gm-padding-5 gm-text-desc'>
                              {t(
                                '填写每月成本总额和每月开餐天数后，将会自动计算出每日下单金额',
                              )}
                            </div>
                          </FormItem>
                          <FormItem label={t('浮动比例')}>
                            <Flex alignCenter>
                              <InputNumber
                                className='form-control'
                                value={
                                  _.get(total_price_rule, 'floating_ratio') ===
                                  -1
                                    ? null
                                    : parseFloat(
                                        _.get(
                                          total_price_rule,
                                          'floating_ratio',
                                        ),
                                      )
                                }
                                style={{ width: '200px' }}
                                onChange={(value: number | null) => {
                                  setOrderRuleConfig(
                                    'total_price_rule.floating_ratio',
                                    value === null ? -1 : value,
                                  )
                                }}
                                min={0}
                                max={100}
                                precision={2}
                              />
                              <span className='gm-text-desc gm-margin-left-5'>
                                {t('%')}
                              </span>
                            </Flex>
                            <div className='gm-padding-5 gm-text-desc'>
                              {t(
                                '设置后， 允许在每日下单金额的基础浮动该比率。例如：每日下单金额1000， 浮动比例10%， 即每日最大可下单金额为1000+（1000 * 10%）= 1100元。',
                              )}
                            </div>
                          </FormItem>
                          <FormItem label={t('不包含商品分类')}>
                            <Transfer
                              list={_.filter(
                                toJS(store.categoryList),
                                (it) => it.disabled === false,
                              )}
                              selectedValues={store.selected}
                              onSelectValues={(selected) => {
                                if (store.isLock) {
                                  Tip.danger(
                                    t(
                                      '提示：商品分类限制的商品分类需要点击确定!',
                                    ),
                                  )
                                  return
                                }
                                store.onSelected(selected)
                                store.updateMoreSelectList(
                                  selected,
                                  'whiteList',
                                  true,
                                )
                              }}
                              rightTree
                              leftTitle={t('未选择')}
                              rightTitle={t('已选择')}
                            />
                            <div className='gm-padding-5 gm-text-desc'>
                              {t(
                                '下单时，此处选择的商品分类不参与每日下单金额计算。',
                              )}
                            </div>
                          </FormItem>
                        </>
                      )}
                    </>
                  )
                }}
              </Observer>
            </>
          )}
          <Observer>
            {() => {
              return (
                <>
                  {on_off && (
                    <>
                      <FormItem label={t('商品分类限制')}>
                        <Switch
                          onChange={(value) => {
                            setOrderRuleConfig('category_1_rule.on_off', value)
                            if (!value) {
                              store.reSetOrderRuleConfig(
                                'CATEGORY_1_RULE',
                                type,
                              )
                            }
                          }}
                          checked={category_1_rule.on_off}
                          type='primary'
                          on='开启'
                          off='关闭'
                        />
                        <div className='gm-padding-5 gm-text-desc'>
                          {t(
                            '开启后，可设置客户下单的商品分类最大金额/金额比例。',
                          )}
                        </div>
                      </FormItem>
                      {category_1_rule.on_off && <TableCell store={store} />}
                    </>
                  )}
                </>
              )
            }}
          </Observer>
        </Form>
      </FormPanel>
    )
  }),
)

export default OrderRuleInfo
