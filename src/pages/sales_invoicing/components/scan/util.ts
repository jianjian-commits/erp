import _ from 'lodash'
import globalStore from '@/stores/global'
import {
  getTargetSsuList,
  isSystemBaseUnit,
  isSystemSsuUnitType,
} from '../../util'

import { t } from 'gm-i18n'
import Big from 'big.js'
import {
  GetTaskMaterialSheetResponse,
  GetTaskProductSheetResponse,
  GetMaterialOrderResponse,
} from 'gm_api/src/production'
import { toFixedSalesInvoicing } from '@/common/util'
import { UnitType } from 'gm_api/src/merchandise'
import { ComSsuItem } from '../../interface'

interface ScanProduct {
  uniqueKey: number
  task_id: string
  scan_serial_no: string
  is_by_product: boolean

  // 绑定生产计划
  production_task_serial_no: string
  production_task_id: string

  sku_name: string
  sku_id: string
  category_id_1: string
  category_id_2: string
  category_name_1: string
  category_name_2: string
  spu_id: string
  spu_name: string
  base_unit_id: string
  sku_base_unit_id: string
  unit_id: string
  ssu_base_unit_id: string
  ssu_base_unit_name: string

  ssu_unit_id: string
  ssu_display_name: string
  ssu_unit_rate: number | string
  ssu_unit_type: UnitType
  ssu_base_unit_rate: number | string

  ssu_unit_name: string
  sku_base_quantity: number
  sku_base_unit_name: string

  // 计算规格对应的值
  ssu_base_quantity: number // 基本单位等于基本单位
  ssu_quantity: number // 包装单位(废弃)直接取plan_amount
  ssu_base_quantity_show: string // 基本单位通过基本单位和rate换算
  ssu_quantity_show: string // 包装单位(废弃)直接取plan_amount

  // ssu
  ssu: ComSsuItem[] // 没有规格
}

