import { Box, Form, FormItem, Input } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../stores/list_store'
import FilterButton from '@/common/components/filter_button'
import globalStore from '@/stores/global'

interface FilterProps {
  onSearch: () => any
}
const Filter: FC<FilterProps> = observer((props) => {
  const { onSearch } = props

  const handleExport = () => {
    store.export().then((json) => {
      globalStore.showTaskPanel()

      return json
    })
  }

  const handleChangeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    store.changeFilter('q', event.target.value)
  }

  return (
    <Box hasGap>
      <Form onSubmit={onSearch} inline>
        <FormItem label={t('搜索')}>
          <Input
            value={store.filter.q}
            onChange={handleChangeFilter}
            placeholder={t('请输入供应商编号、名称或电话')}
          />
        </FormItem>
        <FilterButton onExport={handleExport} />
      </Form>
    </Box>
  )
})

export default Filter
