import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Select,
  Input,
  FormButton,
  Button,
  BoxFormMore,
} from '@gm-pc/react'
import { CategoryFilter } from '@/common/components'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'

import { SKU_HEALTH, SKU_TYPE } from '@/pages/sales_invoicing/enum'
import store, { FtType } from '../stores/store'
import globalStore from '@/stores/global'
import Select_Warehouse_Default from '@/common/components/select_warehouse'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props

  const {
    filter: {
      q,
      sku_type,
      expire_type,
      not_package_sub_sku_type,
      warehouse_ids,
    },
  } = store
  const handleFilterChange = <T extends keyof FtType>(
    key: T,
    value: FtType[T],
  ) => {
    store.handleChangeFilter(key, value)
  }

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock col={3}>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库选择')} colWidth='400px'>
            <Select_Warehouse_Default
              all
              value={warehouse_ids}
              onChange={(value: string) => {
                handleFilterChange('warehouse_ids', value)
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('商品筛选')} colWidth='400px'>
          <CategoryFilter
            placeholder='全部分类'
            onChange={(e) => handleFilterChange('category_id', e)}
          />
        </FormItem>

        <FormItem label={t('搜索')} colWidth='400px'>
          <Input
            value={q}
            onChange={(e) => {
              handleFilterChange('q', e.target.value)
            }}
            placeholder={t('输入商品名字或编号搜索')}
          />
        </FormItem>
      </FormBlock>
      {!globalStore.isLite && (
        <BoxFormMore>
          <FormBlock col={3}>
            <FormItem label={t('是否包材')}>
              <Select
                value={sku_type}
                data={SKU_TYPE}
                onChange={(e) => handleFilterChange('sku_type', e)}
              />
            </FormItem>
            <FormItem label={t('到期状态')}>
              <Select
                value={expire_type}
                data={SKU_HEALTH}
                onChange={(e) => handleFilterChange('expire_type', e)}
              />
            </FormItem>
            <FormItem label={t('商品类型')}>
              <Select
                all
                data={list_Sku_NotPackageSubSkuType}
                value={not_package_sub_sku_type}
                onChange={(value) =>
                  handleFilterChange('not_package_sub_sku_type', value)
                }
              />
            </FormItem>
          </FormBlock>
        </BoxFormMore>
      )}
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <div className='gm-gap-10' />
        <Button onClick={handleExport}>{t('导出')}</Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
