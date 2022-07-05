import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel } from '@gm-pc/react'
import Summary from './summary'
import Operation from './operation'
import store from '../store'
import { isValidOrderTime } from '@/pages/order/util'
import globalStore from '@/stores/global'

const Panel: FC = ({ children }) => {
  const { service_period_id, view_type, service_period, repair } = store.order
  if (
    view_type === 'create' &&
    (!service_period_id ||
      (!repair && service_period && !isValidOrderTime(service_period)))
  )
    return null
  return (
    <BoxPanel
      title={globalStore.isLite ? t('订单明细') : ''}
      summary={<Summary />}
      right={<Operation />}
      {...(globalStore.isLite ? { collapse: true } : {})}
    >
      {children}
    </BoxPanel>
  )
}

export default observer(Panel)
