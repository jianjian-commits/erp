import React, { FC, useRef } from 'react'
import { t } from 'gm-i18n'
import { RightSideModal } from '@gm-pc/react'

import _ from 'lodash'
import ScanInput from './scan_input'
import { ScanSearchType } from '../../interface'

interface Props {
  onSearch: ScanSearchType
}

const ScanDrawer: FC<Props> = (props) => {
  const scanRef = useRef<HTMLDivElement>(null)

  const handlePopupScan = () => {
    let marginTop = 0
    if (scanRef.current) marginTop = scanRef.current.offsetTop

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '260px', height: '42px', marginTop: marginTop },
      opacityMask: true,
      children: <ScanInput onSearch={props.onSearch} />,
      noCloseBtn: true,
    })
  }

  return (
    <div
      ref={scanRef}
      className='b-scan gm-border gm-padding-5'
      onClick={handlePopupScan}
    >
      {t('扫码')}
    </div>
  )
}

export default ScanDrawer
