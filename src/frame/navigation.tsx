import { isProduction } from '@/common/util'
import { processNavConfig } from '@/frame/util'
import company_setting from '@/img/company_setting.png'
import operator_setting from '@/img/operater_setting.png'
import store_construction from '@/img/store_construction.png'
import template_setting from '@/img/template_setting.png'
import globalStore from '@/stores/global'
import SVG_cg from '@/svg/nav/caigou.svg'
import SVG_cg_active from '@/svg/nav/caigou_cg_active.svg'
import SVG_kh from '@/svg/nav/customer.svg'
import SVG_kh_active from '@/svg/nav/customer_active.svg'
import SVG_ps from '@/svg/nav/delivery.svg'
import SVG_ps_active from '@/svg/nav/delivery_active.svg'
import SVG_cw from '@/svg/nav/finance.svg'
import SVG_cw_active from '@/svg/nav/finance_active.svg'
import SVG_iot from '@/svg/nav/iot.svg'
import SVG_iot_active from '@/svg/nav/iot_active.svg'
import SVG_dd from '@/svg/nav/order.svg'
import SVG_dd_active from '@/svg/nav/order_active.svg'
import SVG_sc from '@/svg/nav/production.svg'
import SVG_sc_active from '@/svg/nav/production_active.svg'
import SVG_report from '@/svg/nav/report.svg'
import SVG_report_active from '@/svg/nav/report_active.svg'
import SVG_fj from '@/svg/nav/sorting.svg'
import SVG_fj_active from '@/svg/nav/sorting_active.svg'
import SVG_sp from '@/svg/nav/sp_cg.svg'
import SVG_sp_active from '@/svg/nav/sp_cg_active.svg'
import SVG_sz from '@/svg/nav/sz.svg'
import SVG_sz_active from '@/svg/nav/sz_active.svg'
import SVG_jxc from '@/svg/nav/warehousing.svg'
import SVG_jxc_active from '@/svg/nav/warehousing_active.svg'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import React from 'react'
import { NavRouteMapType } from './type'

let _cache: ReturnType<typeof processNavConfig>

