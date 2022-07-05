import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  FormButton,
  Button,
} from '@gm-pc/react'
import { CategoryFilter } from '@/common/components'

import store, { FtType } from '../store'
import globalStore from '@/stores/global'
import Select_Warehouse_Default from '@/common/components/select_warehouse'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { q, warehouse_id },
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
      return json.response
    })
  }

  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock col={3}>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('选择仓库')}>
            <Select_Warehouse_Default
              all
              value={warehouse_id}
              onChange={(value: string) =>
                handleFilterChange('warehouse_id', value)
              }
              placeholder={t('请选择仓库')}
            />
          </FormItem>
        )}

        <FormItem label={t('商品类型')} colWidth='400px'>
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
            placeholder={t('输入商品名字，商品自定义编码或批次号搜索')}
          />
        </FormItem>
      </FormBlock>
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
