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
  Modal,
} from '@gm-pc/react'
import globalStore from '@/stores/global'

const Filter: FC = observer(() => {
  const { menu_from_time, menu_to_time } = store.filter
  const handleSearch = () => store.fetchList()

  const handleDateChange = (begin: Date, end: Date) => {
    if (begin && end) {
      store.changeFilter('menu_from_time', '' + begin)
      store.changeFilter('menu_to_time', '' + end)
    }
  }

  const handleExport = () => {
    store.export().then(() => {
      globalStore.showTaskPanel()
      return null
    })
  }
  return (
    <BoxForm onSubmit={handleSearch}>
      <FormItem label={t('选择周期')}>
        <DateRangePicker
          begin={menu_from_time}
          end={menu_to_time}
          onChange={handleDateChange}
        />
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        <Button className='gm-margin-left-5' onClick={handleExport}>
          导出
        </Button>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
