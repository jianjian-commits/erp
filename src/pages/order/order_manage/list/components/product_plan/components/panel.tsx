import React, { ReactNode } from 'react'

export interface PanelProps {
  title: ReactNode
}

const PanelStyle = {
  width: '100%',
  height: '34px',
  background: '#EEF1F5',
  borderRadius: '2px',
  color: '#000',
  lineHeight: '34px',
  paddingLeft: '8px',
  marginBottom: '16px',
  fontWeight: 600,
}

const Panel = (props: PanelProps) => {
  const { title } = props
  return (
    <div style={PanelStyle} className='order-manage-list-panel'>
      {title}
    </div>
  )
}

export default Panel
