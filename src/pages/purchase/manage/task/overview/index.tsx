import React from 'react'
import { t } from 'gm-i18n'
import { RightSideModal } from '@gm-pc/react'
import globalStore from '@/stores/global'
import OverView from './overview'

const handleOverviewShow = () => {
  RightSideModal.render({
    children: <OverView />,
    noCloseBtn: true,
    onHide: RightSideModal.hide,
    opacityMask: true,
    style: {
      width: '300px',
    },
  })
}

const type = 'purchase_task'

export const registerOverview = () => {
  globalStore.registerAnchors({
    type,
    node: () => (
      <div className='b-anchor-item gm-padding-5' onClick={handleOverviewShow}>
        {t('总览')}
      </div>
    ),
  })
}

export const offOverview = () => globalStore.offAnchor(type)
