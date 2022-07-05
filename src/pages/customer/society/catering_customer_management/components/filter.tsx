import { t } from 'gm-i18n'
import React, { FC, ChangeEvent, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  Select,
  Input,
} from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'
import {
  Select_GroupUser,
  Select_CustomerLabel,
  Select_ServicePeriod,
} from 'gm_api/src/enterprise/pc'

import store from '../store'
import { FrozenType, WhitelistType, CreditType } from '../../../enum'
import { DataAddress } from '@gm-pc/business'
import { FilterOptions } from '../type'
import globalStore from '@/stores/global'
import { BatchExportCustomer, Customer_Type } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Quotation_Type } from 'gm_api/src/merchandise'
import { MoreSelect_QuotationV2 } from '@/common/components'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  const {
    filter: {
      search_text,
      quotation_ids,
      service_period_ids,
      credit_types,
      is_frozen,
      is_in_whitelist,
      create_group_user_ids,
      sales_group_user_ids,
      customer_label_ids,
      city_id,
      district_id,
      street_id,
      warehouse_ids,
    },
    getWarehouselist,
  } = store
  const handleSearch = (): void => {
    onSearch()
  }

  const handleSelectChange = <T extends keyof FilterOptions>(
    value: FilterOptions[T],
    key: T,
  ): void => {
    store.updateFilter(value, key)
  }

  const handleMoreSelect = <T extends keyof FilterOptions>(
    value: FilterOptions[T],
    key: T,
  ): void => {
    store.updateFilter(value, key)
  }

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof FilterOptions,
  ): void => {
    const value = event.target.value.trim()
    store.updateFilter(value, key)
  }

  const handleExport = (): void => {
    BatchExportCustomer(
      globalStore.isLite
        ? {
            customer_type: Customer_Type.TYPE_SOCIAL,
          }
        : undefined,
    ).then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  const handleReset = (): void => {
    store.reset()
  }
  return (
    <BoxForm labelWidth='65px' onSubmit={handleSearch}>
      <FormBlock col={3}>
        {!globalStore.isLite && (
          <FormItem label={t('报价单')}>
            <MoreSelect_QuotationV2
              selected={quotation_ids}
              onSelect={(select: MoreSelectDataItem<string>) =>
                handleMoreSelect(
                  select || { text: t('全部报价单'), value: '' },
                  'quotation_ids',
                )
              }
              getResponseData={(res) =>
                _.filter(res.quotations, (item) => item.inner_name)
              }
              getName={(item) => item.inner_name!}
              params={{
                filter_params: {
                  parent_quotation_ids: ['0'],
                  quotation_types: [
                    Quotation_Type.WITHOUT_TIME,
                    Quotation_Type.PERIODIC,
                  ],
                },
              }}
            />
          </FormItem>
        )}
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('发货仓库')}>
            <Select_WareHouse_Default
              all
              getListData={getWarehouselist}
              value={warehouse_ids || 0}
              onChange={(value: string) => {
                handleSelectChange(value, 'warehouse_ids')
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            placeholder={t('输入客户名称，编码，ID进行搜索')}
            value={search_text}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange(e, 'search_text')
            }
          />
        </FormItem>
      </FormBlock>
      {!globalStore.isLite && (
        <BoxFormMore>
          <FormBlock col={3}>
            <FormItem label={t('运营时间')}>
              <Select_ServicePeriod
                all={{ value: '' }}
                value={service_period_ids}
                onChange={(value: string) =>
                  handleSelectChange(value, 'service_period_ids')
                }
              />
            </FormItem>
            <FormItem label={t('地理标签')}>
              {globalStore.stationInfo.attrs?.available_city_ids && (
                <DataAddress
                  city_ids={globalStore.stationInfo.attrs?.available_city_ids!}
                  selected={{ city_id, district_id, street_id }}
                  onSelect={(selected) => {
                    handleSelectChange(selected.city_id, 'city_id')
                    handleSelectChange(selected.district_id, 'district_id')
                    handleSelectChange(selected.street_id, 'street_id')
                  }}
                />
              )}
            </FormItem>
            <FormItem label={t('结款周期')}>
              <Select
                data={CreditType}
                value={credit_types}
                onChange={(value: number) =>
                  handleSelectChange(value, 'credit_types')
                }
              />
            </FormItem>
            <FormItem label={t('客户标签')}>
              <Select_CustomerLabel
                all={{ value: '' }}
                value={customer_label_ids}
                onChange={(value: string) =>
                  handleSelectChange(value, 'customer_label_ids')
                }
              />
            </FormItem>
            <FormItem label={t('销售经理')}>
              <Select_GroupUser
                all={{ value: '' }}
                value={sales_group_user_ids}
                onChange={(value: string) => {
                  handleSelectChange(value, 'sales_group_user_ids')
                }}
              />
            </FormItem>
            <FormItem label={t('开户经理')}>
              <Select_GroupUser
                all={{ value: '' }}
                value={create_group_user_ids}
                onChange={(value: string) => {
                  handleSelectChange(value, 'create_group_user_ids')
                }}
              />
            </FormItem>
            <FormItem label={t('冻结状态')}>
              <Select
                data={FrozenType}
                value={is_frozen}
                onChange={(value: number) => {
                  handleSelectChange(value, 'is_frozen')
                }}
              />
            </FormItem>
            <FormItem label={t('白名单')}>
              <Select
                data={WhitelistType}
                value={is_in_whitelist}
                onChange={(value: number) => {
                  handleSelectChange(value, 'is_in_whitelist')
                }}
              />
            </FormItem>
          </FormBlock>
        </BoxFormMore>
      )}
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        {!globalStore.isLite && (
          <BoxFormMore>
            <Button className='gm-margin-left-10' onClick={handleReset}>
              {t('重置')}
            </Button>
          </BoxFormMore>
        )}
        <Button className='gm-margin-left-10' onClick={handleExport}>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
