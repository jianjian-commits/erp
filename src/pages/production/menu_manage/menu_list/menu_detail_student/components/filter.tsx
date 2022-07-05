import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import {
  BoxForm,
  FormItem,
  DateRangePicker,
  FormButton,
  Button,
} from '@gm-pc/react'

const Filter: FC<{ menu_id: string }> = observer(({ menu_id }) => {
  const { meal_date_start, meal_date_end } = store.filter
  const handleSearch = () => {
    Promise.all([store.fetchList(menu_id), store.fetchHolidayList()]).then(() =>
      store.generateMenuList(menu_id),
    )
  }

  const handleDateChange = (begin: Date, end: Date) => {
    if (begin && end) {
      store.changeFilter('meal_date_start', begin)
      store.changeFilter('meal_date_end', end)
    }
  }

  return (
    <BoxForm onSubmit={handleSearch}>
      <FormItem label={t('选择周期')}>
        <DateRangePicker
          begin={meal_date_start}
          end={meal_date_end}
          onChange={handleDateChange}
        />
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
