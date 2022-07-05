import { pinYinFilter } from '@gm-common/tool'
import { Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { t } from 'gm-i18n'
import {
  CategoryTreeCache_CategoryInfo,
  Sku,
  Unit,
} from 'gm_api/src/merchandise'
import React, { FC, useState } from 'react'
import { CategorizedSku, ExpandedTask } from '../../../../interfaces'
import store from '../../../../store'
import _ from 'lodash'

/**
 * 替换物料下拉框的属性
 */
interface ReplaceSkuSelectProps {
  /** 当前的物料对应的任务 */
  task: ExpandedTask
  /** 所有单位的集合 */
  units: Unit[]
  /** 父级组件的改变事件 */
  onChange: Function
}

/**
 * 替换物料下拉框的组件函数，用来显示替换物料的下拉框及执行相应的动作
 */
const ReplaceSkuSelect: FC<ReplaceSkuSelectProps> = ({
  task,
  units,
  onChange,
}) => {
  let timeout: NodeJS.Timeout

  const [categorizedSkuList, setCategorizedSkuList] = useState<CategorizedSku>(
    task.skuList || {},
  )
  const [plainSkuList, setPlainSkuList] = useState<Sku[]>([])

  /**
   * 把当前物料加入分类中
   * @param  {CategorizedSku}          categorizedSkus 已分类的物料
   * @param  {ListSkuResponse_SkuInfo} skuInfo         当前物料信息
   * @return {CategorizedSku}                          加入新物料后的分类信息
   */
  const categorizeSkus = (
    categorizedSkus: CategorizedSku,
    skuInfo: Sku,
    category_map?: {
      [key: string]: CategoryTreeCache_CategoryInfo
    },
  ) => {
    const categoryId: string[] = []
    for (let i = 1; i <= 5; i++) {
      categoryId.push(
        skuInfo[
          `category${i}_id` as keyof Pick<
            Sku,
            | 'category1_id'
            | 'category2_id'
            | 'category3_id'
            | 'category4_id'
            | 'category5_id'
          >
        ]!,
      )
    }

    const id = categoryId.join('_')
    const name = _.map(
      _.filter(categoryId, (v) => v !== '0'),
      (v) => category_map?.[v].name,
    ).join('/')

    categorizedSkus[id] = {
      name,
      skus: [...(categorizedSkus?.[id]?.skus || []), skuInfo],
    }
    return categorizedSkus
  }

  /**
   * 搜索物料事件，物料搜索时触发
   * 根据输入的物料名称获取物料
   * @async
   * @param {string} value 输入的物料名称
   */
  const handleSearch = async (value: string) => {
    clearTimeout(timeout)

    timeout = setTimeout(async () => {
      if (!value) {
        task.skuList = {}
        setCategorizedSkuList({})
        return
      }

      // 把当前任务所有的原料都剔除掉
      const replaceSkuId = Object.keys(store.taskInputMap[task.task_id])
      const { skus, category_map } = await store.getSkusByName(value)
      if (!skus?.length) {
        return
      }
      const categorizedSkuList = skus
        .filter((v) => !replaceSkuId.includes(v.sku_id))
        .reduce((categorizedSkus: CategorizedSku, sku) => {
          return categorizeSkus(categorizedSkus, sku, category_map)
        }, {})
      task.skuList = categorizedSkuList
      setPlainSkuList(skus)
      setCategorizedSkuList(categorizedSkuList)
    }, 500)
  }

  /**
   * 处理替换物料改变事件，替换物料更改时触发
   * 更新替换物料的所有信息并触发上层改变事件
   * @param {SelectValue} value 更改后的替换物料
   */
  const handleChange = (value: SelectValue) => {
    const { input } = task
    // input实际不可能为空，但是为了下方使用方便所以这里判断一下
    if (!input || !input.sku_id) {
      return
    }

    if (value) {
      const selectedSku = plainSkuList.find((sku) => sku.sku_id === value)
      const baseUnitId = selectedSku?.base_unit_id || ''
      const productionUnitId = selectedSku?.production_unit?.unit_id || ''
      const sameUnits = store.getSelectableUnits(
        baseUnitId,
        productionUnitId,
        units,
      )
      task.replaceInfo = {
        task_input_id: input.task_input_id,
        replace_sku_id: value.toString(),
        // 第一次选择替换物料时设置数量，之后不变，除非清除了替换物料
        replace_quantity:
          task.replaceInfo?.replace_quantity || input.plan_usage_amount,
        // 如果原物料的单位包含在替换物料的基本或生产单位中，那么直接采用原物料的单位, 否则就直接用替换物料的基本单位
        replace_unit_id: sameUnits.some(
          (unit) => unit.unit_id === input.unit_id,
        )
          ? input.unit_id
          : baseUnitId,
        baseUnitId: baseUnitId,
        productionUnitId: productionUnitId,
      }
      store.taskInputMap[task.task_id][input.sku_id] = value.toString()
    } else {
      task.replaceInfo = {}
      store.taskInputMap[task.task_id][input.sku_id] = ''
    }

    onChange()
  }

  /**
   * 渲染组件
   */
  return (
    <Select
      value={task.replaceInfo?.replace_sku_id}
      style={{ width: '180px' }}
      placeholder={t('选择替换后物料')}
      showSearch
      allowClear
      filterOption={(input, option) => {
        return (
          pinYinFilter(option?.options, input, (o) => o.children).length > 0
        )
      }}
      onChange={handleChange}
      onSearch={handleSearch}
    >
      {Object.keys(categorizedSkuList).map((id) => {
        return (
          <Select.OptGroup
            key={id}
            label={
              <div style={{ color: '#1890ff' }}>
                {categorizedSkuList[id].name}
              </div>
            }
          >
            {categorizedSkuList[id].skus.map((sku) => {
              return (
                <Select.Option key={sku.sku_id} value={sku.sku_id}>
                  {sku.name}
                </Select.Option>
              )
            })}
          </Select.OptGroup>
        )
      })}
    </Select>
  )
}

export default ReplaceSkuSelect
