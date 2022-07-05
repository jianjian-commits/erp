import React from 'react'
import { observer } from 'mobx-react'
import productDefaultImg from '@/img/product-default-gm.png'

const CellImage = (props: { img: string }) => {
  return (
    <img
      className='gm-border'
      src={props.img || productDefaultImg}
      style={{
        width: '40px',
        height: '40px',
      }}
    />
  )
}

export default observer(CellImage)