function initNavConfig() {
  const navConfig = [
    {
      link: '/merchandise',
      name: t('商品'),
      icon: <SVG_sp />,
      iconActive: <SVG_sp_active />,
      sub: [
        {
          name: t('商品管理'),
          link: '/merchandise/manage',
          sub: [
            {
              link: '/merchandise/manage/merchandise_list',
              name: t('商品列表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_NOT_PACKAGE_SKU_SSU,
              ),
              toCreate: {
                tip: '新建商品',
                href: '/merchandise/manage/merchandise_list/create',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_CREATE_NOT_PACKAGE_SKU_SSU,
                ),
              },
            },
            {
              link: '/merchandise/manage/combine',
              name: t('组合商品'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_COMBINE_SSU,
              ),
            },
            {
              link: '/merchandise/manage/wrapper',
              name: t('商品包材'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_PACKAGE_SKU_SSU,
              ),
            },
            // {
            //   link: '/merchandise/manage/new_product',
            //   name: t('新品需求'),
            // },
          ],
        },
        {
          name: t('价格管理'),
          link: '/merchandise/price_manage',
          sub: [
            {
              link: '/merchandise/price_manage/customer_quotation',
              name: t('客户报价单'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_QUOTATION,
              ),
              toCreate: {
                tip: '新建报价单',
                href: '/merchandise/price_manage/customer_quotation/create',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_CREATE_QUOTATION,
                ),
              },
            },
            // {
            //   link: '/merchandise/price_manage/agreement',
            //   name: t('客户协议价'),
            // },
            // {
            //   link: '/merchandise/price_manage/change',
            //   name: t('改价记录'),
            // },
            // {
            //   link: '/merchandise/price_manage/query',
            //   name: t('询价记录'),
            // },
          ],
        },
        {
          name: t('商品设置'),
          link: '/merchandise/merchandise_setting',
          sub: [
            {
              link: '/merchandise/merchandise_setting/category',
              name: t('商品分类'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_CATEGORY,
              ),
            },
            {
              link: '/merchandise/merchandise_setting/tax',
              name: t('商品税率'),
            },
            // {
            //   link: '/merchandise/price_manage/agreement',
            //   name: t('客户协议价'),
            // },
            // {
            //   link: '/merchandise/price_manage/change',
            //   name: t('改价记录'),
            // },
            // {
            //   link: '/merchandise/price_manage/query',
            //   name: t('询价记录'),
            // },
          ],
        },
      ],
    },
    {
      link: '/order',
      name: t('订单'),
      icon: <SVG_dd />,
      iconActive: <SVG_dd_active />,
      sub: [
        {
          name: t('订单管理'),
          link: '/order/order_manage',
          sub: [
            {
              link: '/order/order_manage/list',
              name: t('订单列表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ORDER_VIEW_ORDER,
              ),
              toCreate: {
                tip: '新建订单',
                href: '/order/order_manage/create',
              },
            },
            // {
            //   link: '/order/order_manage/create',
            //   name: t('新建订单'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ORDER_CREATE_ORDER,
            //   ),
            // },
            // {
            //   link: '/order/order_manage/repair',
            //   name: t('补录订单'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ORDER_AMEND_ORDER,
            //   ),
            // },
            {
              link: '/order/order_manage/set_of_accounts_data',
              name: t('套账数据'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
              ),
            },
            {
              link: '/order/order_manage/menu_create',
              name: t('菜谱下单'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ORDER_CREATE_ORDER,
              ),
            },
          ],
        },
        {
          name: t('售后'),
          link: '/order/after_sales',
          sub: [
            {
              link: '/order/after_sales/after_sales_list',
              name: t('售后列表'),
            },
            {
              link: '/order/after_sales/pick_up_task',
              name: t('取货任务'),
            },
          ],
        },
        {
          name: t('学校订单'),
          link: '/order/group_meal',
          sub: [
            {
              link: '/order/group_meal/prepay_order',
              name: t('预付订单'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ESHOP_VIEW_ADVANCED_ORDER,
              ),
            },
            // {
            //   link: '/order/group_meal/student',
            //   name: t('学生订单'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ORDER_VIEW_ESHOP_STUDENT_ORDER,
            //   ),
            // },
            // {
            //   link: '/order/group_meal/staff',
            //   name: t('职工订单'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ORDER_VIEW_ESHOP_STUFF_ORDER,
            //   ),
            // },
            {
              link: '/order/group_meal/leave',
              name: t('请假管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ESHOP_VIEW_LEAVE_ORDER,
              ),
            },
          ],
        },
        // {
        //   name: t('团餐订单'),
        //   link: '/order/group_meal',
        //   sub: [
        //     {
        //       link: '/order/group_meal/student',
        //       name: t('学生订单'),
        //       disabled: !globalStore.hasPermission(
        //         Permission.PERMISSION_ORDER_VIEW_ESHOP_STUDENT_ORDER,
        //       ),
        //     },
        //     {
        //       link: '/order/group_meal/staff',
        //       name: t('职工订单'),
        //       disabled: !globalStore.hasPermission(
        //         Permission.PERMISSION_ORDER_VIEW_ESHOP_STUFF_ORDER,
        //       ),
        //     },
        //     {
        //       link: '/order/group_meal/leave',
        //       name: t('请假管理'),
        //       disabled: !globalStore.hasPermission(
        //         Permission.PERMISSION_ORDER_VIEW_LEAVE_APPLICATION,
        //       ),
        //     },
        //   ],
        // },
      ],
    },
    {
      link: '/purchase',
      name: t('采购'),
      icon: <SVG_cg />,
      iconActive: <SVG_cg_active />,
      sub: [
        {
          name: t('采购管理'),
          link: '/purchase/manage',
          sub: [
            {
              link: '/purchase/manage/task',
              name: t('采购计划'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PURCHASE_VIEW_PURCHASE_TASK,
              ),
              toCreate: {
                tip: '新建采购计划',
                href: '/purchase/manage/task/create_specs',
              },
            },
            {
              link: '/purchase/manage/bills',
              name: t('采购单据'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PURCHASE_VIEW_PURCHASE_SHEET,
              ),
              toCreate: {
                tip: '新建采购单据',
                href: '/purchase/manage/bills/create',
              },
            },
            {
              link: '/purchase/manage/information',
              name: t('采购员'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_PURCHASER,
              ),
            },
            // {
            //   link: '/purchase/manage/analysis',
            //   name: t('询价记录'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_PURCHASE_VIEW_INQUIRY_PRICE,
            //   ),
            // },
            {
              link: '/purchase/manage/agreement_price',
              name: t('采购协议价'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PURCHASE_VIEW_AGREEMENT_PRICE,
              ),
              toCreate: {
                tip: '新建采购协议价',
                href: '/purchase/manage/agreement_price/sheet_detail',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PURCHASE_CREATE_AGREEMENT_PRICE,
                ),
              },
            },
          ],
        },
        {
          name: t('采购规则'),
          link: '/purchase/purchase_rules',
          sub: [
            {
              link: '/purchase/purchase_rules/rules',
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PURCHASE_VIEW_PURCHASE_TASK_RULE,
              ),
              name: t('采购计划规则'),
            },
          ],
        },
        {
          name: t('供应商管理'),
          link: '/purchase/supplier_manage',
          sub: [
            {
              link: '/purchase/supplier_manage/supplier_message',
              name: t('供应商信息'),
            },
          ],
        },
      ],
    },
    {
      link: '/sales_invoicing',
      name: t('仓储'),
      icon: <SVG_jxc />,
      iconActive: <SVG_jxc_active />,
      sub: [
        {
          name: t('入库管理'),
          link: '/sales_invoicing/purchase',
          sub: [
            {
              link: '/sales_invoicing/purchase/stock_in',
              name: t('采购入库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_PURCHASE_IN_SHEET,
              ),
              toCreate: {
                tip: '新建采购入库单',
                href: '/sales_invoicing/purchase/stock_in/create',
              },
            },
            {
              link: '/sales_invoicing/produce/produce_stock_in',
              name: t('生产入库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_PRODUCT_IN,
              ),
              toCreate: {
                tip: '新建生产入库单',
                href: '/sales_invoicing/produce/produce_stock_in/create',
              },
            },
            {
              link: '/sales_invoicing/produce/refund_stock_in',
              name: t('退料入库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_MATERIAL_IN_250,
              ),
              toCreate: {
                tip: '新建退料入库单',
                href: '/sales_invoicing/produce/refund_stock_in/create',
              },
            },
            {
              link: '/sales_invoicing/sales/stock_in',
              name: t('销售退货入库'),
            },
            {
              link: '/sales_invoicing/other_stock/stock_in',
              name: t('其他入库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_OTHER_IN,
              ),
              toCreate: {
                tip: '新建其他入库单',
                href: '/sales_invoicing/other_stock/stock_in/create',
              },
            },
          ],
        },
        {
          name: t('出库管理'),
          link: '/sales_invoicing/sales',
          sub: [
            {
              link: '/sales_invoicing/sales/stock_out',
              name: t('销售出库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_SALE_OUT_SHEET,
              ),
              toCreate: {
                tip: '新建销售出库单',
                href: '/sales_invoicing/sales/stock_out/create',
              },
            },
            {
              link: '/sales_invoicing/produce/picking_stock_out',
              name: t('领料出库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_MATERIAL_OUT,
              ),
              toCreate: {
                tip: '新建领料出库单',
                href: '/sales_invoicing/produce/picking_stock_out/create',
              },
            },
            {
              link: '/sales_invoicing/purchase/stock_out',
              name: t('采购退货出库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_REFUND_OUT_SHEET,
              ),
              toCreate: {
                tip: '新建采购退货出库单',
                href: '/sales_invoicing/purchase/stock_out/create',
              },
            },
            {
              link: '/sales_invoicing/other_stock/stock_out',
              name: t('其他出库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_OTHER_OUT,
              ),
              toCreate: {
                tip: '新建其它出库单',
                href: '/sales_invoicing/other_stock/stock_out/create',
              },
            },
          ],
        },
        {
          name: t('调拨管理'),
          link: '/sales_invoicing/allocation_invertory',
          disabled: !globalStore.isOpenMultWarehouse,
          sub: [
            {
              link: '/sales_invoicing/allocation_inventory/allocation_order',
              name: t('调拨申请'),
              toCreate: {
                tip: '新建调拨申请',
                href: '/sales_invoicing/allocation_inventory/allocation_order/create',
              },
            },
            {
              link: '/sales_invoicing/allocation_inventory/allocation_stock_in',
              name: t('调拨入库单'),
            },
            {
              link: '/sales_invoicing/allocation_inventory/allocation_stock_out',
              name: t('调拨出库单'),
            },
            {
              link: '/sales_invoicing/allocation_inventory/allocation_loss',
              name: t('调拨损耗'),
            },
          ],
        },
        // {
        //   name: t('生产库存'),
        //   link: '/sales_invoicing/produce',
        //   sub: [],
        // },
        // {
        //   name: t('其他库存'),
        //   link: '/sales_invoicing/other_stock',
        //   sub: [],
        // },
        {
          name: t('盘点管理'),
          link: '/sales_invoicing/inventory_check',
          sub: [
            {
              link: '/sales_invoicing/inventory_check/manage',
              name: t('库存盘点'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_INVENTORY_SHEET,
              ),
              toCreate: {
                tip: '新建盘点单',
                href: '/sales_invoicing/inventory_check/manage/create',
              },
            },
            {
              link: '/sales_invoicing/inventory_check/transfer',
              name: t('仓内移库'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_INVENTORY_SHEET,
              ),
              toCreate: {
                tip: '新建移库单',
                href: '/sales_invoicing/inventory_check/transfer/create',
              },
            },
          ],
        },
        {
          name: t('库存账表'),
          link: '/sales_invoicing/inventory_account',
          sub: [
            {
              link: '/sales_invoicing/inventory_account/stock_overview',
              name: t('库存总览'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_STOCK_LIST,
              ),
            },
            {
              link: '/sales_invoicing/inventory_account/cost_value',
              name: t('货值成本表'),
            },
            {
              link: '/sales_invoicing/inventory_account/stock_in_details',
              name: t('入库明细'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_IN_STOCK_LOG,
              ),
            },
            {
              link: '/sales_invoicing/inventory_account/stock_out_details',
              name: t('出库明细'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_OUT_STOCK_LOG,
              ),
            },

            {
              link: '/sales_invoicing/inventory_account/commodity_ledger',
              name: t('商品台账'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_CHANGE_STOCK_LOG,
              ),
            },
            {
              link: '/sales_invoicing/other_stock/value_adjustment',
              name: t('货值调整单'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_VIEW_ADJUST_SHEET,
              ),
            },
          ],
        },
        {
          name: t('周转物管理'),
          link: '/sales_invoicing/turnover',
          sub: [
            {
              link: '/sales_invoicing/turnover/customer_loan_log',
              name: t('客户借出记录'),
            },
            {
              link: '/sales_invoicing/turnover/loan_and_return_log',
              name: t('周转物借出归还'),
            },
          ],
        },
        {
          name: t('车间真实用料'),
          link: '/sales_invoicing/processors',
          sub: [
            {
              link: '/sales_invoicing/processors/processor_check',
              name: t('车间商品盘点'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_PROCESSOR_CHECK,
              ),
            },
            {
              link: '/sales_invoicing/processors/processor_statistics',
              name: t('车间用料成本表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_PROCESSOR_STATISTICS,
              ),
            },
          ],
        },
        {
          name: t('仓库管理'),
          link: '/sales_invoicing/warehousing_data',
          sub: [
            {
              link: '/sales_invoicing/warehouse/warehouse_info',
              name: t('仓库信息'),
              disabled: !globalStore.isOpenMultWarehouse,
              // disabled: !globalStore.hasPermission(
              //   Permission.PERMISSION_INVENTORY_PROCESSOR_CHECK,
              // ),
            },
            {
              link: '/sales_invoicing/warehousing_data/shelf_manage',
              name: t('货位设置'),
            },
          ],
        },
        // {
        //   name: t('仓库信息'),
        //   link: '/sales_invoicing/warehouse',
        //   // disabled: !globalStore.isOpenMultWarehouse,
        //   sub: [
        //     // {
        //     //   link: '/sales_invoicing/warehouse/in_stock',
        //     //   name: t('库存查询'),
        //     //   disabled: !globalStore.hasPermission(
        //     //     Permission.PERMISSION_INVENTORY_PROCESSOR_STATISTICS,
        //     //   ),
        //     // },
        //   ],
        // },
      ],
    },
    {
      link: '/production',
      name: t('生产'),
      icon: <SVG_sc />,
      iconActive: <SVG_sc_active />,
      sub: [
        {
          name: t('菜谱管理'),
          link: '/production/menu_manage/',
          sub: [
            {
              link: '/production/menu_manage/menu_list',
              name: t('学生餐菜谱管理'),
              disabled:
                isProduction ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_VIEW_MENU,
                ),
              toCreate: {
                tip: '新建菜谱',
                href: '/production/menu_manage/menu_list/create_menu',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_CREATE_MENU,
                ),
              },
            },
            {
              link: '/production/menu_manage/student_list',
              name: t('学生餐餐次管理'),
              disabled:
                isProduction ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_VIEW_ESHOP_MENU_PERIOD,
                ),
            },
            // {
            //   link: '/menu/menu_manage/menu_list',
            //   name: t('学生餐菜谱设置'),
            //   disabled:
            //     isProduction ||
            //     !globalStore.hasPermission(
            //       Permission.PERMISSION_MERCHANDISE_VIEW_MENU,
            //     ),
            // },
            {
              link: '/production/menu_manage/vegetables_menu_list',
              name: t('净菜菜谱管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_CLEANFOOD_MENU,
              ),
              toCreate: {
                tip: '新建菜谱',
                href: '/production/menu_manage/vegetables_menu_list/create_quotation',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_CREATE_CLEANFOOD_MENU,
                ),
              },
            },
            {
              link: '/production/menu_manage/list',
              name: t('菜谱餐次管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_VIEW_MENU_PERIOD,
              ),
            },
          ],
        },
        {
          name: t('计划管理'),
          link: '/production/plan_management',
          sub: [
            {
              link: '/production/plan_management/plan',
              name: t('生产计划'),
              disabled:
                !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_VIEW_PRODUCTION_INFO,
                ) &&
                !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_VIEW_PACK_INFO,
                ),
            },
          ],
        },
        {
          name: t('BOM管理'),
          link: '/production/bom_management',
          sub: [
            {
              name: t('生产BOM管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_BOM,
              ),
              link: '/production/bom_management/produce',
              toCreate: {
                tip: '新建生产BOM',
                href: '/production/bom_management/produce/create?type=3',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_CREATE_BOM,
                ),
              },
            },
            {
              name: t('包装BOM管理'),
              link: '/production/bom_management/pack',
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_PACK_BOM,
              ),
              toCreate: {
                tip: '新建包装BOM',
                href: '/production/bom_management/produce/create?type=2',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_CREATE_PACK_BOM,
                ),
              },
            },
          ],
        },
        {
          name: t('生产设置'),
          link: '/production/processing_data',
          sub: [
            {
              link: '/production/processing_data/factory_model',
              name: t('工厂模型'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_PROCESSOR,
              ),
            },
            {
              link: '/production/processing_data/process_manage',
              name: t('工序管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_PROCESS,
              ),
              toCreate: {
                tip: '新建工序',
                href: '/production/processing_data/process_manage/create',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_CREATE_PROCESS,
                ),
              },
            },
          ],
        },
        {
          name: t('生产工具'),
          link: '/production/production_tools',
          sub: [
            {
              link: '/production/production_tools/print_box_label',
              name: t('打印箱签'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_PRINT_BOX_LABLE,
              ),
            },
          ],
        },
      ],
    },
    {
      link: '/sorting',
      name: t('分拣'),
      icon: <SVG_fj />,
      iconActive: <SVG_fj_active />,
      sub: [
        {
          name: t('分拣管理'),
          link: '/sorting',
          sub: [
            {
              link: '/sorting/schedule',
              name: t('分拣进度'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_SORTING_VIEW_SORTING_INFO,
              ),
            },
            {
              link: '/sorting/detail',
              name: t('分拣明细'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_SORTING_VIEW_SORTING_TASK,
              ),
            },
            // {
            //   link: '/sorting/method',
            //   name: t('分拣方式'),
            // },
          ],
        },
      ],
    },
    {
      link: '/delivery',
      name: t('配送'),
      icon: <SVG_ps />,
      iconActive: <SVG_ps_active />,
      sub: [
        {
          name: t('配送管理'),
          link: '/delivery',
          sub: [
            {
              link: '/delivery/delivery_task',
              name: t('配送任务'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_DELIVERY_VIEW_TASK,
              ),
            },
            {
              link: '/delivery/driver_management',
              name: t('司机管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_DRIVER,
              ),
            },
            {
              link: '/delivery/route_management',
              name: t('线路管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_DELIVERY_VIEW_ROUTE,
              ),
            },
          ],
        },
      ],
    },
    {
      link: '/customer',
      name: t('客户'),
      icon: <SVG_kh />,
      iconActive: <SVG_kh_active />,
      sub: [
        {
          name: t('客户管理'),
          link: '/customer/society',
          sub: [
            {
              link: '/customer/society/catering_customer_management',
              name: t('客户列表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_CUSTOMER,
              ),
              toCreate: {
                tip: '新建客户',
                href: '/customer/society/catering_customer_management/detail?type=createParentCustomer',
              },
            },
            {
              link: '/customer/society/customer_budget_management',
              name: t('客户预算管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_CUSTOMER,
              ),
            },
            {
              link: '/customer/society/menu_calendar',
              name: t('客户就餐日历'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_INVITATION_CODE,
              ),
            },
            {
              link: '/customer/society/invitation_code',
              name: t('客户邀请码'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_INVITATION_CODE,
              ),
            },
          ],
        },
        {
          name: t('学校管理'),
          link: '/customer/school',
          sub: [
            {
              link: '/customer/school/class_management',
              name: t('班级管理'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_SCHOOL_CLASS,
              ),
            },
            // {
            //   link: '/customer/school/student_info_management',
            //   name: t('学生管理'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ENTERPRISE_VIEW_STUDENT,
            //   ),
            // },
            // {
            //   link: '/customer/school/employee_info_management',
            //   name: t('职工管理'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ENTERPRISE_VIEW_STUFF,
            //   ),
            // },
            // {
            //   link: '/customer/school/term_management',
            //   name: t('学期管理'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ENTERPRISE_VIEW_STUFF,
            //   ),
            // },
            // {
            //   link: '/customer/school/invitation_code',
            //   name: t('邀请码'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ENTERPRISE_VIEW_ESHOP_INVITATION_CODE,
            //   ),
            // },
            {
              link: '/customer/school/service_management',
              name: t('运营管理'),
            },
          ],
        },
      ],
    },
    {
      link: '/financial_manage',
      name: t('财务'),
      icon: <SVG_cw />,
      iconActive: <SVG_cw_active />,
      sub: [
        {
          name: t('客户结算'),
          link: '/financial_manage/merchant_settlement',
          sub: [
            // {
            //   link: '/financial_manage/merchant_settlement/merchant_settlement',
            //   name: t('商户结算'),
            // },
            // {
            //   link: '/financial_manage/merchant_settlement/merchant_balance',
            //   name: t('商户余额'),
            // }
            {
              link: '/financial_manage/settlement_manage/customer_bill',
              name: t('客户账单'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_FINANCE_CUSTOMER_BILL,
              ),
            },
            {
              link: '/financial_manage/settlement_manage/customer_settlement',
              name: t('客户结款'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_FINANCE_CUSTOMER_SETTLE,
              ),
            },
            {
              link: '/financial_manage/settlement_manage/settlement_voucher',
              name: t('结款凭证'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_FINANCE_SETTLEMENT_VOUCHER,
              ),
            },
          ],
        },
        {
          name: t('学生餐结算'),
          link: '/financial_manage/meals_settlement',
          sub: [
            // 按产品张国祥的要求先屏蔽学校对账单页面
            // {
            //   link: '/financial_manage/meals_settlement/meals_settlement',
            //   name: t('学校对账单'),
            //   disabled: !globalStore.hasPermission(
            //     Permission.PERMISSION_ANALYTICS_VIEW_MENU_SETTLEMENT,
            //   ),
            // },
          ],
        },
        {
          name: t('供应商结算'),
          link: '/financial_manage/supplier_settlement',
          sub: [
            {
              link: '/financial_manage/supplier_settlement/supplier_settlement',
              name: t('供应商结算'),
            },
          ],
        },
        {
          name: t('结算'),
          link: '/settlement',
          sub: [
            {
              link: '/settlement/cash_settlement',
              name: t('流水提现'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_AINONG_SETTLE,
              ),
            },
          ],
        },
        {
          name: t('结转'),
          link: '/financial_manage/fiscal_period_settlement',
          sub: [
            {
              link: '/financial_manage/fiscal_period_settlement/fiscal_period_settlement',
              name: t('库存结转'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_FISCAL_INVENTORY_PERIOD,
              ),
            },
          ],
        },
      ],
    },
    {
      link: '/report',
      name: t('报表'),
      icon: <SVG_report />,
      iconActive: <SVG_report_active />,
      sub: [
        {
          name: t('售后报表'),
          link: '/report/after_sale',
          sub: [
            {
              link: '/report/after_sale/after_sale_report',
              name: t('售后报表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_AFTER_SALES_REPORT,
              ),
            },
          ],
        },
        {
          name: t('销售报表'),
          link: '/report/sale',
          sub: [
            {
              link: '/report/sale/comprehensive_sale_situation',
              name: t('综合销售情况'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_COMPREHENSIVE_SALES,
              ),
            },
            {
              link: '/report/sale/merchandise_sale_situation',
              name: t('商品销售情况'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_COMMODITY_SALES,
              ),
            },
            {
              link: '/report/sale/customer_sale_situation',
              name: t('客户销售情况'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_CUSTOMER_SALES,
              ),
            },
            {
              link: '/report/sale/customer_merchandise_sale_situation',
              name: t('客户商品销售情况'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_CUSTOMER_PRODUCT_SALES,
              ),
            },
            {
              link: '/report/sale/category_sale_situation',
              name: t('分类销售情况'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_CLASSIFIED_SALES,
              ),
            },
          ],
        },
        {
          name: t('生产报表'),
          link: '/report/production',
          sub: [
            {
              link: '/report/production/production_report',
              name: t('生产报表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_PRODUCTION_REPORT,
              ),
            },
            {
              link: '/report/production/process_yield',
              name: t('出成率'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_CHECK_THE_YIELD,
              ),
            },
            {
              link: '/report/production/pack_report',
              name: t('包装报表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_PACKAGING_REPORT,
              ),
            },
          ],
        },
        {
          name: t('财务报表'),
          link: '/report/financial_statement',
          sub: [
            {
              link: '/report/financial_statement/customer_statement',
              name: t('应收统计表'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_REPORT_VIEW_RECEIVABLE_STATISTICS,
              ),
            },
            {
              link: '/report/financial_statement/supplier_statement',
              name: t('应付统计表'),
              disabled:
                globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_REPORT_VIEW_PAYABLE_STATISTICS,
                ),
            },
            {
              link: '/report/financial_statement/supplier_statement_lite',
              name: t('应付统计表'),
              disabled:
                !globalStore.isLite ||
                !globalStore.hasPermission(
                  Permission.PERMISSION_REPORT_VIEW_PAYABLE_STATISTICS,
                ),
            },
          ],
        },
        {
          name: t('仓储报表'),
          link: '/report/sales_invoice_report',
          sub: [
            {
              link: '/report/sales_invoice_report/purchase_out_in',
              name: t('采购出入库汇总'),
            },
          ],
        },
      ],
    },
    // {
    //   link: '/data_manage',
    //   name: t('资料'),
    //   icon: <SVG_zl />,
    //   iconActive: <SVG_zl_active />,
    //   sub: [
    //     {
    //       name: t('加工资料'),
    //       link: '/data_manage/processing_data',
    //       sub: [
    //         {
    //           link: '/data_manage/processing_data/factory_model',
    //           name: t('工厂模型'),
    //         },
    //         {
    //           link: '/data_manage/processing_data/process_manage',
    //           name: t('工序管理'),
    //         },
    //       ],
    //     },
    //     {
    //       name: t('仓储资料'),
    //       link: '/data_manage/warehousing_data',
    //       sub: [
    //         // {
    //         //   link: '/data_manage/warehousing_data/supplier_manage',
    //         //   name: t('供应商管理'),
    //         // },
    //         {
    //           link: '/data_manage/warehousing_data/shelf_manage',
    //           name: t('货位管理'),
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   link: '/',
    //   name: t('同步'),
    //   icon: <SVG_sync />,
    //   iconActive: <SVG_sync_active />,
    //   sub: [
    //     {
    //       name: t('同步管理'),
    //       link: '/',
    //       sub: [
    //         {
    //           name: t('同步任务'),
    //           link: '/sync',
    //           disabled: !globalStore.hasPermission(
    //             Permission.PERMISSION_SAP_VIEW_SYNC_SETTINGS,
    //           ),
    //         },
    //       ],
    //     },
    //   ],
    // },
  ]

  return navConfig
}

