import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import store from '../store'
import { Modal, Select } from 'antd'
import _ from 'lodash'
import More_filter from '@/pages/production/plan_management/plan/produce/produce_recond/components/more_filter'
import '@/pages/production/plan_management/plan/style.less'
interface Props {
  onSearch: () => Promise<any>
}

const Filter: FC<Props> = ({ onSearch }) => {
  const [moreVisible, setMoreVisible] = useState(false)
  const handleSearch = () => {
    onSearch()
    setMoreVisible(false)
  }

  return (
    <>
      <Flex justifyBetween className='b-options-filter gm-margin-top-20'>
        <Flex alignCenter className='gm-text-desc gm-margin-left-20'>
          <Select
            className='gm-margin-right-15'
            style={{ minWidth: '200px' }}
            placeholder={t('输入成品名称搜索')}
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
              onSearch && onSearch()
            }}
          />
          <CategoryCascader
            multiple
            className='gm-margin-right-15'
            value={store.categoryIds}
            onChange={(value) => {
              store.setCategoryIds(value)
              const ids = value.map((id: any) => id[id.length - 1])
              store.updateFilter('category_ids', ids)
              handleSearch()
            }}
            showAdd={false}
            maxTagCount={2}
            maxTagTextLength={5}
            allowClear={false}
          />
          <div
            className='gm-margin-right-15 gm-text-desc b-button gm-text-14'
            onClick={() => setMoreVisible(true)}
          >
            {t('更多筛选')}
          </div>
          <div
            className='gm-text-desc b-button gm-text-14'
            onClick={() => {
              store.resetFilter()
              handleSearch()
            }}
          >
            {t('清空')}
          </div>
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
        <More_filter />
      </Modal>
    </>
  )
}

export default observer(Filter)
