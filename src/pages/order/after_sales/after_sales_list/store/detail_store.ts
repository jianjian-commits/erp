import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { GetCustomer, ListSupplier } from 'gm_api/src/enterprise'
import { history } from '@/common/service'
import Big from 'big.js'
import {
  CreateAfterSaleOrderPreview,
  GetAfterSaleOrderDetail,
  CreateAfterSaleOrder,
  AfterSaleOrder_Status,
  AfterSaleOrderDetail_Type,
  GetAfterSaleOrder,
  UpdateAfterSaleOrder,
  AfterSaleOrderDetail,
  AfterSaleOrder,
  Status_Code,
  GetAfterSaleOrderResponse,
} from 'gm_api/src/aftersale'
import { Sku } from 'gm_api/src/merchandise'
import { getCategoryName, parseSku, toFixedOrder } from '@/common/util'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Order, OrderDetail } from 'gm_api/src/order'
import {
  AfterSalesList,
  RefundOnlyList,
  ReturnRefundList,
  HeaderDetail,
  levelList,
} from '../interface'
import globalStore from '@/stores/global'
import { toBasicUnit } from '@/pages/order/util'

/** 可选商品列表 */
interface SkuListOption extends Sku {
  value: string
  text: string
  category_info: string[] // 分类
  category_name: string
  ssu_data: {} // 规格
}

/** 售后新建/详情页头部 */
const defaultHeaderDetail = {
  remark: '', // 售后备注
  creator_name: '', // 创建人名字
  creator_id: '', // 创建人id
  create_time: undefined, // 创建时间
  after_sales_code: '', // 售后单号
  after_status: 0, // 售后状态
  all_detail_num: 1,
  completed_detail_num: 0,
  customers: {}, // 商户
  order_code: '', // 订单号
  order_id: '',
  order_code_popover: {
    create_time: '', // 下单时间
    received_time: '', // 收货时间
    state: 0, // 订单状态
    driver_id: '', // 司机
    addresses: { addresses: [] }, // 收货信息
    route: '',
  },
}

const defaultAfterSalesList = {
  apply_return_amount: '', // 申请退款金额
  real_return_amount: '', // 实退金额
  department_blame_name: '', // 责任部门
  department_to_name: '', // 跟进部门
  reason: 0, // 售后原因
  method: 0, // 售后方式
  remark: '', // 备注
  last_operator_id: '', // 最后操作人
  order_detail_id: '0', // 默认传0
  flag: 0, // 0为未选中，1为选中必选
}

const defaultRefundOnlyList = {
  sku_id: '',
  sku_name: {},
  order_detail_id: '',
  category_name: '', // 分类
  sale_ratio: '', // 规格
  amount: '', // 出库数
  sales_price: '', // 销售价格
  ssu_base_unit_name: '',
  ssu_base_unit_id: '',
  ssu_unit_name: '',
  ssu_unit_name_id: '',
  type: globalStore.isLite
    ? AfterSaleOrderDetail_Type.TYPE_REFUND
    : AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
  apply_return_value: {
    input: {
      unit_id: '',
      quantity: '',
      price: '',
    },
    calculate: {
      unit_id: '',
      quantity: '',
      price: '',
    },
  },
  supplier_id: '0', // 供应商ID
  supplier_name: [], // 供应商名
}

const defaultReturnRefundList = {
  driver_id: '0', // 司机
  task_method: '', // 处理方式
  apply_return_amount: '', // 实退数
}

// 相同部分公用
const initAfterSalesList = {
  ...defaultAfterSalesList,
}

export const initRefundOnlyList = {
  ...defaultAfterSalesList,
  ...defaultRefundOnlyList,
  can_return_count: 0,
  type: globalStore.isLite
    ? AfterSaleOrderDetail_Type.TYPE_REFUND
    : AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
}

class Store {
  /** 是否关联订单 */
  withOrder = false

  // 头部数据
  headerDetail: HeaderDetail = {
    ...defaultHeaderDetail,
  }

  summary = {
    order_money: '0', // 下单金额
    stock_out_money: '0', // 出库金额
    actual_refund_money: '0', // 实退金额
    refundable_money: '0', // 应退金额
  }

  list_type: number[] = []

  ssu_list: OrderDetail[] = []

  // 关联订单可退数量
  return_value_map: { [key: string]: string } | undefined = {}

  loading = false

  // 订单售后明细
  orderAfterSalesDetail: AfterSalesList[] = [
    { ...initAfterSalesList, type: AfterSaleOrderDetail_Type.TYPE_ORDER },
  ]

  // 仅退款明细
  refundDetailOnly: RefundOnlyList[] = [initRefundOnlyList]

  // 可选商品列表
  sku_list: SkuListOption[] = []

  // 已选商品条目类型统计
  selectedSkuCount: {
    [key: string]: {
      refund: boolean
      returnRefund: boolean
    }
  } = {}

  // 供应商列表
  supplierList: levelList[] = []