// 初始化设置模块
function initSettingConfig() {
  const systemConfig = [
    {
      link: '/system',
      name: t('设置'),
      icon: <SVG_sz />,
      iconActive: <SVG_sz_active />,
      sub: [
        {
          name: t('企业设置'),
          link: '/system/setting/enterprise_information',
          icon: company_setting,
          sub: [
            {
              link: '/system/setting/enterprise_information',
              name: t('企业信息'),
            },
            {
              link: '/user_manage',
              name: t('员工管理'),
              disabled: !globalStore.isAdmin(),
            },
            {
              link: '/role_manage',
              name: t('角色管理'),
              disabled: globalStore.isLite || !globalStore.isAdmin(),
            },
          ],
        },
        {
          name: t('运营设置'),
          link: '/system/setting',
          icon: operator_setting,
          sub: [
            {
              link: '/system/setting/service_time',
              name: t('运营时间'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_ENTERPRISE_VIEW_SERVICE_PERIOD,
              ),
            },
            {
              link: '/system/setting/delivery_date',
              name: t('计划交期设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_VIEW_APPOINT_TIME_SETTINGS,
              ),
            },
            {
              link: '/system/setting/wait_for_purchase_order',
              name: t('待采购订单设置'),
              disabled: !globalStore.isLite
                ? true
                : globalStore.isLite &&
                  !globalStore.hasPermission(
                    Permission.PERMISSION_PREFERENCE_VIEW_APPOINT_TIME_SETTINGS,
                  ),
            },
            {
              link: '/system/setting/shop_settings',
              name: t('商品设置'),
            },
            {
              link: '/system/setting/order_setting',
              name: t('订单设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_VIEW_ORDER_SETTINGS,
              ),
            },
            {
              link: '/system/setting/purchase_setting',
              name: t('采购设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_VIEW_PURCHASE_SETTINGS,
              ),
            },
            {
              link: '/system/setting/production_setting',
              name: t('生产设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PRODUCTION_VIEW_SETTINGS,
              ),
            },
            {
              link: '/system/setting/sorting_setting',
              name: t('分拣设置'),
            },
            {
              link: '/system/setting/sales_invoicing_setting',
              name: t('仓储设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_INVENTORY_SETTINGS,
              ),
            },
            {
              link: '/system/setting/delivery_setting',
              name: t('配送设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_DELIVERY_VIEW_DELIVER_SETTINGS,
              ),
            },
            {
              link: '/system/setting/after_setting',
              name: t('售后设置'),
            },
          ],
        },
        {
          name: t('模板设置'),
          link: '/system/template',
          icon: template_setting,
          sub: [
            {
              link: '/system/template/order_template',
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_VIEW_IMPORT_TEMPLATE,
              ),
              name: t('导入模板设置'),
            },
            {
              link: '/system/template/print_template',
              name: t('打印模板设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_VIEW_PRINTING_TEMPLATE,
              ),
            },
          ],
        },
        {
          name: t('店铺装修'),
          link: '/system/shop_decoration',
          icon: store_construction,
          sub: [
            {
              link: '/system/shop_decoration/shop_meal',
              name: t('B端商城设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_UPDATE_SOCIAL_SHOP_LAYOUT,
              ),
            },
            {
              link: '/system/shop_decoration/student_meal',
              name: t('学生餐商城设置'),
              disabled: !globalStore.hasPermission(
                Permission.PERMISSION_PREFERENCE_UPDATE_EDUCATION_SHOP_LAYOUT,
              ),
            },
          ],
        },
      ],
    },
  ]

  return systemConfig
}

