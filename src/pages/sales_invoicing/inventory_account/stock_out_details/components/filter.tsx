import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  Flex,
  BoxForm,
  FormBlock,
  DateRangePicker,
  FormItem,
  FormButton,
  Button,
  Input,
  BoxFormMore,
  LevelSelect,
} from '@gm-pc/react'
import { CategoryFilter } from '@/common/components'
import { Select_Supplier, Select_Customer } from 'gm_api/src/enterprise/pc'

import { OPERATE_TYPE } from '@/pages/sales_invoicing/enum'
import type { FilterType } from '../types'
import { diffPlaceholderText } from '../../util'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import type { LevelProcess } from '@/pages/sales_invoicing/interface'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface ChangeFilter {
  orderType: number
  filter: any
  onChange: <T extends keyof FilterType>(key: T, value: FilterType[T]) => any
  onSearch: () => any
  onExport: () => any
  processorList?: LevelProcess[]
}

const Filter: FC<ChangeFilter> = observer((props) => {
  const { orderType, filter, onChange, onSearch, onExport, processorList } =
    props
  const {
    begin_time,
    end_time,
    q,
    // category_ids,
    target_id,
    processor_ids,
    warehouse_id,
  } = filter

  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    onChange(key, value)
  }
  const handleDateChange = (begin: Date, end: Date) => {
    if (begin && end) {
      handleFilterChange('begin_time', begin)
      handleFilterChange('end_time', end)
    }
  }
  const handleExport = () => {
    onExport().then((json: any) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm labelWidth='90px' onSubmit={onSearch} colWidth='420px'>
      <FormBlock col={3}>
        <FormItem label={t('出库时间')}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              placeholder={t('请选择仓库')}
              value={warehouse_id}
              onChange={(value: string) => {
                handleFilterChange('warehouse_id', value)
              }}
              style={{
                maxWidth: '100%',
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')} colWidth='420px'>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={diffPlaceholderText(orderType)}
            // placeholder={t(
            //   '请输入商品名称、商品编码、领料单号或领料出库单号搜索',
            // )}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('商品筛选')}>
            <CategoryFilter
              style={{
                width: '100%',
                height: '30px',
              }}
              onChange={(e) => handleFilterChange('category_id', e)}
            />
          </FormItem>
          {processorList && (
            <FormItem label={t('领用部门')}>
              <LevelSelect
                selected={processor_ids.slice()}
                placeholder={t('请选择领用部门')} // 需要更新组件库支持placeholder
                data={processorList.slice()}
                onSelect={(value) => {
                  handleFilterChange('processor_ids', value)
                }}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.refundOut && (
            <FormItem label={t('供应商')}>
              <Select_Supplier
                all={{ value: '0' }}
                value={target_id}
                onChange={(value: string) => {
                  handleFilterChange('target_id', value)
                }}
              />
            </FormItem>
          )}
          {orderType === OPERATE_TYPE.saleOut && (
            <FormItem label={t('客户')}>
              <Select_Customer
                params={{ level: 2 }}
                all={{ value: '0' }}
                value={target_id}
                onChange={(value: string) => {
                  handleFilterChange('target_id', value)
                }}
              />
            </FormItem>
          )}
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Flex>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_EXPORT_OUT_STOCK_LOG}
          >
            <Button onClick={handleExport}>{t('导出')}</Button>
          </PermissionJudge>
        </Flex>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
