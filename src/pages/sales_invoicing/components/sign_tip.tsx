import React, { FC } from 'react'

interface Props {
  text: string
}

const SignTip: FC<Props> = (props) => {
  return (
    <span
      style={{
        border: '1px solid #798294',
        borderRadius: '2px',
        marginLeft: '5px',
        padding: '2px',
        color: 'var(--gm-color-desc)',
      }}
    >
      {props.text}
    </span>
  )
}

export default SignTip
