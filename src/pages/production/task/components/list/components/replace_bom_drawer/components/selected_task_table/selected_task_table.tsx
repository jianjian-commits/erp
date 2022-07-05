import { InputNumber, Select } from 'antd'
import { t } from 'gm-i18n'
import { ListUnit, Unit } from 'gm_api/src/merchandise'
import { Task_Type } from 'gm_api/src/production'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import { CollapseTable } from '../../components'
import {
  ExpandedColumnType,
  ExpandedTask,
  ReplaceMaterial,
} from '../../interfaces'
import store from '../../store'
import { ReplaceSkuSelect } from './components'

/**
 * 已选任务表格的属性
 */
interface SelectedTaskTableProps {
  /** 是否是包装计划 */
  type: Task_Type
  /** 表格的数据，表示已选的任务 */
  data: ExpandedTask[]
  /** 替换物料改变时执行的动作 */
  onReplaceChange: () => void
}

/**
 * 已选任务表格的组件函数，用来展示已选任务的表格
 */
const SelectedTaskTable: FC<SelectedTaskTableProps> = ({
  type,
  data,
  onReplaceChange,
}) => {
  /** 表格的所有栏 */
  const allColumns: ExpandedColumnType<ExpandedTask>[] = [
    {
      title: '序号',
      dataIndex: 'taskIndex',
      key: 'taskIndex',
      width: 2,
      fixed: 'left',
      render: (index, { rowSpan }) => {
        return {
          children: <div>{index + 1}</div>,
          props: {
            rowSpan: rowSpan,
          },
        }
      },
    },
    {
      title: '计划交期',
      dataIndex: 'delivery_time',
      key: 'delivery_time',
      width: 2,
      fixed: 'left',
      render: (deliveryTime, { rowSpan }) => {
        return {
          children: (
            <div>{moment(deliveryTime, 'x').format('MM-DD HH:mm')}</div>
          ),
          props: {
            rowSpan: rowSpan,
          },
        }
      },
    },
    {
      title: '计划编号',
      dataIndex: 'serial_no',
      key: 'serial_no',
      width: 3,
      fixed: 'left',
      render: (serialNumber, { rowSpan }) => {
        return {
          children: <div>{serialNumber}</div>,
          props: {
            rowSpan: rowSpan,
          },
        }
      },
    },
    {
      title: '生产成品',
      type: Task_Type.TYPE_PRODUCE,
      dataIndex: 'sku_name',
      key: 'sku_name',
      width: 3,
      fixed: 'left',
      render: (skuName, { rowSpan }) => {
        return {
          children: <div>{skuName}</div>,
          props: {
            rowSpan: rowSpan,
          },
        }
      },
    },
    {
      title: '原物料名称',
      dataIndex: 'input',
      key: 'input',
      width: 3,
      render: (input) => {
        return {
          children: <div>{input.sku_name}</div>,
        }
      },
    },
    {
      title: '原物料计划数',
      dataIndex: 'input',
      key: 'input',
      width: 3,
      render: (input) => {
        const unit = unitList.find((unit) => unit.unit_id === input.unit_id)
        return {
          children: (
            <div>{`${(+input.plan_usage_amount).toFixed(4)}${unit?.name}`}</div>
          ),
        }
      },
    },
    {
      title: '替换后物料名称',
      dataIndex: 'input',
      key: 'input',
      width: 5,
      render: (_, task) => {
        return (
          <ReplaceSkuSelect
            task={task}
            units={unitList}
            onChange={onReplaceChange}
          />
        )
      },
    },
    {
      title: '替换数量',
      dataIndex: 'replaceInfo',
      key: 'replaceInfo',
      width: 4,
      render: (replaceInfo: ReplaceMaterial) => {
        return (
          <InputNumber
            value={+(replaceInfo.replace_quantity || NaN)}
            style={{ width: '120px' }}
            min={0}
            precision={4}
            disabled={!replaceInfo.replace_sku_id}
            onChange={(value) => handleReplaceAmountChange(replaceInfo, value)}
          />
        )
      },
    },
    {
      title: '新物料单位',
      dataIndex: 'replaceInfo',
      key: 'replaceInfo',
      width: 3,
      render: (replaceInfo) => {
        const sameTypeUnits = store.getSelectableUnits(
          replaceInfo.baseUnitId,
          replaceInfo.productionUnitId,
          unitList,
        )
        const options = renderOptions(sameTypeUnits)
        return (
          <Select
            options={options}
            style={{ width: '80px' }}
            value={
              replaceInfo.replace_sku_id &&
              (replaceInfo.replace_unit_id || replaceInfo.baseUnitId)
            }
            disabled={!replaceInfo.replace_sku_id}
            onChange={(value) => handleReplaceUnitChange(replaceInfo, value)}
          />
        )
      },
    },
  ]

  /** 根据当前类型过滤后的栏 */
  const columns = allColumns.filter(
    (column) => !column.type || column.type === type,
  )

  const [unitList, setUnitList] = useState<Unit[]>([])

  useEffect(() => {
    ListUnit().then((response) => {
      setUnitList(response.response.units)
    })
  }, [])

  /**
   * 处理替换数量变化事件，替换物料的数量改变时触发
   * 更新物料数量并触发上层更改事件
   * @param {ReplaceMaterial} replaceInfo 当前替换物料的属性
   * @param {number | value}  value       更改后的替换物料数量
   */
  const handleReplaceAmountChange = (
    replaceInfo: ReplaceMaterial,
    value: number | null,
  ) => {
    replaceInfo.replace_quantity = value?.toFixed(4)
    onReplaceChange()
  }

  /**
   * 渲染物料单位的选项，用于物料单位的下拉列表
   * @param  {Unit[]} units 单位的集合
   * @return {any}          单位的选项
   */
  const renderOptions = (units: Unit[]) => {
    const options = units.map((unit) => {
      return {
        label: unit.name,
        value: unit.unit_id,
      }
    })
    return options
  }

  /**
   * 处理替换物料单位改变事件，替换物料单位更改时触发
   * 更新替换物料单位并触发上层改变事件
   * @param {ReplaceMaterial} replaceInfo 当前替换物料的属性
   * @param {string}          value       更改后的替换物料单位ID
   */
  const handleReplaceUnitChange = (
    replaceInfo: ReplaceMaterial,
    value: string,
  ) => {
    replaceInfo.replace_unit_id = value
    onReplaceChange()
  }

  /**
   * 渲染组件
   */
  return (
    <CollapseTable<ExpandedTask>
      className='box'
      header={t('已选择计划')}
      columns={columns}
      data={data}
    />
  )
}

export default SelectedTaskTable
