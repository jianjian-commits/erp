import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { FormButton, Button, Flex, BoxForm, FormItem } from '@gm-pc/react'

import scheduleStore from '../store'

import SvgNext from '@/svg/next.svg'
import { Filter } from '../interface'
import ServiceDatePicker from '@/common/components/service_data_picker'
import { history } from '@/common/service'

interface SearchFilterProps {
  onSearch: () => void
}

const SearchFilter: FC<SearchFilterProps> = ({ onSearch }) => {
  // 选择日期
  const handleDateChange = (service_period_id: string, receive_date: Date) => {
    handleFilterChange('service_period_id', service_period_id)
    handleFilterChange('receive_date', receive_date)
  }

  const handleFilterChange = (name: keyof Filter, value: any) => {
    scheduleStore.setFilter(name, value)
  }

  const handleSearch = () => {
    onSearch()
  }

  // 运营时间需要请求后台，等待运营时间接口完成后再搜索
  const handleInit = (service_period_id: string, receive_date: Date) => {
    if (service_period_id !== '' && receive_date) {
      handleDateChange(service_period_id, receive_date)
      onSearch()
    }
  }

  const handleScreening = () => {
    history.push({
      pathname: '/sorting/schedule/full_screen',
      query: scheduleStore.filter,
    })
  }

  const { service_period_id, receive_date } = scheduleStore.filter

  return (
    <BoxForm inline btnPosition='left' onSubmit={handleSearch}>
      <FormItem col={2} label={t('运营时间')}>
        <ServiceDatePicker
          onChange={handleDateChange}
          onInit={handleInit}
          date={receive_date}
          service_period_id={service_period_id}
        />
      </FormItem>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
      <Flex flex justifyEnd>
        <Button type='primary' plain onClick={handleScreening}>
          {t('投屏模式')}&nbsp;
          <SvgNext />
        </Button>
      </Flex>
    </BoxForm>
  )
}

export default observer(SearchFilter)
