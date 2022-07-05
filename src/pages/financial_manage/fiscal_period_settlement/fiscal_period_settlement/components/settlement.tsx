import { formatDay } from '@/pages/sales_invoicing/util'
import {
  BoxForm,
  DatePicker,
  Flex,
  FormBlock,
  FormItem,
  Input,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Observer } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import React, { useEffect } from 'react'
import store from '../store'

const Settlement = observer(() => {
  const { begin_time, end_time, name, remark } = store.fiscal_list
  const handleRenderDate = (d: Date) => {
    if (end_time) {
      const begin = moment(d).format('YYYY-MM-DD')
      return begin
    }
    return '-'
  }

  useEffect(() => {
    store.init()
  }, [])

  return (
    <Flex className='gm-padding-left-15f' column>
      <BoxForm colWidth='385px' labelWidth='150px'>
        <FormBlock>
          <FormItem label={t('账期开始时间')}>
            <div className='gm-margin-top-10'>
              {t(`${begin_time ? formatDay(begin_time) : '-'}`)}
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-15'>
          <FormItem required label={t('账期结束时间')}>
            <Observer>
              {() => {
                return (
                  <DatePicker
                    date={
                      moment(end_time).startOf('day').format('YYYYMMDD') || null
                    }
                    max={new Date()}
                    onChange={(date) => {
                      store.updateFilter('end_time', moment(date))
                    }}
                    renderDate={handleRenderDate}
                    disabledClose
                    style={{ width: '100%' }}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-20'>
          <FormItem required label={t('账期名称')}>
            <Observer>
              {() => {
                return (
                  <Input
                    placeholder={t('输入账期名称')}
                    value={name}
                    onChange={(e) => store.updateFilter('name', e.target.value)}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-20'>
          <FormItem label={t('备注')}>
            <Observer>
              {() => {
                return (
                  <Input
                    value={remark}
                    onChange={(e) =>
                      store.updateFilter('remark', e.target.value)
                    }
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-20'>
          <FormItem>
            <div style={{ marginLeft: 15 }}>
              说明：首次结转时，账期开始时间默认取第一笔出入库业务完成时间
            </div>
          </FormItem>
        </FormBlock>
      </BoxForm>
    </Flex>
  )
})

export default Settlement
