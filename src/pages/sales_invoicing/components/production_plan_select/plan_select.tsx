import {
  useTableModalSelected,
  UseTableModalSelectedOptions,
} from '@/common/hooks'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Flex, Button, Pagination, BoxPagination } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'

import PlanTable from './plan_table'
import Filter from './filter'
import type { FilterType } from './filter'
import globalStore from '@/stores/global'
import { ProductionSettings_InputMaterialType } from 'gm_api/src/preference'

import { usePagination } from '@gm-common/hooks'
import { TaskDetail } from '../../sales_invoicing_type'
import { GetTask, ListTask, Task } from 'gm_api/src/production'
import { adapterTaskList, mergeData } from './util'

interface PlanSelectProps
  extends Omit<
    UseTableModalSelectedOptions<TaskDetail>,
    'defaultSelectedData'
  > {
  onEnsure: (data: TaskDetail[]) => void | Promise<any>
  onCancel: () => void
  defaultFilter: Partial<FilterType>
  production_task_id?: string
  skuId?: string
  warehouseId?: string
}

const PlanSelect: FC<PlanSelectProps> = (props) => {
  const {
    selectKey,
    onEnsure,
    onCancel,
    defaultFilter,
    production_task_id,
    adapterDataFunc,
    skuId,
    warehouseId,
  } = props
  const { input_material_type } = globalStore.productionSetting

  const [data, setData] = useState<TaskDetail[]>([])
  const [selected, setSelected] = useState<TaskDetail[]>([])

  const selectedRef = useRef<TaskDetail[]>([])

  const keyListFromFetchRef = useRef<string[]>([]) // 记录搜索的结果

  const dataRef = useRef(data)
  dataRef.current = data
  const selectedDataRef = useRef<TaskDetail[]>([])

  const isHandledRef = useRef(false) // 是否已经操作过selected，用来判断添加数据为selected还是selectedData

  const fetchTask = (filter: any) => {
    return ListTask(filter).then((json) => {
      const merge = mergeData(
        selectedDataRef.current,
        adapterTaskList(json.response, skuId),
        selectKey,
      )

      setData(merge)
      keyListFromFetchRef.current = _.map(
        json.response.task_details,
        (item) => item.task![selectKey],
      )!
      return json.response
    })
  }

  const { paging, runChangePaging, run, loading } = usePagination<any>(
    fetchTask,
    {
      defaultPaging: {
        need_count: true,
      },
      paginationKey: 'productStockOutPlanSelect',
    },
  )

  useEffect(() => {
    // 外部拿不到数据，这里拉数据之后再设置defaultSelectedData
    if (production_task_id && production_task_id !== '0') {
      GetTask({ task_id: production_task_id }).then((json) => {
        setSelected(
          adapterTaskList(
            {
              task_details: [
                {
                  task: json.response.task,
                  task_processes: json.response.task_processes,
                  task_orders: json.response.task_orders,
                  task_inputs: json.response.task_inputs,
                },
              ],
              skus: json.response.skus,
              units: json.response.units,
            },
            skuId,
          ),
        )

        return json
      })
    }
  }, [])

  useEffect(() => {
    selectedRef.current = selected
    setData(mergeData(selectedRef.current, data, selectKey))
  }, [selected])

  const { selectedData, unSelectedData, onAdd, onDel } =
    useTableModalSelected<TaskDetail>(data, {
      defaultSelectedData: [production_task_id!],
      selectKey,
    })
  selectedDataRef.current = selectedData

  const handleEnsure = () => {
    return onEnsure(selectedData)
  }

  const handleAdd = (addData: Task) => {
    const merge = mergeData(
      onAdd(addData).selected,
      _.filter(dataRef.current, (item) =>
        keyListFromFetchRef.current.includes(item[selectKey]),
      ),
      selectKey,
    )
    setData(adapterDataFunc ? adapterDataFunc(merge) : merge)

    isHandledRef.current = true
  }

  const handleDel = (id: string) => {
    const curSelected = onDel(id).selected

    const merge = mergeData(
      curSelected,
      _.filter(dataRef.current, (item) =>
        keyListFromFetchRef.current.includes(item[selectKey]),
      ),
      selectKey,
    )
    setData(adapterDataFunc ? adapterDataFunc(merge) : merge)

    isHandledRef.current = true
  }

  // 不需要多次判断
  const isMaterial = useMemo(() => {
    return (
      <>
        {input_material_type ===
          ProductionSettings_InputMaterialType.INPUTMATERIALTYPE_SUBSTITUTE_MATERIAL_ALLOWED && (
          <span className='gm-text-red gm-margin-tb-5'>
            {t(
              '说明：当前已开启原料替代料逻辑，支持选择非计划原料的商品作为原料领出，请谨慎选择！',
            )}
          </span>
        )}
      </>
    )
  }, [input_material_type])

  return (
    <Flex column>
      {/* 已选择的表格数据 */}
      {isMaterial}
      <PlanTable
        data={selectedData}
        onDel={handleDel}
        selectKey={selectKey}
        key='selected'
        type='selected'
        needPagination={false}
      />
      {/* 筛选条件 */}
      <Filter
        onSearch={run}
        loading={loading}
        defaultFilter={{ ...defaultFilter }}
      />
      {/* 待选择的表格数据 */}
      <PlanTable
        data={unSelectedData}
        onAdd={handleAdd}
        selectKey={selectKey}
        type='unSelected'
        key='unSelected'
        needPagination
      />
      <BoxPagination>
        <Pagination paging={paging} onChange={runChangePaging} />
      </BoxPagination>
      <Flex justifyCenter className='gm-margin-top-20'>
        <Button onClick={onCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleEnsure}>
          {t('确认')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default PlanSelect
