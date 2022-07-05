import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  DateRangePicker,
  Select,
  Input,
  FormButton,
  Button,
  BoxFormMore,
  LevelSelect,
} from '@gm-pc/react'

import store, { FtType } from '../stores/storage_store'
import { QuantityFilter } from '../../enum'
import { SKU_HEALTH } from '@/pages/sales_invoicing/enum'
import globalStore from '@/stores/global'
import Select_Warehouse_Default from '@/common/components/select_warehouse'

interface Query {
  onSearch: () => any
}

const renderItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.isVirtualBase && (
        <span
          style={{
            border: '1px solid #798294',
            borderRadius: '2px',
            display: 'inline-block',
            marginLeft: '5px',
            padding: '2px',
            color: 'var(--gm-color-desc)',
          }}
        >
          {t('基本单位')}
        </span>
      )}
    </div>
  )
}

const Filter: FC<Query> = observer((props) => {
  const { onSearch } = props
  const {
    filter: {
      begin_time,
      end_time,
      q,
      shelf_ids,
      remaining,
      sku_unit_id,
      expire_type,
      warehouse_id,
    },
    shelfList,
    unitList,
  } = store
  const handleFilterChange = <T extends keyof FtType>(
    key: T,
    value: FtType[T],
  ) => {
    store.handleChangeFilter(key, value)
  }
  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      handleFilterChange('begin_time', begin_time)
      handleFilterChange('end_time', end_time)
    }
  }

  return (
    <BoxForm onSubmit={onSearch} labelWidth='65px' colWidth='350px'>
      <FormBlock col={3}>
        <FormItem label={t('入库时间')}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        <FormItem label={t('选择仓库')}>
          <Select_Warehouse_Default
            value={warehouse_id}
            onChange={(value) => {
              handleFilterChange('warehouse_id', value as string)
            }}
          />
        </FormItem>
        {!globalStore.isLite && (
          <FormItem label={t('到期状态')}>
            <Select
              value={expire_type}
              data={SKU_HEALTH}
              onChange={(e) => handleFilterChange('expire_type', e)}
            />
          </FormItem>
        )}
        {/* <FormItem label={t('规格')}>
          <Select
            all={{ value: '0' }}
            value={sku_unit_id}
            data={unitList.slice()}
            onChange={(e) => handleFilterChange('sku_unit_id', e)}
            renderItem={renderItem}
          />
        </FormItem> */}
      </FormBlock>
      <FormBlock col={3} className='gm-margin-top-10'>
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={t('请输入批次号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('批次')}>
            <Select
              value={remaining}
              data={QuantityFilter}
              onChange={(e) => handleFilterChange('remaining', e)}
            />
          </FormItem>
          <FormItem label={t('货位')}>
            <LevelSelect
              selected={shelf_ids}
              data={shelfList.slice()}
              onSelect={(e) => {
                handleFilterChange('shelf_ids', e)
              }}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Button type='primary' htmlType='submit' className='gm-margin-top-10'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
