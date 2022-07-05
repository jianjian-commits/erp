import React, { FC } from 'react'

const PaddingDiv: FC<{ padding?: string }> = ({
  padding = '6px',
  children,
}) => {
  return <div style={{ paddingTop: padding }}>{children}</div>
}

export default PaddingDiv