export const adapterProduce = (
  json: GetTaskProductSheetResponse,
): ScanProduct[] => {
  const productList: ScanProduct[] = []
  _.each(json.tasks, (task) => {
    const sku = json.skus![task.sku_id]
    const skuBaseUnit = globalStore.getUnit(task.base_unit_id!)!

    // const targetSsuList = getTargetSsuList(
    //   {
    //     sku_type: sku.sku?.sku_type!,
    //     sku_id: sku.sku?.sku_id!,
    //     sku_base_unit_id: sku.sku?.base_unit_id!,
    //   },
    //   _.map(sku.ssu_map!, (item) => item),
    // )

    // const targetSsu = targetSsuList.filter(
    //   (ssu) => ssu.ssu_unit_id === task.unit_id,
    // )[0]

    // const ssuUnit = targetSsu.unit

    // const ssuBaseUnitId = ssuUnit?.parent_id
    // const ssuBaseUnit = globalStore.getUnit(ssuBaseUnitId)
    const finishProduct = {
      // ...task,
      uniqueKey: _.random(1000, true),
      task_id: task.task_id,
      scan_serial_no: task.serial_no!,
      is_by_product: false,

      // 绑定生产计划
      production_task_serial_no: task.serial_no!,
      production_task_id: task.task_id,

      sku_name: task.sku_name!,
      sku_id: task.sku_id,
      category_id_1: sku?.category_infos![0].category_id!,
      category_id_2: sku?.category_infos![1].category_id!,
      category_name_1: sku?.category_infos![0].category_name!,
      category_name_2: sku?.category_infos![1].category_name!,
      spu_id: sku?.sku?.spu_id!,
      spu_name: sku?.category_infos![2].category_name!,
      base_unit_id: task.base_unit_id!,
      sku_base_unit_id: task.base_unit_id!,
      // unit_id: ssuUnit?.unit_id,
      // ssu_base_unit_id: ssuBaseUnit?.unit_id,
      // ssu_base_unit_name: ssuBaseUnit?.name,

      // ssu_unit_id: ssuUnit?.unit_id,
      // ssu_display_name: isSystemSsuUnitType(targetSsu.ssu_unit_type)
      //   ? `${ssuBaseUnit?.text!}${
      //       isSystemBaseUnit(ssuUnit?.unit_id!) ? `(${t('基本单位')})` : ''
      //     }`
      //   : `${ssuUnit?.rate!}${ssuBaseUnit?.text}/${ssuUnit?.name}`,
      // ssu_unit_rate: ssuUnit?.rate,
      // ssu_unit_type: targetSsu.ssu_unit_type,
      // ssu_base_unit_rate: +Big(ssuBaseUnit.rate).div(skuBaseUnit.rate),

      // ssu_unit_name: ssuUnit?.name ?? '-',
      sku_base_quantity: +task.base_unit_output_amount,
      sku_base_unit_name: skuBaseUnit?.text!,

      // 计算规格对应的值
      base_quantity: +task.base_unit_output_amount, // 基本单位等于基本单位
      // ssu_quantity: +task.output_amount, // 包装单位(废弃)直接取output_amount
      // ssu_base_quantity_show: toFixedSalesInvoicing(
      //   +task.base_unit_output_amount,
      // ), // 基本单位通过基本单位和rate换算
      // ssu_quantity_show: toFixedSalesInvoicing(+task.output_amount), // 包装单位(废弃)直接取output_amount

      // ssu
      // ssu: targetSsuList, // 没有规格
    }

    /** 成品和副产品分割线，上面是成品，下面是副产品(by作为前缀) */
    if (
      task.by_products &&
      task.by_products.by_products &&
      task.by_products.by_products.length > 0
    ) {
      _.each(task.by_products.by_products, (byPro) => {
        const bySku = json.skus![byPro.sku_id!]
        const bySkuBaseUnit = globalStore.getUnit(bySku.sku?.base_unit_id!)!

        // const byTargetSsuList = getTargetSsuList(
        //   {
        //     sku_type: bySku.sku?.sku_type!,
        //     sku_id: bySku.sku?.sku_id!,
        //     sku_base_unit_id: bySku.sku?.base_unit_id!,
        //   },
        //   _.map(bySku.ssu_map!, (item) => item),
        // )

        // const byTargetSsu = byTargetSsuList.filter(
        //   (ssu) => ssu.ssu_unit_id === byPro.unit_id,
        // )[0]

        // const bySsuUnit = byTargetSsu.unit

        // const bySsuBaseUnitId = bySsuUnit.parent_id
        // const bySsuBaseUnit = globalStore.getUnit(bySsuBaseUnitId)

        const byProduct = {
          // ...task,
          uniqueKey: _.random(1000, true),
          task_id: task.task_id,
          scan_serial_no: task.serial_no!,
          is_by_product: true, // 副产品

          // 绑定生产计划
          production_task_serial_no: task.serial_no!,
          production_task_id: task.task_id,

          sku_name: bySku.sku?.name!,
          sku_id: bySku.sku?.sku_id!,
          category_id_1: bySku?.category_infos![0].category_id!,
          category_id_2: bySku?.category_infos![1].category_id!,
          category_name_1: bySku?.category_infos![0].category_name!,
          category_name_2: bySku?.category_infos![1].category_name!,
          spu_id: bySku?.sku?.spu_id!,
          spu_name: bySku?.category_infos![2].category_name!,
          base_unit_id: bySku.sku?.base_unit_id!,
          sku_base_unit_id: bySku.sku?.base_unit_id!,
          // unit_id: bySsuUnit?.unit_id,
          // ssu_base_unit_id: bySsuBaseUnit?.unit_id,
          // ssu_base_unit_name: bySsuBaseUnit?.name,

          // ssu_unit_id: bySsuUnit?.unit_id,
          // ssu_display_name: isSystemSsuUnitType(byTargetSsu.ssu_unit_type)
          //   ? `${bySsuBaseUnit?.text!}${
          //       isSystemBaseUnit(bySsuUnit?.unit_id!)
          //         ? `(${t('基本单位')})`
          //         : ''
          //     }`
          //   : `${bySsuUnit?.rate!}${bySsuBaseUnit?.text}/${bySsuUnit?.name}`,
          // ssu_unit_rate: bySsuUnit?.rate,
          // ssu_unit_type: byTargetSsu.ssu_unit_type,
          // ssu_base_unit_rate: +Big(bySsuBaseUnit.rate).div(bySkuBaseUnit.rate),

          // ssu_unit_name: bySsuUnit?.name ?? '-',
          sku_base_quantity: +byPro.output_amount, // 副产品的产出数
          sku_base_unit_name: bySkuBaseUnit?.text!,

          // 计算规格对应的值
          ssu_base_quantity: +byPro.output_amount, // 基本单位等于基本单位
          ssu_quantity: +byPro.output_amount, // 包装单位(废弃)直接取output_amount
          ssu_base_quantity_show: toFixedSalesInvoicing(+byPro.output_amount), // 基本单位通过基本单位和rate换算
          ssu_quantity_show: toFixedSalesInvoicing(+byPro.output_amount), // 包装单位(废弃)直接取output_amount

          // ssu
          // ssu: byTargetSsuList, // 没有规格
        }
        productList.push(byProduct)
      })
    }
    /**  这里结束副产品 */

    productList.push(finishProduct)
  })

  return productList
}

export const adapterMaterial = (res: GetMaterialOrderResponse) => {
  return _.map(res.material_order_details, (task_input) => {
    const sku = res.skus?.sku_map?.[task_input?.sku_id!]
    const categoryMap = res.skus?.category_map
    const skuBaseUnit = globalStore.getUnit(sku?.base_unit_id || '0')

    // const task = res.task_details![task_input.task_id!].task!

    // task_input是原料，task是成品，因此这里的数据以task_input为准，单位都是基本单位(task_input.unit_id)
    return {
      // ...task,
      // task_input_id: task_input.task_input_id,
      // scan_serial_no: task.serial_no,

      // 绑定生产计划
      material_order_detail_id: task_input.material_order_detail_id,
      // production_task_id: task.task_id,

      sku_name: sku?.name,
      sku_id: sku?.sku_id,
      category_id_1: sku?.category1_id,
      category_id_2: sku?.category2_id,
      category_name_1: categoryMap?.[sku?.category1_id!]?.name,
      category_name_2: categoryMap?.[sku?.category2_id!]?.name,
      spu_id: sku?.spu_id,
      spu_name: categoryMap?.[sku?.category2_id!]?.name,
      base_unit_id: sku?.base_unit_id,
      sku_base_unit_id: sku?.base_unit_id,
      unit_id: task_input.unit_id,
      sku_base_quantity: task_input?.plan_amount,
      sku_base_unit_name: skuBaseUnit?.text!,
      second_base_unit_id: sku?.second_base_unit_id,
      second_base_unit_ratio: sku?.second_base_unit_ratio,

      // 计算规格对应的值,所有都取基本单位，领料退料只有基本单位
      base_quantity: task_input.plan_amount,
    }
  })
}
