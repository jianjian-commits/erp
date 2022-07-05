import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormButton,
  Button,
  ControlledFormItem,
  FormBlock,
} from '@gm-pc/react'
import { Input } from 'antd'
import store from '../store'
import CategoryFilter from '@/common/components/category_filter'

interface FilterProps {
  onSearch: () => Promise<any>
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  return (
    <BoxForm>
      <FormBlock>
        <ControlledFormItem colWidth='200px'>
          <CategoryFilter
            placeholder={t('全部分类')}
            onChange={(category_id) => {
              store.updateFilter('category_id', category_id || '0')
            }}
          />
        </ControlledFormItem>
        <ControlledFormItem>
          <Input.Search
            placeholder={t('请输入商品名称/编码')}
            style={{ minWidth: 120 }}
            allowClear
            enterButton={t('搜索')}
            onChange={(e: any) => {
              store.updateFilter('search_text', e.target.value)
            }}
            onSearch={() => onSearch()}
          />
        </ControlledFormItem>
      </FormBlock>
      <FormButton btnPosition='right'>
        <Button type='default' onClick={() => store.exportSpecialBasicPrice()}>
          {t('导出')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
