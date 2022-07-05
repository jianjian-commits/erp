import React, { FC, ReactNode } from 'react'
import { Popover } from '@gm-pc/react'
import SvgWarningCircle from '@/svg/warning_circle.svg'

interface Props {
  popup: (() => ReactNode) | ReactNode
  right?: boolean
  top?: boolean
  showArrow?: boolean
}

const WarningPopover: FC<Props> = ({
  popup,
  right = true,
  showArrow = true,
  ...rest
}) => {
  return (
    <Popover showArrow={showArrow} type='hover' popup={popup} right={right}>
      <span {...rest}>
        <SvgWarningCircle style={{ color: 'red' }} />
      </span>
    </Popover>
  )
}

export default WarningPopover
