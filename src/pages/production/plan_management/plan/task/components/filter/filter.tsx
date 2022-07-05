import BatchesSelector from '@/pages/production/plan_management/plan/task/components/filter/batches_selector'
import globalStore from '@/stores/global'
import {
  BoxForm,
  ControlledFormItem,
  FormItem,
  MoreSelectDataItem,
  Select,
  Flex,
} from '@gm-pc/react'

import { Cascader, Modal, Button, Row, Col } from 'antd'
import { t } from 'gm-i18n'
import { MoreSelect_Route } from 'gm_api/src/delivery/pc'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import {
  ExportProcessTask,
  list_ProcessTask_State,
  ProduceType,
} from 'gm_api/src/production'
import { MoreSelect_ProcessTemplate } from 'gm_api/src/production/pc'
import { Observer, observer } from 'mobx-react'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import React, { FC, useState } from 'react'
import type { FilterType } from '../../interface'
import store from '../../store'
import planStore from '@/pages/production/plan_management/plan/store'
import SearchFilter from './search_filter'

interface Props {
  onSearch: () => void
  refresh: () => void
  type?: ProduceType
}

const Filter: FC<Props> = ({ type, onSearch, refresh }) => {
  const isPack = type === ProduceType.PRODUCE_TYPE_PACK
  const [cascadedKey, setCascadedKey] = useState(0)
  const [moreVisible, setMoreVisible] = useState(false)
  const {
    filter: {
      state,
      target_customer_id,
      target_route_id,
      process_template_id,
      serial_no,
    },
    input_sku_ids_list,
    output_sku_ids_list,
    factoryModalList,
  } = store

  const handleRefresh = () => {
    refresh()
  }

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.updateFilter(key, value)
  }

  const handleInit = () => {
    store.resetFilter()
    setCascadedKey((v) => v + 1)
    onSearch()
  }

  const handleExport = () => {
    ExportProcessTask({ filter: store.getSearchTaskData(type) }).then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }

  return (
    <>
      <Flex
        justifyBetween
        alignCenter
        className='b-options-filter b-task-filter'
      >
        <Flex alignCenter className='gm-text-desc'>
          <SearchFilter
            value={{
              serial_no: serial_no!,
              input_sku_ids_list: input_sku_ids_list!,
              output_sku_ids_list: output_sku_ids_list!,
            }}
            type={type}
            onSearch={onSearch}
          />

          <div
            onClick={() => setMoreVisible(true)}
            className='gm-margin-right-15 gm-margin-left-15'
          >
            {t('更多筛选')}
          </div>
          <div onClick={handleInit}>{t('清空')}</div>
        </Flex>
        <div>
          <Button onClick={handleExport} className='gm-margin-right-15'>
            {t('导出')}
          </Button>
          <Button onClick={handleRefresh}>{t('刷新')}</Button>
        </div>
      </Flex>
      <Modal
        title={t('更多筛选')}
        visible={moreVisible}
        width='900px'
        destroyOnClose
        onCancel={() => setMoreVisible(false)}
        onOk={() => {
          onSearch()
          setMoreVisible(false)
        }}
      >
        <BoxForm labelWidth='108px' colWidth='385px'>
          <Row>
            <Col span={12} className='gm-margin-bottom-10'>
              <FormItem>
                <SearchFilter
                  value={{
                    serial_no: serial_no!,
                    input_sku_ids_list: input_sku_ids_list!,
                    output_sku_ids_list: output_sku_ids_list!,
                  }}
                  type={type}
                />
              </FormItem>
            </Col>
            <Col span={12} className='gm-margin-bottom-10'>
              <FormItem label={t('任务状态')}>
                <Select
                  all={{ value: 0 }}
                  data={list_ProcessTask_State}
                  value={state}
                  onChange={(value: number) =>
                    handleFilterChange('state', value)
                  }
                />
              </FormItem>
            </Col>
            <Col span={12} className='gm-margin-bottom-10'>
              <FormItem label={t('车间筛选')}>
                <Cascader
                  key={cascadedKey}
                  style={{ width: '100%' }}
                  multiple
                  value={store.factoryData}
                  options={factoryModalList}
                  placeholder={t('全部')}
                  maxTagCount={2}
                  maxTagTextLength={5}
                  onChange={(value: SingleValueType[]) => {
                    store.setfactoryData(value)
                    handleFilterChange('processor_ids', value)
                  }}
                />
              </FormItem>
            </Col>
            <Col span={12} className='gm-margin-bottom-10'>
              <ControlledFormItem label={t('需求备注')}>
                <Observer>
                  {() => {
                    const { batch } = store.filter
                    const produce_types = planStore.producePlanCondition
                      .isProduce
                      ? undefined
                      : ProduceType.PRODUCE_TYPE_PACK

                    return (
                      <BatchesSelector
                        production_order_id={
                          planStore.producePlanCondition.productionOrderId
                        }
                        produce_type={produce_types}
                        selected={batch}
                        onSelect={(selected) => {
                          handleFilterChange('batch', selected)
                        }}
                      />
                    )
                  }}
                </Observer>
              </ControlledFormItem>
            </Col>
            <Col span={12} className='gm-margin-bottom-10'>
              <FormItem label={t('客户筛选')}>
                <MoreSelect_Customer
                  params={{ level: 2, type: 2 }}
                  selected={target_customer_id}
                  renderListFilterType='pinyin'
                  onSelect={(value: MoreSelectDataItem<string>) =>
                    handleFilterChange('target_customer_id', value)
                  }
                  getResponseData={(data) => {
                    data.customers.unshift({
                      customer_id: '1',
                      name: t('无'),
                      type: 0,
                    })
                    return data.customers
                  }}
                  placeholder={t('全部')}
                />
              </FormItem>
            </Col>
            <Col>
              <FormItem label={t('线路筛选')}>
                <MoreSelect_Route
                  selected={target_route_id}
                  renderListFilterType='pinyin'
                  onSelect={(value: MoreSelectDataItem<string>) =>
                    handleFilterChange('target_route_id', value)
                  }
                  getResponseData={(data) => {
                    data.routes.unshift({
                      route_id: '1',
                      route_name: t('无'),
                    })
                    return data.routes
                  }}
                  getName={(item) => item.route_name!}
                  placeholder={t('全部')}
                />
              </FormItem>
            </Col>
            <Col span={12} className='gm-margin-button-10'>
              {!isPack && (
                <FormItem label={t('工序筛选')}>
                  <MoreSelect_ProcessTemplate
                    selected={process_template_id}
                    renderListFilterType='pinyin'
                    onSelect={(value: MoreSelectDataItem<string>) => {
                      handleFilterChange('process_template_id', value)
                    }}
                    placeholder={t('全部')}
                  />
                </FormItem>
              )}
            </Col>
          </Row>
        </BoxForm>
      </Modal>
    </>
  )
}

export default observer(Filter)
