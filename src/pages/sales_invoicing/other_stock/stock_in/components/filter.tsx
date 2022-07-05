import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  Input,
  FormItem,
  FormButton,
  Button,
  BoxFormMore,
  Select,
  Flex,
} from '@gm-pc/react'
import DateRangeFilter, {
  DRFOnChange,
} from '@/common/components/date_range_filter'

import { STOCK_PRINT_STATUS } from '@/pages/sales_invoicing/enum'
import store, { FilterType } from '../stores/store'
import stockStore from '../../../store'

import globalStore from '@/stores/global'
import { MoreSelect_GroupUser } from 'gm_api/src/enterprise/pc'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface InComing {
  onSearch: () => any
  loading: boolean
}

const dateFilterData = [
  {
    type: 1,
    name: '按建单时间',
    expand: false,
  },
  {
    type: 2,
    name: '按入库时间',
    expand: false,
  },
]

const Filter: FC<InComing> = observer((props) => {
  const { onSearch, loading } = props
  const {
    filter: {
      begin_time,
      end_time,
      time_type,
      q,
      is_printed,
      creator_ids,
      warehouse_id,
    },
  } = store

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    store.changeFilter(key, value)
  }
  const handleDateChange: DRFOnChange = (value) => {
    if (value.dateType) {
      handleFilterChange('time_type', value.dateType)
    }
    if (value.begin && value.end) {
      handleFilterChange('begin_time', value.begin)
      handleFilterChange('end_time', value.end)
    }
  }

  return (
    <BoxForm onSubmit={onSearch} labelWidth='100px' colWidth='385px'>
      <FormBlock col={3}>
        <FormItem>
          <DateRangeFilter
            data={dateFilterData}
            value={{
              begin: begin_time,
              end: end_time,
              dateType: time_type,
            }}
            enabledTimeSelect
            onChange={handleDateChange}
          />
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(e) => handleFilterChange('warehouse_id', e)}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={t('请输入其他入库单号')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={3}>
          <FormItem label={t('打印状态')}>
            <Select
              value={is_printed}
              data={STOCK_PRINT_STATUS}
              onChange={(e) => handleFilterChange('is_printed', e)}
            />
          </FormItem>
          <FormItem label={t('建单人')}>
            <MoreSelect_GroupUser
              multiple
              placeholder={t('请选择建单人')}
              selected={creator_ids}
              renderListFilterType='pinyin'
              onSelect={(selected) =>
                store.changeFilter('creator_ids', selected)
              }
              getName={(item) => item.name!}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Flex>
          <Button type='primary' htmlType='submit' disabled={loading}>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_EXPORT_OTHER_IN}
          >
            <Button onClick={handleExport}>{t('导出')}</Button>
          </PermissionJudge>
        </Flex>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