const IotConfig = [
  {
    link: '/iot',
    name: t('IOT'),
    icon: <SVG_iot />,
    iconActive: <SVG_iot_active />,
    sub: [
      {
        name: t('设备管理'),
        link: '/iot/device_management',
        sub: [
          {
            name: t('供应商'),
            link: '/iot/device_management/suppliers',
            sub: [
              {
                name: t('供应商编辑'),
                link: '/iot/device_management/suppliers/edit',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_SUPPLIER_SETTINGS,
                ),
              },
            ],
          },
          {
            name: t('设备型号'),
            link: '/iot/device_management/products',
            sub: [
              {
                name: t('设备型号编辑'),
                link: 'iot/device_management/products/edit',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_MODEL_SETTINGS,
                ),
              },
            ],
          },
          {
            name: t('设备'),
            link: '/iot/device_management/devices',
            sub: [
              {
                name: t('设备编辑'),
                link: '/iot/device_management/devices/edit',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_DEVICE_SETTINGS,
                ),
              },
            ],
          },
          {
            name: t('策略'),
            link: '/iot/device_management/tasks',
            sub: [
              {
                name: t('策略编辑'),
                link: '/iot/device_management/tasks/edit',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_STRATEGY_SETTINGS,
                ),
              },
            ],
          },
          {
            name: t('报警'),
            link: '/iot/device_management/alerts',
            sub: [
              {
                name: t('创建规则'),
                link: '/iot/device_management/alerts/create_rule',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_ALERT_SETTINGS,
                ),
              },
            ],
          },
          {
            name: t('数据'),
            link: '/iot/device_management/data',
            sub: [
              {
                name: t('记录'),
                link: '/iot/device_management/data/records',
                disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_DEVICE_VIEW_DATA_SETTINGS,
                ),
              },
            ],
          },
        ],
      },
      {
        name: t('环境'),
        link: '/iot/environment',
        sub: [
          {
            name: t('温湿度监控'),
            link: '/iot/environment/temp_hum_monitor',
            disabled: !globalStore.hasPermission(
              Permission.PERMISSION_DEVICE_VIEW_HUMIDITY_MONITORING,
            ),
          },
        ],
      },
    ],
  },
]

