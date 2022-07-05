import React, { FC, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  ControlledFormItem,
  Input,
  Select,
  FormButton,
  Button,
  Flex,
  Popover,
  List,
} from '@gm-pc/react'

import { Observer, observer } from 'mobx-react'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import store from '../store'
import _ from 'lodash'
import DateRangeFilter from '@/common/components/date_range_filter'
import CategoryFilter from '@/common/components/category_filter'
import PlanBatchSelector from './plan_batch_selector'
import SupplierSelector from '../../components/supplier_selector'
import Purchaser from './purchaser'
import { taskOptions, planStates } from '../../../enum'
import { FilterProps } from '../../../interface'
import {
  ExportPurchaseTask,
  ExportPurchaseTaskRequest,
  GetExportPurchaseTaskSetting,
  SetExportPurchaseTaskSetting,
  ExportPurchaseTaskWithType,
} from 'gm_api/src/purchase'
import SVGDownTriangle from '@/svg/down_triangle.svg'
import globalStore from '@/stores/global'
import {
  FieldSelectorModal,
  FetcherParams,
  SelectedFields,
} from '@/common/components/field_selector'
import { message } from 'antd'

interface FieldsItem {
  text: string
  uid: string
  title: string
  key?: string
}

const searchList = [
  {
    text: t('按商品'),
    value: 0,
  },
  {
    text: t('按计划编号'),
    value: 1,
  },
]

const exportData = [
  { value: 0, text: t('导出采购二维表') },
  { value: 1, text: t('按供应商导出') },
  { value: 2, text: t('按采购员导出') },
  { value: 3, text: t('自定义导出字段') },
]

const tabs = [
  { name: '按供应商导出', id: 1 },
  { name: '按采购员导出', id: 2 },
]

/**
 * @description 采购计划头部
 */
