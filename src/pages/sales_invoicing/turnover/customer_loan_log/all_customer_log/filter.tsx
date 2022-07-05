import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  FormButton,
  Button,
} from '@gm-pc/react'
import store from '../stores/all_customer_store'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = (props) => {
  const { onSearch } = props
  const {
    filter: { warehouse_id },
  } = store

  const handleExport = () => {
    store.export().then((json: any) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value) => {
                store.changeFilter('warehouse_id', value)
              }}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')} colWidth='400px'>
          <Input
            value={store.filter.q}
            onChange={(e) => {
              store.changeFilter('q', e.target.value)
            }}
            placeholder={t('输入客户名称或客户编码搜索')}
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
}

export default observer(Filter)
