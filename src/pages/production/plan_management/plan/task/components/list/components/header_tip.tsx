import React, { FC, ReactNode } from 'react'
import { Popover, PopoverProps } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
interface HeaderTipProps extends PopoverProps {
  header?: ReactNode
  tip?: ReactNode
}

const HeaderTip: FC<HeaderTipProps> = ({ header, tip, ...rest }) => {
  return (
    <>
      {header && header}
      {tip && (
        <Popover placement='bottom' content={tip} zIndex={2000} {...rest}>
          <QuestionCircleOutlined
            className='gm-margin-left-5'
            style={{ color: '#8C8C8C' }}
          />
        </Popover>
      )}
    </>
  )
}

export default HeaderTip
