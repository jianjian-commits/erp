import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, SelectDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { ListBatch } from 'gm_api/src/purchase'
import store from '../store'
import _ from 'lodash'

const initSelected = { value: '', text: t('全部计划波次') }

const PlanBatchSelector = () => {
  function handleChange(key: string, value: any) {
    store.updateFilter(key, value)
  }
  const [statuses, setStatuses] = useState<SelectDataItem[]>([])
  const [selected, setSelected] = useState(initSelected)
  const { batch_id } = store.filter

  useEffect(() => {
    ListBatch({
      filter_time_type: store.filter.dateType,
      begin_time: `${+store.filter.begin}`,
      end_time: `${+store.filter.end}`,
    }).then((json) => {
      setStatuses(
        json.response.batches!.map((v) => ({
          value: v.batch_id!,
          text: v.name!,
        })),
      )
      return json
    })
  }, [store.list])
  const data = [initSelected, ...statuses]
  useEffect(() => {
    setSelected(_.find(data, (d) => d.value === batch_id) || initSelected)
  }, [batch_id])
  return (
    <MoreSelect
      selected={selected}
      placeholder={t('全部计划波次')}
      disabledClose
      renderListFilterType='pinyin'
      data={data}
      onSelect={(v: any) => {
        handleChange('batch_id', v.value)
        setSelected(v)
      }}
    />
  )
}

export default observer(PlanBatchSelector)