const Filter: FC<FilterProps> = ({ onSearch, pagination }) => {
  const popoverRef = useRef<Popover>(null)
  const [showFieldSelectModal, setShowFieldSelectModal] =
    useState<boolean>(false)
  const handleSearch = () => {
    onSearch()
  }

  const handleReset = () => {
    store.initFilter()
  }
  /**
   *
   * @param export_type 如果传1就是普通导出, 2就是导出采购二维表
   */
  const handleExport = (export_type: number) => {
    const params = {
      ...store.getTaskParams(),
      export_type,
    } as ExportPurchaseTaskRequest
    ExportPurchaseTask({
      ...params,
    }).then(() => {
      globalStore.showTaskPanel()
    })
  }

  const handleExportByType = async (type: number) => {
    const paging = pagination.paging

    try {
      await ExportPurchaseTaskWithType({
        type,
        list_purchase_task_request: {
          ...store.getTaskParams(),
          paging: {
            offset: paging.offset,
            limit: paging.limit,
            need_count: paging.need_count,
          },
        },
      })
      globalStore.showTaskPanel('1')
    } catch (err) {
      console.log(new Error(JSON.stringify(err)))
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    store.updateFilter(key, key === 'category_ids' ? [value] : value)
  }

  const handleDateChange = (value: {
    begin?: Date
    end?: Date
    dateType?: number
  }) => {
    _.forEach(value, (v, k) => {
      handleFilterChange(k, v)
    })
  }

  const handlePurchaseTableExport = (value: number) => {
    popoverRef.current!.apiDoSetActive(false)
    switch (value) {
      case 0:
        handleExport(2)
        break
      case 1:
        handleExportByType(1)
        break
      case 2:
        handleExportByType(2)
        break
      case 3:
        setShowFieldSelectModal(true)
        break
      default:
        break
    }
  }

  /**
   * @description 获取自定义字段数据
   * @param params 当前激活的的tab
   * @returns
   */
  const getFieldData = async (params: FetcherParams<any>) => {
    const type = params.id
    try {
      const res = await GetExportPurchaseTaskSetting({
        type,
      })
      // 存在store中以备后面用
      if (type === 1) {
        store.exportHeaderListBySupplier = res.response
      }
      if (type === 2) {
        store.exportHeaderListByBuyer = res.response
      }
      const data: Record<string, FieldsItem[]> = {}
      _.forEach(res.response.common_fields, (item) => {
        if (!data[item.title as string]) {
          data[item.title as string] = []
        }
        data[item.title as string].push({
          text: item.header!,
          uid: item.key + item.title!,
          title: item.title!,
          key: item.key!,
        })
      })
      const list = _.map(Object.keys(data), (item) => ({
        label: item,
        children: data[item],
      }))
      const selected = _.map(
        res.response.export_purchase_task_setting?.fields?.fields,
        (item) => ({
          text: item.header!,
          uid: item.key! + item.title!,
          title: item.title!,
          key: item.key!,
        }),
      )

      return {
        list,
        selected,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * @description 提交修改自定义导出
   */
  const submitSelect = async (val: SelectedFields<FieldsItem, number>) => {
    const { fields, id } = val

    try {
      const res = await SetExportPurchaseTaskSetting({
        export_purchase_task_setting: {
          type: id,
          group_id: globalStore.userInfo.group_id!,
          group_user_id: globalStore.userInfo.group_user?.group_user_id!,
          fields: {
            fields: _.map(fields, (item) => ({
              header: item.text,
              key: item.key,
              title: item.title,
            })),
          },
        },
      })
      if (res.code === 0) {
        message.success(t('保存成功'))
      } else {
        message.success(t('保存失败'))
      }
    } catch (err) {
      console.log(new Error(JSON.stringify(err)))
    }
  }

  return (
    <>
      <BoxForm labelWidth='100px' colWidth='385px' onSubmit={handleSearch}>
        <FormBlock col={3}>
          <Observer>
            {() => {
              const { begin, end, dateType } = store.filter
              return (
                <DateRangeFilter
                  data={taskOptions}
                  value={{ begin, end, dateType }}
                  onChange={handleDateChange}
                  enabledTimeSelect
                />
              )
            }}
          </Observer>
          <ControlledFormItem>
            <Flex>
              <div className='gm-inline-block gm-padding-right-5'>
                <Observer>
                  {() => (
                    <Select
                      clean
                      value={store.filter.searchType}
                      onChange={(value) => {
                        if (value !== store.filter.searchType) {
                          handleFilterChange('search_text', '')
                        }
                        handleFilterChange.bind(null, 'searchType')(value)
                      }}
                      className='gm-inline-block'
                      style={{ width: 95 }}
                      data={searchList}
                    />
                  )}
                </Observer>
              </div>
              <Flex flex none column style={{ minWidth: 'auto' }}>
                <Observer>
                  {() => {
                    const { search_text } = store.filter
                    return (
                      <Input
                        value={search_text}
                        onChange={(e) =>
                          handleFilterChange('search_text', e.target.value)
                        }
                        placeholder={
                          store.filter.searchType
                            ? t('输入计划编号搜索')
                            : t('输入商品信息搜索')
                        }
                      />
                    )
                  }}
                </Observer>
              </Flex>
            </Flex>
          </ControlledFormItem>
        </FormBlock>
        <BoxFormMore>
          <FormBlock col={3}>
            <ControlledFormItem col={1} label={t('商品分类')}>
              <Observer>
                {() => {
                  const { category_ids } = store.filter
                  return (
                    <CategoryFilter
                      placeholder={t('全部分类')}
                      defaultValue={
                        category_ids.length === 0 ? '' : category_ids[0]
                      }
                      style={{ width: '275px' }}
                      onChange={(category_id) =>
                        handleFilterChange('category_ids', category_id)
                      }
                      // multiple
                    />
                  )
                }}
              </Observer>
            </ControlledFormItem>
            <ControlledFormItem label={t('计划波次')}>
              <PlanBatchSelector />
            </ControlledFormItem>
            <ControlledFormItem label={t('供应商')}>
              <Observer>
                {() => (
                  <SupplierSelector
                    selected={store.filter.suppliers}
                    onSelect={handleFilterChange.bind(null, 'suppliers')}
                  />
                )}
              </Observer>
            </ControlledFormItem>
            <ControlledFormItem label={t('采购员')}>
              <Observer>
                {() => {
                  const { purchaser_id } = store.filter
                  return (
                    <Purchaser
                      selected={purchaser_id}
                      onSelect={handleFilterChange.bind(null, 'purchaser_id')}
                    />
                  )
                }}
              </Observer>
            </ControlledFormItem>
            <ControlledFormItem label={t('计划状态')}>
              <Observer>
                {() => {
                  const { plan_state } = store.filter
                  return (
                    <Select
                      value={plan_state}
                      data={[{ value: 0, text: t('全部状态') }, ...planStates]}
                      onChange={handleFilterChange.bind(null, 'plan_state')}
                    />
                  )
                }}
              </Observer>
            </ControlledFormItem>
            <ControlledFormItem label={t('供应商协作模式')}>
              <Observer>
                {() => {
                  const { supplier_cooperate_model_type } = store.filter
                  return (
                    <Select
                      value={supplier_cooperate_model_type}
                      data={[
                        {
                          value: -1,
                          text: t('全部状态'),
                        },
                        {
                          value:
                            Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
                          text: t('仅供货'),
                        },
                        {
                          value:
                            Sku_SupplierCooperateModelType.SCMT_WITH_SORTING,
                          text: t('代分拣'),
                        },
                        {
                          value:
                            Sku_SupplierCooperateModelType.SCMT_WITH_DELIVERY,
                          text: t('代配送'),
                        },
                      ]}
                      onChange={(selected) =>
                        handleFilterChange(
                          'supplier_cooperate_model_type',
                          selected,
                        )
                      }
                    />
                  )
                }}
              </Observer>
            </ControlledFormItem>
          </FormBlock>
        </BoxFormMore>

        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <BoxFormMore>
            <>
              <Button onClick={handleReset}>{t('重置')}</Button>
              <div className='gm-gap-10' />
            </>
          </BoxFormMore>
          <Button onClick={handleExport.bind(this, 1)}>{t('导出')}</Button>
          <Popover
            ref={popoverRef}
            type='click'
            popup={
              <List
                data={exportData}
                onSelect={(value) => handlePurchaseTableExport(value as number)}
                className='gm-border-0'
                style={{ minWidth: '30px' }}
              />
            }
          >
            <Button>
              <SVGDownTriangle />
            </Button>
          </Popover>
        </FormButton>
      </BoxForm>
      <FieldSelectorModal
        visible={showFieldSelectModal}
        onClose={() => setShowFieldSelectModal(false)}
        width={1024}
        defaultActiveKey={tabs[0].name}
        title='自定义导出字段'
        tabs={tabs}
        batchSubmit={false}
        fetcher={getFieldData}
        fieldKey='uid' // 告知组件：数据中表示主键的键名。
        labelKey='text' // 告知组件：数据组表示 label 文字描述的键名。
        onSubmit={submitSelect}
      />
    </>
  )
}

export default observer(Filter)
