import PermissionButton from '@/common/components/permission_button'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { Flex } from '@gm-pc/react'
import { Button, Modal } from 'antd'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import planStore from '../../store'
import store from '../store'
import MoreFilter from './more_filter'
import SelectName from './select_name'
interface Props {
  onSearch: () => Promise<any>
  refresh: () => void
}

const Filter: FC<Props> = ({ onSearch, refresh }) => {
  const { isProduce, productionOrderId } = planStore.producePlanCondition
  const [moreVisible, setMoreVisible] = useState(false)
  const handleSearch = () => {
    onSearch()
    setMoreVisible(false)
  }
  const handleRefresh = () => {
    refresh()
  }

  return (
    <>
      <Flex justifyBetween className='b-options-filter'>
        <Flex alignCenter className='gm-text-desc'>
          <SelectName isProduce={isProduce} onSearch={onSearch} />
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
            className='gm-margin-right-10 gm-text-desc b-button'
            onClick={() => setMoreVisible(true)}
          >
            {t('更多筛选')}
          </div>
          <div
            className='gm-text-desc b-button '
            onClick={() => {
              store.resetFilter()
              handleSearch()
            }}
          >
            {t('清空')}
          </div>
        </Flex>
        <div>
          <PermissionButton
            className='tw-mr-3'
            permission={
              Permission.PERMISSION_PRODUCTION_LIST_PROCESSTASKOUTPUTLOG
            }
            onClick={() => {
              window.open(
                `#/production/plan_management/plan/produce/produce_recond?productionOrderId=${productionOrderId}`,
              )
            }}
          >
            {t('产出记录')}
          </PermissionButton>
          <Button onClick={handleRefresh}>{t('刷新')}</Button>
        </div>
      </Flex>
      <Modal
        title={t('更多筛选')}
        visible={moreVisible}
        width='900px'
        destroyOnClose
        onCancel={() => setMoreVisible(false)}
        onOk={handleSearch}
      >
        <MoreFilter isProduce={isProduce} />
      </Modal>
    </>
  )
}

export default observer(Filter)