  after_sale_order: AfterSaleOrder = {
    after_sale_order_id: '',
    apply_return_amount: '',
    real_return_amount: '',
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 详情售后类型记录初始化
  setInitialSelectedSkuCount(id: string, type: AfterSaleOrderDetail_Type) {
    if (!this.selectedSkuCount[id]) {
      this.selectedSkuCount[id] = {
        returnRefund: type === AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
        refund: type === AfterSaleOrderDetail_Type.TYPE_REFUND,
      }
    } else {
      if (type === AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN) {
        this.selectedSkuCount[id].returnRefund = true
      } else {
        this.selectedSkuCount[id].refund = true
      }
    }
  }

  setSelectedSkuCount(
    id: string,
    item: { refund: boolean; returnRefund: boolean },
  ) {
    this.selectedSkuCount[id] = item
  }

  updateHeaderDetail<T extends keyof HeaderDetail>(
    key: T,
    value: HeaderDetail[T],
  ) {
    this.headerDetail[key] = value
  }

  updateSkuList(list: SkuListOption[]) {
    this.sku_list = list
  }

  // 更新商品条目
  updateRefundDetailOnlyLine(index: number, item: any) {
    this.refundDetailOnly[index] = _.cloneDeep(item)
  }

  // 获取供应商列表
  fetchMerchantList() {
    ListSupplier({ paging: { limit: 999 } }).then((json) => {
      const list = json.response.suppliers!.map((v) => ({
        ...v,
        value: v.supplier_id!,
        text: v.name!,
      }))
      this.supplierList = list
      return json.response
    })
  }

  // 添加订单售后明细item
  addTableItem() {
    this.refundDetailOnly.push({
      ...initRefundOnlyList,
    })
  }

  // 删除订单售后明细item
  deleteTableItem(index: number) {
    const { sku_id, type, order_detail_id } = this.refundDetailOnly[index]
    const id =
      this.headerDetail.order_id && this.headerDetail.order_id !== '0'
        ? order_detail_id
        : sku_id
    if (id) {
      if (type === AfterSaleOrderDetail_Type.TYPE_REFUND) {
        this.selectedSkuCount[id].refund = false
      } else {
        this.selectedSkuCount[id].returnRefund = false
      }
    }
    this.refundDetailOnly.splice(index, 1)
  }

  // 设置订单售后明细数据
  updateOrderAfterSalesDetail<T extends keyof AfterSalesList>(
    index: number,
    key: T,
    value: AfterSalesList[T],
  ) {
    this.orderAfterSalesDetail[index][key] = value
  }

  updateRefundDetailOnlyBatch<T extends keyof RefundOnlyList>(
    index: number,
    list: {
      key: T
      value: RefundOnlyList[T]
    }[],
  ) {
    _.map(list, ({ key, value }) => {
      this.refundDetailOnly[index][key] = value
    })
  }

  // 设置仅退款明细
  updateRefundDetailOnly<T extends keyof RefundOnlyList>(
    index: number,
    key: T,
    value: RefundOnlyList[T],
  ) {
    this.refundDetailOnly[index][key] = value
  }

  updateReturnRefundDetailBatch<T extends keyof ReturnRefundList>(
    index: number,
    list: {
      key: T
      value: ReturnRefundList[T]
    }[],
  ) {
    _.map(list, ({ key, value }) => {
      this.returnRefundDetail[index][key] = value
    })
  }

  // 设置退货退款明细
  updateReturnRefundDetail<T extends keyof ReturnRefundList>(
    index: number,
    key: T,
    value: ReturnRefundList[T],
  ) {
    this.returnRefundDetail[index][key] = value
  }

  // 不关联订单，查询客户信息
  getCustomerDetail(customer_id: string) {
    return GetCustomer({ customer_id: customer_id }).then((json) => {
      const { name } = json.response.customer
      this.headerDetail.creator_name =
        globalStore.userInfo.account?.username || ''
      this.headerDetail.customers.name = name
      this.headerDetail.customers.customer_id = customer_id
      this.loading = false
    })
  }

  // 根据ID获取订单详情
  getOrderDetail(serial_no: string, customer_id: string) {
    this.loading = true

    // 不关联订单的售后单，不需要获取订单信息
    if (!serial_no) {
      return this.getCustomerDetail(customer_id)
    }

    return CreateAfterSaleOrderPreview({
      order_serial_no: serial_no,
    }).then((json) => {
      const { order_detail, route, supplier, return_value_map } = json.response
      const { detail, relation_info } = order_detail!
      this.return_value_map = return_value_map
      // 头部数据，获取一个order就行
      const order = detail?.length && detail[0]?.order!
      if (order) {
        this.summary.order_money = order?.order_price!
        this.summary.stock_out_money = order?.outstock_price!
        this.headerDetail.order_code = order?.serial_no!
        this.headerDetail.order_id = order?.order_id!
        this.headerDetail.remark = ''
        this.headerDetail.customers =
          relation_info?.customers![order?.receive_customer_id!]
        this.headerDetail.creator_name =
          relation_info?.group_users![order?.creator_id!]?.name!
        this.headerDetail.all_detail_num = 1
        this.headerDetail.completed_detail_num = 0
        // this.headerDetail.order_code_popover.addresses = order?.addresses?.addresses!
        this.headerDetail.order_code_popover.create_time = order?.create_time!
        this.headerDetail.order_code_popover.received_time =
          order?.receive_time!
        this.headerDetail.order_code_popover.state = order?.state!
        this.headerDetail.order_code_popover.driver_id = order?.driver_id!
        this.headerDetail.order_code_popover.route =
          route?.routes![
            route?.customer_routes![order?.receive_customer_id!]
          ]?.route_name!
        this.headerDetail.order_code_popover.addresses = {
          addresses: order?.addresses?.addresses!,
        }
      }

      // 获取商品展示
      if (detail?.length && relation_info?.sku_snaps) {
        // 需要展示的商品，可能相同的sku，可能不同
        const orderSkuDetail = _.map(detail, (item) => item.detail)

        this.sku_list = _.map(orderSkuDetail, (skuInfo) => {
          // sku信息
          const originSkuData =
            relation_info?.sku_snaps![
              `${skuInfo?.sku_id!}_${skuInfo?.sku_revision}`
            ]
          // sku单位信息，暂时去掉
          const unitData = parseSku(skuInfo!)
          const outStockValue = this.getOutStackValue(skuInfo!)
          const fee_unit_id = skuInfo?.fee_unit_id
          const outstock_unit_id =
            skuInfo?.outstock_unit_value_v2?.quantity?.unit_id
          const unit_cal_info = skuInfo?.unit_cal_info
          let rate
          if (fee_unit_id === outstock_unit_id) {
            rate = Big(1)
          } else {
            if (
              globalStore.getUnit(fee_unit_id) &&
              globalStore.getUnit(outstock_unit_id)
            ) {
              rate = globalStore.getUnitRate(outstock_unit_id, fee_unit_id)
            } else {
              rate = globalStore.getUnitRatewithCustomizeUnit(
                fee_unit_id,
                // 非新增时，units没有构造，直接去unit_cal_info里面拿
                unit_cal_info?.unit_lists.find(
                  (unit) => unit.unit_id === outstock_unit_id,
                ),
              )
            }
          }
          return {
            value: skuInfo?.order_detail_id,
            text: skuInfo?.sku_name!,
            // sku的分类名称，todo
            category_name: getCategoryName(
              relation_info.category,
              originSkuData.category_id,
            ),
            // category_info:
            //   _.map(
            //     originSkuData?.category_infos,
            //     (category_info) => category_info?.category_name!,
            //   ) || [],
            ssu_data: unitData,
            outstock_unit_name: unitData?.outstock_unit_name,
            fee_unit_name: unitData?.fee_unit_name!,
            unit_cal_info,
            // 单价转成和出库数一样的单位
            // sales_price: `${outStockValue?.sales_price * rate}`,
            sales_price: outStockValue?.sales_price,
            amount: outStockValue?.amount,
            driver_id: order?.driver_id!,
            supplier_id:
              supplier?.results![skuInfo?.sku_id!]?.ssu_detail![
                skuInfo?.unit_id!
              ] || '0',
            // ...skuInfo?.ssu!,
            unit_id: skuInfo?.unit_id,
            outstock_unit_id: unitData?.outstock_unit_id,
            fee_unit_id,
            ...originSkuData,
          }
        })
      }
      this.loading = false
      return json.response
    })
  }

  // 获取售后单详情 不用
  getAfterSaleOrderDetail(after_sale_order_id: string) {
    return GetAfterSaleOrderDetail({ after_sale_order_id }).then((json) => {
      return json.response
    })
  }

  getOutStackValue(skuInfo: OrderDetail) {
    // 单位判断
    // const {
    //   unit: { parent_id, rate },
    // } = skuInfo?.ssu!
    // const _sales_price =
    //   parent_id === skuInfo?.outstock_unit_value_v2?.price?.unit_id!
    //     ? Big(+skuInfo?.order_unit_value_v2?.price?.val!).toFixed(2)
    //     : Big(+skuInfo?.order_unit_value_v2?.price?.val!)
    //         .div(rate)
    //         .toFixed(2)
    // const _amount =
    //   parent_id === skuInfo?.outstock_unit_value_v2?.quantity?.unit_id!
    //     ? Big(+skuInfo?.outstock_unit_value_v2?.quantity?.val!).toFixed(2)
    //     : Big(+skuInfo?.outstock_unit_value_v2?.quantity?.val!)
    //         .times(rate)
    //         .toFixed(2)
    return {
      amount: Big(+skuInfo?.outstock_unit_value_v2?.quantity?.val!).toFixed(2),
      sales_price: Big(+skuInfo?.order_unit_value_v2?.price?.val!).toFixed(2),
    }
  }

  /** 获取关联订单的售后单详情列表 */
  getDetailListWithOrder(
    after_sale_order_details: AfterSaleOrderDetail[],
    order_details: any,
    _relation_info: any,
    _order: Order,
  ) {
    this.refundDetailOnly = _.map(after_sale_order_details, (it) => {
      const _order_details = _.find(
        order_details,
        (item) => item.order_detail_id! === it.order_detail_id,
      )
      const unit_data = parseSku(_order_details!)
      const outStockValue = this.getOutStackValue(_order_details!)
      const originSkuData =
        _relation_info?.sku_snaps![
          `${_order_details?.sku_id!}_${_order_details?.sku_revision}`
        ]

      const fee_unit_id = _order_details?.fee_unit_id
      const outstock_unit_id =
        _order_details?.outstock_unit_value_v2?.quantity?.unit_id
      const unit_cal_info = _order_details?.unit_cal_info
      let rate
      if (fee_unit_id === outstock_unit_id) {
        rate = Big(1)
      } else {
        if (
          globalStore.getUnit(fee_unit_id) &&
          globalStore.getUnit(outstock_unit_id)
        ) {
          rate = globalStore.getUnitRate(outstock_unit_id, fee_unit_id)
        } else {
          rate = globalStore.getUnitRatewithCustomizeUnit(
            fee_unit_id,
            // 非新增时，units没有构造，直接去unit_cal_info里面拿
            unit_cal_info?.unit_lists.find(
              (unit) => unit.unit_id === outstock_unit_id,
            ),
          )
        }
      }

      this.setInitialSelectedSkuCount(_order_details.order_detail_id, it.type)

      return {
        ...it,
        sku_name: _order_details?.sku_name!,
        // sales_price: `${outStockValue?.sales_price * rate}`,
        sales_price: outStockValue?.sales_price,
        amount: outStockValue?.amount!,
        // ssu_base_unit_name: unit_data?.ssu_unit_parent_name!,
        // ssu_unit_name: unit_data?.ssu_unit_name!,
        sale_ratio:
          unit_data && Object.keys(unit_data).length > 0
            ? `${unit_data?.ssu_unit_rate!}${unit_data?.ssu_unit_parent_name!}/${unit_data?.ssu_unit_name!}`
            : '',
        category_name: getCategoryName(
          _relation_info.category,
          originSkuData.category_id,
        ),
        fee_unit_name: unit_data?.fee_unit_name!,
        outstock_unit_name:
          unit_cal_info.unit_lists.find(
            (item) => item.unit_id === outstock_unit_id,
          )?.name || '-',
        last_operator_id:
          _relation_info?.group_users![it?.last_operator_id!]?.name!,
        flag: 1,
        // 换算单位必需
        fee_unit_id: unit_data?.fee_unit_id!,
        unit_cal_info: _order_details?.unit_cal_info,
        base_unit_id: originSkuData.base_unit_id,
        second_base_unit_id: originSkuData.second_base_unit_id,
        second_base_unit_ratio: originSkuData.second_base_unit_ratio,
      }
    })

    this.ssu_list = _order?.order_details?.order_details!
  }

  /** 获取不关联订单售后单详情列表 */
  getDetailListWithoutOrder(res: GetAfterSaleOrderResponse) {
    const {
      after_sale_order: {
        after_sale_order_details: { after_sale_order_details = [] },
        customer_id,
        creator_id,
      },
      relation_info: { sku_info, customers, group_users },
    } = res
    if (after_sale_order_details.length) {
      const { basic_prices, category_map, sku_map } = sku_info
      this.headerDetail = {
        ...this.headerDetail,
        customers: customers[customer_id],
        creator_name: group_users[creator_id].username,
      }
      this.refundDetailOnly = _.map(after_sale_order_details, (detailItem) => {
        const { sku_id, unit_id } = detailItem
        const skuItem = sku_map[sku_id]
        const {
          units: { units = [] },
        } = skuItem

        /** 下单单位 */
        let unitName = ''
        const customerUnitIndex = _.findIndex(
          units,
          (unitItem) => unitItem.unit_id === unit_id,
        )
        if (customerUnitIndex >= 0) {
          unitName = units[customerUnitIndex].name
        } else {
          unitName = globalStore.getUnitName(unit_id)
        }

        /** 销售价格 */
        let price = '0'
        const basicPrice = _.find(
          basic_prices,
          (basicItem) => basicItem.sku_id === sku_id,
        )
        if (basicPrice) {
          const priceItem = _.find(
            basicPrice.items.basic_price_items,
            (item) => item.order_unit_id === unit_id,
          )
          price = priceItem.fee_unit_price.val
        }

        getCategoryName(sku_info.category_map, skuItem.category_id)
        this.setInitialSelectedSkuCount(sku_id, detailItem.type)

        return {
          ...detailItem,
          ...skuItem,
          sku_name: skuItem.name,
          sales_price: price,
          amount: '0',
          sale_ratio: '',
          category_name: getCategoryName(
            sku_info.category_map,
            skuItem.category_id,
          ),
          fee_unit_name: unitName,
          outstock_unit_name: unitName,
          last_operator_id: '',
          flag: 1,
          fee_unit_id: '',
          unit_cal_info: '',
        }
      })
    }
  }

  // 获取指定售后订单
  getAfterSaleOrder(after_sale_order_id: string) {
    this.loading = true
    return GetAfterSaleOrder({ after_sale_order_id }).then((json) => {
      const { after_sale_order, relation_info } = json?.response!
      const { after_sale_order_details } =
        after_sale_order?.after_sale_order_details!
      const orders = relation_info?.orders!
      const _order = orders[after_sale_order?.order_id!]
      const _relation_info = relation_info?.relation_info!
      this.withOrder = after_sale_order.order_id !== '0'

      this.summary = {
        ...this.summary,
        actual_refund_money: after_sale_order?.real_return_amount!,
        refundable_money: after_sale_order?.apply_return_amount!,
      }

      this.headerDetail = {
        ...this.headerDetail,
        after_sales_code: after_sale_order?.serial_no!,
        remark: after_sale_order?.remark!,
        create_time: after_sale_order?.create_time!,
        creator_name:
          _relation_info?.group_users![after_sale_order?.creator_id!]?.name!,
        customers: _relation_info?.customers![_order?.receive_customer_id!],
        after_status: after_sale_order?.status!,
        all_detail_num: after_sale_order?.all_detail_num!,
        completed_detail_num: after_sale_order?.completed_detail_num!,
      }

      if (this.withOrder) {
        const { order_details } = _order?.order_details!
        this.summary = {
          ...this.summary,
          order_money: _order?.order_price!,
          stock_out_money: _order?.outstock_price!,
        }

        this.headerDetail = {
          ...this.headerDetail,
          order_code: _order?.serial_no!,
          order_id: after_sale_order?.order_id!,
          order_code_popover: {
            create_time: _order?.create_time!,
            received_time: _order?.receive_time!,
            state: _order?.state!,
            driver_id: _order?.driver_id!,
            addresses: {
              addresses: _order?.addresses?.addresses!,
            },
            route:
              relation_info?.routes![
                relation_info?.customer_routes![_order?.receive_customer_id!]
              ]?.route_name!,
          },
        }

        this.getDetailListWithOrder(
          after_sale_order_details!,
          order_details,
          _relation_info,
          _order,
        )
      } else {
        this.getDetailListWithoutOrder(json.response)
      }

      this.after_sale_order = after_sale_order
      this.loading = false
      return json.response
    })
  }

  // 审核
  AuditAfterSaleOrder() {
    this.loading = true
    let status = AfterSaleOrder_Status.STATUS_TO_REFUND
    _.forEach(this.refundDetailOnly, (item) => {
      if (item.type === AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN) {
        status = AfterSaleOrder_Status.STATUS_TO_RETURNED
      }
    })
    const { order_id, remark, after_sales_code, after_sale_order_id } =
      this.headerDetail
    const { stock_out_money, actual_refund_money } = this.summary

    const _refundDetailOnly = _.map(this.refundDetailOnly, (item) => {
      return {
        ..._.pick(item, [
          'after_sale_order_detail_id',
          'after_sale_order_id',
          'apply_return_value',
          'apply_return_amount',
          'order_detail_id',
          'supplier_id',
          'department_blame_name',
          'department_to_name',
          'reason',
          'method',
          'remark',
          'type',
          'flag',
        ]),
        last_operator_id: item.last_operator_id_!,
      }
    })

    const HAVE_FLAG_ONE = _.filter(_refundDetailOnly, (item) => {
      return item.flag === 1
    })
    if (HAVE_FLAG_ONE.length) {
      const refund_only = _.filter(
        HAVE_FLAG_ONE,
        (it) => it.type === AfterSaleOrderDetail_Type.TYPE_REFUND,
      )

      let apply_total_amount = 0

      if (refund_only.length) {
        const is_apply_quantity_1 = _.map(
          refund_only,
          (item) => item.apply_return_value?.input?.quantity!,
        )
        const is_apply_price_1 = _.map(
          refund_only,
          (item) => item.apply_return_value?.input?.price!,
        )

        _.each(refund_only, (it) => {
          const { input, calculate } = it.apply_return_value

          apply_total_amount =
            apply_total_amount +
            Number(
              toFixedOrder(
                Big(toBasicUnit(input?.quantity || '0', it, 'quantity')).times(
                  toBasicUnit(calculate?.price || '0', it, 'price'),
                ),
              ),
            )
        })

        if ([...is_apply_quantity_1].includes('')) {
          Tip.danger(t('请填写申请退款数'))
          return
        }
        if ([...is_apply_price_1].includes('')) {
          Tip.danger(t('请填写申请单价'))
          return
        }
      }

      if (
        Number(Big(apply_total_amount).toFixed(2)) >
        Number(
          Big(Number(stock_out_money))
            .minus(Number(actual_refund_money))
            .toFixed(2),
        )
      ) {
        Tip.danger(t('申请退款总金额已超，请调整申请明细'))
        return
      }
    } else {
      Tip.danger(t('请填写售后明细'))
      return
    }

    const after_sale_order_details: AfterSaleOrderDetail[] = _.map(
      HAVE_FLAG_ONE,
      (item) => _.omit(item, ['flag']),
    )

    return UpdateAfterSaleOrder(
      {
        after_sale_order: {
          after_sale_order_id: after_sale_order_id!,
          order_id: order_id || '0',
          status,
          remark,
          after_sale_order_details: {
            after_sale_order_details,
          },
        },
      },

      [Status_Code.OUT_STOCK_VALUE_LACK],
    ).then((json) => {
      const { after_sale_order } = json.response
      if (json.code === Status_Code.OUT_STOCK_VALUE_LACK) {
        const out_amount_ssu = _.find(
          this.ssu_list,
          (it) => it?.sku_id! === json?.message?.detail?.sku_id!,
        )
        Tip.danger(
          t(
            `${
              out_amount_ssu?.sku_name! || ''
            }申请退款数/申请退货数超出可退数量`,
          ),
        )
        throw Promise.reject(
          new Error(
            t(
              `${
                out_amount_ssu?.sku_name! || ''
              }申请退款数/申请退货数超出可退数量`,
            ),
          ),
        )
      } else {
        Tip.success(t('审核成功'))
        this.getAfterSaleOrder(after_sale_order?.after_sale_order_id!)
        this.doRequest()
      }
      this.loading = false
      return json
    })
  }

  // 创建售后单
  CreateAfterSaleOrder(type: AfterSaleOrder_Status) {
    const { order_id, remark, customers } = this.headerDetail
    const { stock_out_money, actual_refund_money } = this.summary

    let apply_total_amount = 0

    const _refundDetailOnly = _.map(this.refundDetailOnly, (item) =>
      _.pick(item, [
        'apply_return_value',
        'apply_return_amount',
        'order_detail_id',
        'supplier_id',
        'department_blame_name',
        'department_to_name',
        'reason',
        'method',
        'remark',
        'type',
        'flag',
        'sku_id',
        'unit_id',
        'receive_customer_id',
      ]),
    )

    // 用于判断至少必填一个表，flag = 1为表的必填项已填，flag = 0为表的必填项未填
    const HAVE_FLAG_ONE = _.filter(_refundDetailOnly, (item) => {
      return item.flag === 1
    })

    if (HAVE_FLAG_ONE.length) {
      _.each(HAVE_FLAG_ONE, (it) => {
        apply_total_amount =
          apply_total_amount + Number(it?.apply_return_amount)
      })
      const is_apply_quantity_1 = _.map(
        HAVE_FLAG_ONE,
        (item) => item.apply_return_value?.input?.quantity!,
      )
      const is_apply_price_1 = _.map(
        HAVE_FLAG_ONE,
        (item) => item.apply_return_value?.input?.price!,
      )

      _.each(HAVE_FLAG_ONE, (it) => {
        const { input, calculate } = it.apply_return_value

        apply_total_amount =
          apply_total_amount +
          Number(
            toFixedOrder(
              Big(toBasicUnit(input?.quantity || '0', it, 'quantity')).times(
                toBasicUnit(calculate?.price || '0', it, 'price'),
              ),
            ),
          )
      })

      if ([...is_apply_quantity_1].includes('')) {
        Tip.danger(t('请填写申请退款数'))
        return
      }
      if ([...is_apply_price_1].includes('')) {
        Tip.danger(t('请填写申请单价'))
        return
      }

      if (
        this.headerDetail.order_id &&
        Number(Big(apply_total_amount).toFixed(2)) >
          Number(
            Big(Number(stock_out_money))
              .minus(Number(actual_refund_money))
              .toFixed(2),
          )
      ) {
        Tip.danger(t('申请退款总金额已超，请调整申请明细'))
        return
      }
    } else {
      Tip.danger(t('请填写售后明细'))
      return
    }

    const after_sale_order_details: AfterSaleOrderDetail[] = _.map(
      HAVE_FLAG_ONE,
      (item) => _.omit(item, ['flag']),
    )

    const req = { order_id: order_id, customer_id: customers.customer_id }
    if (this.headerDetail.order_id) {
      delete req.customer_id
    } else {
      delete req.order_id
    }

    return CreateAfterSaleOrder(
      {
        after_sale_order: {
          ...req,
          status: type,
          remark,
          apply_return_amount: apply_total_amount.toString(),
          real_return_amount: '0',
          after_sale_order_details: {
            after_sale_order_details,
          },
        },
      },
      [Status_Code.OUT_STOCK_VALUE_LACK],
    ).then((json) => {
      const { after_sale_order } = json.response
      if (json.code === Status_Code.OUT_STOCK_VALUE_LACK) {
        const out_amount_ssu = _.find(
          this.sku_list,
          (it) => it?.sku_id! === json?.message?.detail?.sku_id!,
        )
        Tip.danger(
          t(`${out_amount_ssu?.name! || ''}申请退款数/申请退货数超出可退数量`),
        )
        throw Promise.reject(
          new Error(
            t(
              `${out_amount_ssu?.name! || ''}申请退款数/申请退货数超出可退数量`,
            ),
          ),
        )
      } else {
        this.clear()
        // 跳到售后单详情
        if (type === AfterSaleOrder_Status.STATUS_TO_REVIEWED) {
          Tip.success(t('创建成功'))
        } else {
          Tip.success(t('保存成功'))
        }
        history.replace(
          `/order/after_sales/after_sales_list/create?serial_no=${after_sale_order?.after_sale_order_id!}&type=draft`,
        )
        this.doRequest()
        this.fetchAfterSaleDraft(after_sale_order?.after_sale_order_id!)
        // }
      }
    })
  }

  /** 获取关联订单草稿列表 */
  getDraftDetailWithOrder(
    after_sale_order_details: AfterSaleOrderDetail[],
    order_details: any,
    _relation_info: any,
    _order: Order,
  ) {
    // 编辑 获取商品展示
    if (_relation_info?.sku_snaps) {
      // 需要展示的商品，可能相同的sku，可能不同
      const ssuDetail = _.map(order_details, (skuInfo) => {
        const originSkuData =
          _relation_info?.sku_snaps![
            `${skuInfo?.sku_id!}_${skuInfo?.sku_revision}`
          ]

        // debugger
        const unit_cal_info = skuInfo?.unit_cal_info
        const unitData = parseSku(_.cloneDeep(skuInfo))
        const outStockValue = this.getOutStackValue(skuInfo)
        return {
          value: skuInfo?.order_detail_id!,
          text: skuInfo?.sku_name!,
          category_name: getCategoryName(
            _relation_info.category,
            originSkuData.category_id,
          ),
          outstock_unit_id: unitData.outstock_unit_id,
          ssu_data: unitData,
          unit_cal_info,
          sales_price: outStockValue?.sales_price,
          amount: outStockValue?.amount,
          // ...skuInfo?.ssu!,
          ...originSkuData,
        }
      })
      this.sku_list = ssuDetail
    }

    this.refundDetailOnly = _.map(after_sale_order_details, (it) => {
      const _order_details = _.find(
        order_details,
        (item) => item.order_detail_id! === it.order_detail_id,
      )
      const originSkuData =
        _relation_info?.sku_snaps![
          `${_order_details?.sku_id!}_${_order_details?.sku_revision}`
        ]
      const unit_data = parseSku(_order_details!)
      const outStockValue = this.getOutStackValue(_order_details)
      const unit_cal_info = _order_details?.unit_cal_info
      const outstock_unit_id =
        _order_details?.outstock_unit_value_v2?.quantity?.unit_id

      this.setInitialSelectedSkuCount(_order_details?.order_detail_id, it.type)

      return {
        ...it,
        sku_id: _order_details?.sku_id!,
        sku_name: _.find(
          this.sku_list,
          (sku) =>
            sku?.value! ===
            _.find(
              order_details,
              (v) => v?.order_detail_id! === it?.order_detail_id!,
            )?.order_detail_id!,
        ),
        sales_price: outStockValue?.sales_price,
        amount: outStockValue?.amount,
        order_detail_id: it?.order_detail_id!,
        // ssu_base_unit_name: unit_data?.ssu_unit_parent_name!,
        // ssu_base_unit_id: unit_data?.ssu_base_unit_id!,
        // ssu_unit_name_id: _order_details?.ssu?.unit?.unit_id!,
        // ssu_unit_name: unit_data?.ssu_unit_name!,
        sale_ratio:
          unit_data && Object.keys(unit_data).length > 0
            ? `${unit_data?.ssu_unit_rate!}${unit_data?.ssu_unit_parent_name!}/${unit_data?.ssu_unit_name!}`
            : '',
        // category_name: _.map(
        //   _relation_info?.skus![_order_details?.sku_id!]?.category_infos,
        //   (category) => category?.category_name!,
        // ).join('/'),
        category_name: getCategoryName(
          _relation_info.category!,
          originSkuData.category_id!,
        ),
        fee_unit_name: unit_data?.fee_unit_name!,
        outstock_unit_name:
          unit_cal_info.unit_lists.find(
            (item) => item.unit_id === outstock_unit_id,
          )?.name || '-',
        last_operator_id:
          _relation_info?.group_users![it?.last_operator_id!]?.name!,
        last_operator_id_: it?.last_operator_id!,
        flag: 1,
        // 换算单位必需
        fee_unit_id: unit_data?.fee_unit_id!,
        unit_cal_info: unit_cal_info,
        base_unit_id: originSkuData.base_unit_id,
        second_base_unit_id: originSkuData.second_base_unit_id,
        second_base_unit_ratio: originSkuData.second_base_unit_ratio,
      }
    })
  }

  /** 获取不关联订单草稿详情 */
  getDraftDetailWithoutOrder(res: GetAfterSaleOrderResponse) {
    const {
      after_sale_order: {
        after_sale_order_details: { after_sale_order_details = [] },
        customer_id,
        creator_id,
      },
      relation_info: { sku_info, group_users, customers },
    } = res
    if (after_sale_order_details.length) {
      const { basic_prices, category_map, sku_map } = sku_info
      const newSkuList: SkuListOption[] = []
      this.headerDetail = {
        ...this.headerDetail,
        customers: customers[customer_id],
        creator_name: group_users[creator_id].username,
      }
      this.refundDetailOnly = _.map(after_sale_order_details, (detailItem) => {
        const { sku_id } = detailItem
        const basicPrice = _.find(
          basic_prices,
          (basicItem) => basicItem.sku_id === sku_id,
        )
        const {
          items: { basic_price_items = [] },
        } = basicPrice
        const sku = sku_map[sku_id!]
        const units = basic_price_items!.map((item) => {
          const target = sku?.units?.units?.find(
            (item2) => item2.unit_id === item.order_unit_id,
          )

          const parentUnitName = globalStore.unitList.find(
            (unit) => unit.value === (target?.parent_id || item.order_unit_id),
          )?.text

          const name = target
            ? `${target.name}(${target.rate}${parentUnitName})`
            : parentUnitName
          return {
            ...target,
            value: item.order_unit_id,
            text: name,
            name,
            sales_price: item.fee_unit_price?.val || 0,
          }
        })

        const unitSelected = _.find(
          units,
          (unitItem) => unitItem.value === detailItem.unit_id,
        )

        const newListItem = {
          ...sku,
          text: sku.name,
          value: sku_id,
          units,
          unit_id: detailItem.unit_id,
          fee_unit_id: detailItem.unit_id,
          order_detail_id: '0',
          order: '0',
          category_name: getCategoryName(
            sku_info.category_map,
            sku.category_id,
          ),

          sales_price: unitSelected?.sales_price,
          fee_unit_name: unitSelected?.name,
        }
        newSkuList.push(newListItem)

        this.setInitialSelectedSkuCount(sku_id, detailItem.type)

        return {
          ...detailItem,
          ...newListItem,
          sku_name: newListItem,
          last_operator_id: group_users![detailItem?.last_operator_id!]?.name!,
          flag: 1,
        }
      })
      this.sku_list = newSkuList
    }
  }

  // 获取草稿编辑数据
  fetchAfterSaleDraft(after_sale_order_id: string) {
    this.loading = true
    return GetAfterSaleOrder({ after_sale_order_id }).then((json) => {
      const { after_sale_order, relation_info } = json?.response!
      const { after_sale_order_details } =
        after_sale_order?.after_sale_order_details!

      const _relation_info = relation_info?.relation_info!

      this.withOrder = after_sale_order.order_id !== '0'

      this.summary = {
        ...this.summary,
        actual_refund_money: after_sale_order?.real_return_amount!,
        refundable_money: after_sale_order?.apply_return_amount!,
      }

      this.headerDetail = {
        ...this.headerDetail,
        after_sales_code: after_sale_order?.serial_no!,
        remark: after_sale_order?.remark!,
        create_time: after_sale_order?.create_time!,
        creator_name:
          _relation_info?.group_users![after_sale_order?.creator_id!]?.name!,
        creator_id: after_sale_order?.creator_id!,
        after_sale_order_id: after_sale_order?.after_sale_order_id!,
        after_status: after_sale_order?.status!,
        all_detail_num: after_sale_order?.all_detail_num!,
        completed_detail_num: after_sale_order?.completed_detail_num!,
        real_return_amount: after_sale_order?.real_return_amount!,
        apply_return_amount: after_sale_order?.apply_return_amount!,
      }

      let order_details: any[] | undefined = []

      if (this.withOrder) {
        const _order = relation_info?.orders![after_sale_order?.order_id!]
        order_details = _order?.order_details!.order_details

        this.summary = {
          ...this.summary,
          order_money: _order?.order_price!,
          stock_out_money: _order?.outstock_price!,
        }

        this.headerDetail = {
          ...this.headerDetail,
          customers: _relation_info?.customers![_order?.receive_customer_id!],
          order_code: _order?.serial_no!,
          order_id: _order?.order_id!,
          order_code_popover: {
            create_time: _order?.create_time!,
            received_time: _order?.receive_time!,
            state: _order?.state!,
            driver_id: _order?.driver_id!,
            addresses: {
              addresses: _order?.addresses?.addresses!,
            },
            route:
              relation_info?.routes![
                relation_info?.customer_routes![_order?.receive_customer_id!]
              ]?.route_name!,
          },
        }
        this.getDraftDetailWithOrder(
          json.response.after_sale_order!.after_sale_order_details!
            .after_sale_order_details!,
          order_details,
          _relation_info,
          _order as Order,
        )
      } else {
        this.getDraftDetailWithoutOrder(json.response)
      }

      // 判断条件
      this.list_type = [
        ...new Set(_.map(after_sale_order_details, (it) => it.type)),
      ]

      this.loading = false
      return json.response
    })
  }

  // 从草稿过去提交
  UpdateAfterSaleOrder(type: AfterSaleOrder_Status) {
    const { order_id, remark, after_sales_code, after_sale_order_id } =
      this.headerDetail
    const { stock_out_money, actual_refund_money } = this.summary

    const _refundDetailOnly = _.map(this.refundDetailOnly, (item) => {
      return {
        ..._.pick(item, [
          'after_sale_order_detail_id',
          'after_sale_order_id',
          'apply_return_value',
          'apply_return_amount',
          'order_detail_id',
          'supplier_id',
          'department_blame_name',
          'department_to_name',
          'reason',
          'method',
          'remark',
          'type',
          'flag',
        ]),
        last_operator_id: item.last_operator_id_!,
      }
    })

    const HAVE_FLAG_ONE = _.filter(_refundDetailOnly, (item) => {
      return item.flag === 1
    })
    if (HAVE_FLAG_ONE.length) {
      const refund_only = _.filter(
        HAVE_FLAG_ONE,
        (it) => it.type === AfterSaleOrderDetail_Type.TYPE_REFUND,
      )

      let apply_total_amount = 0

      if (refund_only.length) {
        const is_apply_quantity_1 = _.map(
          refund_only,
          (item) => item.apply_return_value?.input?.quantity!,
        )
        const is_apply_price_1 = _.map(
          refund_only,
          (item) => item.apply_return_value?.input?.price!,
        )

        _.each(refund_only, (it) => {
          const { input, calculate } = it.apply_return_value

          apply_total_amount =
            apply_total_amount +
            Number(
              toFixedOrder(
                Big(toBasicUnit(input?.quantity || '0', it, 'quantity')).times(
                  toBasicUnit(calculate?.price || '0', it, 'price'),
                ),
              ),
            )
        })

        if ([...is_apply_quantity_1].includes('')) {
          Tip.danger(t('请填写申请退款数'))
          return
        }
        if ([...is_apply_price_1].includes('')) {
          Tip.danger(t('请填写申请单价'))
          return
        }
      }

      if (
        Number(Big(apply_total_amount).toFixed(2)) >
        Number(
          Big(Number(stock_out_money))
            .minus(Number(actual_refund_money))
            .toFixed(2),
        )
      ) {
        Tip.danger(t('申请退款总金额已超，请调整申请明细'))
        return
      }
    } else {
      Tip.danger(t('请填写售后明细'))
      return
    }

    const after_sale_order_details: AfterSaleOrderDetail[] = _.map(
      HAVE_FLAG_ONE,
      (item) => _.omit(item, ['flag']),
    )

    return UpdateAfterSaleOrder(
      {
        after_sale_order: {
          after_sale_order_id: after_sale_order_id!,
          order_id: order_id || '0',
          status: type,
          remark,
          after_sale_order_details: {
            after_sale_order_details,
          },
        },
      },
      [Status_Code.OUT_STOCK_VALUE_LACK],
    ).then((json) => {
      const { after_sale_order } = json.response
      if (json.code === Status_Code.OUT_STOCK_VALUE_LACK) {
        const out_amount_ssu = _.find(
          this.sku_list,
          (it) => it?.sku_id! === json?.message?.detail?.sku_id!,
        )
        Tip.danger(
          t(`${out_amount_ssu?.name! || ''}申请退款数/申请退货数超出可退数量`),
        )
        throw Promise.reject(
          new Error(
            t(
              `${out_amount_ssu?.name! || ''}申请退款数/申请退货数超出可退数量`,
            ),
          ),
        )
      } else {
        this.clear()
        // 跳到售后单详情
        if (type === AfterSaleOrder_Status.STATUS_TO_REVIEWED) {
          Tip.success(t('提交成功'))
        } else {
          Tip.success(t('保存成功'))
        }

        this.doRequest()
        this.fetchAfterSaleDraft(after_sale_order?.after_sale_order_id!)
      }
      return json.response
    })
  }

  // 清理数据
  clear() {
    this.headerDetail = {
      ...defaultHeaderDetail,
    }
    // 仅退款明细
    this.refundDetailOnly = [
      {
        ...initRefundOnlyList,
        type: globalStore.isLite
          ? AfterSaleOrderDetail_Type.TYPE_REFUND
          : AfterSaleOrderDetail_Type.TYPE_REFUND_RETURN,
      },
    ]

    this.sku_list = []
    this.selectedSkuCount = {}
  }

  doRequest = _.noop

  setDoRequest(func: any) {
    this.doRequest = func
  }
}

export default new Store()
