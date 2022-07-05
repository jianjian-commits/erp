import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { Select, Modal, Dropdown, Menu, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'
import _ from 'lodash'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import store from '../store'
import MoreFilter from './more_filter'
import {
  ListTaskInputRequest_ViewType,
  ExportMaterialOrderDetail,
  ExportTaskInput,
  ListTaskInputRequest,
} from 'gm_api/src/production'
import globalStore from '@/stores/global'
import planStore from '@/pages/production/plan_management/plan/store'

const { Option } = Select

const Filter: FC<{ onSearch(): void; refresh(): void }> = ({
  onSearch,
  refresh,
}) => {
  const [moreVisible, setMoreVisible] = useState(false)

  const handleRefresh = () => {
    refresh()
  }

  const handleSearch = () => {
    onSearch()
    setMoreVisible(false)
  }

  const handleViewChange = (value: ListTaskInputRequest_ViewType) => {
    store.updateFilter('view_type', value)
    onSearch()
  }

  const exportOrderDetail = () => {
    const filter = {
      production_order_ids: [planStore.producePlanCondition.productionOrderId],
      paging: { limit: 999 },
    }
    return ExportMaterialOrderDetail({ filter }).then((res) => {
      globalStore.showTaskPanel()
      return res.response
    })
  }

  const exportTaskInput = () => {
    const filter = {
      ...store.filter,
      paging: { limit: 999 },
    } as ListTaskInputRequest
    return ExportTaskInput({ filter }).then((res) => {
      globalStore.showTaskPanel()
      return res.response
    })
  }

  return (
    <div className='b-options-filter'>
      <Flex justifyBetween alignCenter>
        <Flex alignCenter className='b-filter-search'>
          {/* <MoreSelect
            className='tw-ml-3'
            style={{ minWidth: '200px', maxWidth: '400px' }}
            placeholder={t('请输入物料名称')}
            multiple
            data={store.skuList}
            selected={store.sku}
            onSearch={(q: string) => store.fetchSkuList(q)}
            onSelect={(select?: MoreSelectDataItem<string>[]) => {
              store.setSku(select)
              const sku_ids = _.map(select, (e) => e.value)
              store.updateFilter('sku_ids', sku_ids)
              handleSearch()
            }}
          /> */}
          <Select
            className='tw-mr-3'
            style={{ minWidth: '200px' }}
            placeholder={t('请输入物料名称')}
            mode='multiple'
            showSearch
            maxTagCount={2}
            maxTagTextLength={5}
            value={store.sku}
            options={store.skuList}
            filterOption={false}
            onSearch={_.debounce((q: string) => store.fetchSkuList(q), 500)}
            onChange={(select: string[], option) => {
              store.setSku(option)
              store.updateFilter('sku_ids', select)
              handleSearch()
            }}
          />
          <CategoryCascader
            multiple
            className='tw-mr-3'
            value={store.categoryIds}
            onChange={(value) => {
              store.setCategoryIds(value)
              const ids = value.map((id: any) => id[id.length - 1])
              store.updateFilter('category_ids', ids)
              handleSearch()
            }}
            maxTagCount={2}
            maxTagTextLength={5}
            allowClear={false}
          />
          <div
            className='tw-mr-3 gm-text-desc b-button'
            onClick={() => setMoreVisible(true)}
          >
            {t('更多筛选')}
          </div>
          <div
            className='gm-text-desc b-button tw-mr-3'
            onClick={() => {
              store.resetFilter()
              store.initSelectedData()
              handleSearch()
            }}
          >
            {t('清空')}
          </div>
        </Flex>
        <Flex alignCenter>
          <Select
            value={store.filter.view_type}
            style={{ width: '160px' }}
            onChange={handleViewChange}
            className='tw-mr-3'
          >
            <Option value={ListTaskInputRequest_ViewType.VIEW_TYPE_CATEGORY}>
              <Flex alignCenter>
                <span>{t('按原料查看')}</span>
              </Flex>
            </Option>
            <Option
              value={ListTaskInputRequest_ViewType.VIEW_TYPE_MATERIAL_ORDER}
            >
              <Flex alignCenter>
                <span>{t('按领料单查看')}</span>
              </Flex>
            </Option>
          </Select>
          <Dropdown.Button
            className='gm-margin-right-15'
            icon={<DownOutlined />}
            onClick={exportTaskInput}
            overlay={
              <Menu>
                <Menu.Item key='detail' onClick={exportOrderDetail}>
                  {t('领料单详情导出')}
                </Menu.Item>
              </Menu>
            }
          >
            {t('导出')}
          </Dropdown.Button>
          <Button onClick={handleRefresh}>{t('刷新')}</Button>
        </Flex>
      </Flex>
      <Modal
        title={t('更多筛选')}
        visible={moreVisible}
        width='900px'
        destroyOnClose
        onCancel={() => setMoreVisible(false)}
        onOk={handleSearch}
      >
        <MoreFilter />
      </Modal>
    </div>
  )
}

export default observer(Filter)
