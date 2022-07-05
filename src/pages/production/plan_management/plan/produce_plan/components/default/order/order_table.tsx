import React, { FC, Key } from 'react'
import SelectTable, { Pagination } from '@/common/components/select_table'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import { DetailList, ListOrderDetail } from 'gm_api/src/order'
import moment from 'moment'
import _ from 'lodash'
import { Menu, MenuPeriodGroup, Quotation_Type } from 'gm_api/src/merchandise'
import { App_Type, Filters_Bool } from 'gm_api/src/common'
import { Customer } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import OrderFilter from '@/pages/production/plan_management/plan/produce_plan/components/default/order/order_filter'

interface OrderPlanType extends DetailList {
  customerInfo?: Customer
  menuInfo?: Menu
  menuPeriodInfo?: MenuPeriodGroup
  quotationName?: string
  orderDetailId: string
  skuName: string
}

interface Props {
  onSelect: (ids: Key[]) => void
}

const OrderTable: FC<Props> = ({ onSelect }) => {
  const handleFetchList = (paging: Pagination, params: any) => {
    const param = params || {
      common_list_order: {
        order_time_from_time: '' + moment().startOf('day'),
        order_time_to_time: '' + moment().endOf('day'),
      },
    }
    return ListOrderDetail({
      ...param,
      is_create_production_task: Filters_Bool.FALSE,
      relation_info: {
        need_customer_info: true,
        need_menu_period_group: true,
        need_quotation_info: true,
        need_menu_info: true,
        need_sku_info: true,
      },
      paging,
    }).then((res) => {
      const { details, paging, relation_info } = res.response
      const data = _.map(details, (v) => {
        const { sku_name, order_detail_id } = v.detail!
        const { menu_id, menu_period_group_id, receive_customer_id } = v.order!
        const {
          quotations,
          menu_relation,
          customers,
          menu_period_groups,
          customer_quotation_relation,
          parent_child_quotation_id_map,
        } = relation_info!
        const quotation = _.find(quotations, (item) => {
          const isValid = (
            customer_quotation_relation?.[receive_customer_id!]?.values || []
          ).includes(item.quotation_id)
          const isValidStatus = [
            Quotation_Type.WITHOUT_TIME,
            Quotation_Type.PERIODIC,
          ].includes(item.type)
          return isValid && isValidStatus
        })
        const childQuotation = _.get(
          quotations,
          _.get(
            parent_child_quotation_id_map || {},
            quotation?.quotation_id || '',
          ),
        )
        return {
          ...v,
          orderDetailId: order_detail_id,
          skuName: sku_name!,
          customerInfo: customers?.[receive_customer_id!],
          menuInfo: menu_relation?.[menu_id!],
          menuPeriodInfo: menu_period_groups?.[menu_period_group_id!],
          quotationName: _.filter(
            [quotation?.inner_name, childQuotation?.inner_name],
            (v) => !_.isEmpty(v),
          ).join('-'),
        }
      })
      return {
        list: data,
        count: paging.count,
      }
    })
  }

  const columns: ColumnType<OrderPlanType>[] = [
    {
      title: t('商品名'),
      key: 'skuName',
      dataIndex: 'skuName',
      render: (text) => text,
    },
    {
      title: t('商户名'),
      render: (_, d) => {
        const { name, customized_code } = d.customerInfo!
        return ` ${name} ( ${customized_code}）`
      },
    },
    {
      title: (
        <div>
          <div>{t('下单数')}</div>
          <div>{t('（基本单位）')}</div>
        </div>
      ),
      render: (_, d) => {
        const { val, unit_id } = d?.detail?.order_unit_value_v2?.quantity!
        return val + globalStore.getUnitName(unit_id)
      },
    },
    {
      title: t('报价单/菜谱'),
      render: (_, d) =>
        d.order?.app_type === App_Type.TYPE_ESHOP
          ? d.menuInfo?.inner_name || '-'
          : d.quotationName || '-',
    },
    { title: t('餐次'), render: (_, d) => d.menuPeriodInfo?.name || '-' },
    {
      title: t('下单日期'),
      render: (_, d) =>
        moment(+d.order?.order_time!).format('YYYY-MM-DD HH:mm'),
    },
    { title: t('订单编号'), render: (_, d) => d.order?.serial_no },
  ]

  const handleSelect = (idS: Key[]) => {
    onSelect(idS)
  }

  return (
    <SelectTable<OrderPlanType, any>
      rowKey='orderDetailId'
      selectedKey='skuName'
      columns={columns}
      onSearch={handleFetchList}
      onSelect={handleSelect}
      FilterComponent={OrderFilter}
    />
  )
}

export default OrderTable
