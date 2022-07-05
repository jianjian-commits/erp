import React, { FC } from 'react'
import { t } from 'gm-i18n'
import _, { sortedIndex } from 'lodash'
import { observer } from 'mobx-react'
import {
  BoxForm,
  FormBlock,
  FormItem,
  DateRangePicker,
  FormButton,
  Button,
} from '@gm-pc/react'
import store from '../stores/customer_store'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { OperateType } from 'gm_api/src/inventory'
import { Select_OperateType } from 'gm_api/src/inventory/pc'
import globalStore from '@/stores/global'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = (props) => {
  const { onSearch } = props
  const { begin_time, end_time, operate_types } = store.filter

  const handleChangeDate = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      store.changeFilter('begin_time', begin_time)
      store.changeFilter('end_time', end_time)
    }
  }

  const handleExport = () => {
    store.export().then((json: any) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  return (
    <BoxForm onSubmit={onSearch}>
      <FormBlock>
        <FormItem label={t('操作时间')} colWidth='350px'>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            enabledTimeSelect
            onChange={handleChangeDate}
          />
        </FormItem>
        <FormItem label={t('操作类型')} colWidth='400px'>
          <Select_OperateType
            all={{ value: 0 }}
            value={operate_types}
            onChange={(v: number) => {
              store.changeFilter('operate_types', v)
            }}
            enumFilter={(data: MoreSelectDataItem<number>[]) =>
              _.filter(data, ({ value }) =>
                [
                  OperateType.OPERATE_TYPE_TURNOVER_LOAN,
                  OperateType.OPERATE_TYPE_TURNOVER_REVERT,
                ].includes(value),
              )
            }
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
