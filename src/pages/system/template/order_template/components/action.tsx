import React, { MouseEvent, FC } from 'react'
import { observer } from 'mobx-react'
import SvgPlus from '@/svg/plus.svg'
import SvgDelete from '@/svg/delete.svg'

interface ActionProps {
  onAdd: (e: MouseEvent<HTMLAnchorElement>) => void
  onDelete: (e: MouseEvent<HTMLAnchorElement>) => void
}

const Action: FC<ActionProps> = observer(({ onAdd, onDelete }) => {
  return (
    <>
      <a onClick={onAdd} className='gm-cursor'>
        <SvgPlus />
      </a>
      <a onClick={onDelete} className='gm-cursor gm-margin-left-5'>
        <SvgDelete />
      </a>
    </>
  )
})

export default Action
