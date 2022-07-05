import React, { FC, ReactElement } from 'react'
import { HintType } from '../interface'
import _ from 'lodash'

const Hint: FC<HintType> = ({ className = 'gm-text-desc', text }) => {
  return <div className={className}>{text}</div>
}

const MapHint = (data: HintType[]): ReactElement => {
  return (
    <>
      {_.map(data, ({ text, className }) => (
        <Hint text={text} className={className} />
      ))}
    </>
  )
}

export { MapHint, Hint }
