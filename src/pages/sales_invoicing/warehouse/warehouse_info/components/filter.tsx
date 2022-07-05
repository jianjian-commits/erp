import React, { FC } from 'react'
import { t } from 'gm-i18n'
import FilterButton from '@/common/components/filter_button'
import {
  BoxForm,
  FormBlock,
  ControlledFormItem,
  Input,
  Select,
} from '@gm-pc/react'
import store from '../store'
import { USE_STATUS } from '@/pages/sales_invoicing/enum'
import { observer } from 'mobx-react'

type FilterProps = {
  onSearch: () => void
}

const Filter: FC<FilterProps> = observer(({ onSearch }) => {
  const {
    filter: { q, valid },
    changeFilter,
  } = store
  return (
    <BoxForm labelWidth='100px' colWidth='325px' inline onSubmit={onSearch}>
      <FormBlock col={3}>
        <ControlledFormItem label={t('使用状态')}>
          <Select
            value={valid}
            data={USE_STATUS}
            onChange={(value) => {
              store.changeFilter('valid', value)
            }}
          />
        </ControlledFormItem>
        <ControlledFormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => {
              changeFilter('q', e.target.value)
            }}
            placeholder={t('请输入仓库名称/编码')}
          />
        </ControlledFormItem>
      </FormBlock>
      <FilterButton loading={false} />
    </BoxForm>
  )
})

export default Filter
