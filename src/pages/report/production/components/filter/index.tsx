import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, Button } from '@gm-pc/react'

import SVGNext from '@/svg/next.svg'
import DateFilter from './date_filter'

interface FilterProps {
  begin: Date
  end: Date
  onSearch: () => void
  onDateChange: (selected: { begin: Date; end: Date }) => void
  onFullScreen: () => void
}

const Filter: FC<FilterProps> = ({
  begin,
  end,
  onSearch,
  onDateChange,
  onFullScreen,
}) => {
  const handleDatePicker = (begin: Date, end: Date) => {
    onDateChange({ begin, end })
  }

  return (
    <Flex alignCenter>
      <Flex flex>
        <DateFilter
          begin={begin}
          end={end}
          onChange={(begin: Date, end: Date) => handleDatePicker(begin, end)}
          onSearch={onSearch}
        />
      </Flex>
      <Flex justifyEnd className='gm-margin-right-20'>
        <Button type='primary' plain onClick={onFullScreen}>
          {t('投屏模式')}
          <SVGNext />
        </Button>
      </Flex>
    </Flex>
  )
}

export default observer(Filter)
