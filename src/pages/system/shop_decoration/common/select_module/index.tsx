import React, { FC } from 'react'

import { SelectModuleProps } from '../interface'
import './style.less'

const SelectModule: FC<SelectModuleProps> = ({
  left,
  right,
  rightTitle,
  hideRight,
}) => {
  return (
    <div>
      {hideRight ? null : (
        <div className='module-right'>
          <div className='title'>{rightTitle}</div>
          {right}
        </div>
      )}
      {left}
    </div>
  )
}

export default SelectModule