function getNavConfig() {
  if (_cache && globalStore.isBootstrap) {
    return _cache
  }

  const navConfig = initNavConfig()
  _cache = processNavConfig(navConfig)
  return _cache
}

function getSettingConfig() {
  const systemConfig = initSettingConfig()
  return processNavConfig(systemConfig)
}

function getNavRouteMap() {
  const navConfig = initNavConfig()
  const navMap: NavRouteMapType = {}
  _.forEach(navConfig, (one) => {
    if (one.sub?.length) {
      _.forEach(one.sub, (two) => {
        if (two.sub?.length) {
          _.forEach(two.sub, (three) => {
            navMap[three.link] = {
              link: three.link,
              disabled: three.disabled || false,
              name: three.name,
              twoName: two.name,
              two: _.filter(two.sub, (item) => !item.disabled),
              twoLink: two.link,
              oneName: one.name,
              one: one.sub,
            }
          })
        }
      })
    }
  })
  return navMap
}
/**
 * @description: 获取自身到root parent的所有路由
 * @param {string} childLinks 具体的 child links，如['/order/after_sales/after_sales_list', '/order/after_sales/add']
 *
 * @example
 *
 * getTargetToParentLink(['/order/after_sales/after_sales_list', '/order/after_sales/add'])
 * result: ['/order', '/order/after_sales', '/order/after_sales/after_sales_list', '/order/after_sales/add']
 */
