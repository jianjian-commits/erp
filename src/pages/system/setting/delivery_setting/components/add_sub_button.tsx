import React, { FC } from 'react'

import SVGPlusSquare from '@/svg/plus-square.svg'
import SVGMinusSquare from '@/svg/minus-square.svg'

interface AddSubButtonType {
  onAddRow?(): void
  onDeleteRow?(): void
}

const AddSubButton: FC<AddSubButtonType> = ({ onAddRow, onDeleteRow }) => {
  return (
    <>
      <span
        onClick={onAddRow}
        className='tw-mr-3 tw-cursor-pointer'
        style={{ color: 'var(--gm-color-primary)' }}
      >
        <SVGPlusSquare className='tw-w-5 tw-h-5' />
      </span>
      <span
        onClick={onDeleteRow}
        className='tw-mr-3 tw-cursor-pointer'
        style={{ color: 'var(--gm-color-danger)' }}
      >
        <SVGMinusSquare className='tw-w-5 tw-h-5' />
      </span>
    </>
  )
}

export default AddSubButton
