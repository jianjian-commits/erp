import React, { useMemo, ReactElement } from 'react'
import { t } from 'gm-i18n'
import SummaryTitle from '../components/summary_title'
import SourceItem from '../components/source_item'
import { BoxPanel } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { TaskSource_SourceType } from 'gm_api/src/production'
import { sourceType } from '../../enum'
import store from '../store'
import _ from 'lodash'

const PlanSource = () => {
  const { task_sources_group } = store.taskDetails

  const sourceItem = useMemo(() => {
    const item: ReactElement[] = []
    _.each(task_sources_group, (_, key) => {
      const typeData = sourceType[+key as unknown as TaskSource_SourceType]
      item.push(
        <BoxPanel title={t(typeData!.text!)} collapse>
          <SourceItem
            task={{ [typeData?.type!]: true }}
            sourceType={+key as unknown as TaskSource_SourceType}
          />
        </BoxPanel>,
      )
    })
    return item
  }, [task_sources_group])

  return (
    <div className='b-cancel-box-top'>
      {/* <SummaryTitle />  来源合并在放开 */}
      {_.map(sourceItem, (v) => v)}
    </div>
  )
}

export default observer(PlanSource)
