import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Select,
  FormButton,
  Button,
} from '@gm-pc/react'

import { ExpectedType } from '../../enum'
import store, { FtType } from '../stores/inventory_store'

interface Props {
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

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props
  const {
    filter: { sku_unit_id, pending_type },
    unitList,
  } = store
  const handleFilterChange = <T extends keyof FtType>(
    key: T,
    value: FtType[T],
  ) => {
    store.handleChangeFilter(key, value)
  }

  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock>
        <FormItem label={t('规格')} colWidth='200px'>
          <Select
            all={{ value: '0' }}
            value={sku_unit_id!}
            data={unitList.slice()}
            onChange={(e) => handleFilterChange('sku_unit_id', e)}
            renderItem={renderItem}
          />
        </FormItem>
        <FormItem label={t('预期库存类型')} colWidth='200px'>
          <Select
            value={pending_type}
            data={ExpectedType}
            onChange={(e) => handleFilterChange('pending_type', e)}
          />
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