function getTargetToParentLink(childLinks: string[]) {
  const targetToParentLink = [...childLinks]

  for (let childLink of childLinks) {
    let index = childLink.lastIndexOf('/')
    while (index) {
      // 如link为/order，那么下次获取到的index为0，跳出while循环
      childLink = childLink.slice(0, index)
      // 已经有的话就跳出，如有相同前缀的路由
      if (targetToParentLink.includes(childLink)) break
      targetToParentLink.unshift(childLink)
      index = childLink.lastIndexOf('/')
    }
  }
  return targetToParentLink
}
const LITE_VERSION_LINKS = getTargetToParentLink([
  // 商品 start
  '/merchandise/manage/merchandise_list/list',
  '/merchandise/merchandise_setting/category',
  // 商品 end
  // 订单 start
  '/order/order_manage/list',
  '/order/order_manage/create',
  '/order/after_sales/after_sales_list',
  // 订单 end
  // 采购 start
  '/purchase/manage/bills',
  '/purchase/supplier_manage/supplier_message',
  // 采购 end
  // 仓储 start
  '/sales_invoicing/purchase/stock_in',
  '/sales_invoicing/sales/stock_out',
  '/sales_invoicing/inventory_check/manage',
  '/sales_invoicing/inventory_account/stock_overview',
  '/sales_invoicing/inventory_account/stock_in_details',
  '/sales_invoicing/inventory_account/stock_out_details',
  '/sales_invoicing/inventory_account/cost_value',
  // 仓储 end
  // 客户 start
  '/customer/society/catering_customer_management',
  // 客户 end
  // 报表 有时间可以做，没时间就算了 start
  '/report/sale/comprehensive_sale_situation',
  '/report/sale/merchandise_sale_situation',
  '/report/sale/customer_sale_situation',
  '/report/sale/customer_merchandise_sale_situation',
  '/report/sale/category_sale_situation',
  '/report/financial_statement/customer_statement',
  '/report/financial_statement/supplier_statement',
  '/report/financial_statement/supplier_statement_lite',

  // 报表 end
  // 设置 start
  '/system/setting/enterprise_information',
  '/system/shop_decoration/shop_meal',
  '/system/template/print_template',
  '/system/setting/wait_for_purchase_order',
  // 设置 end
])
export default getNavConfig
export { getNavRouteMap, LITE_VERSION_LINKS, getSettingConfig, IotConfig }
