import React, { FC, useState, useEffect } from 'react'
import classNames from 'classnames'
import './style.less'
import productDefaultImg from '@/img/product-default-gm.png'
import { imageDomain } from '@/common/service'

interface ProductImageProps {
  /** 后台图片url 无需拼接 */
  url: string
  style?: {}
  width?: number | string
  height?: number | string
}

/** 商品图片 */
const ProductImage: FC<ProductImageProps> = (props) => {
  const { url, width, height, style, ...res } = props
  const imageUrl = url && imageDomain + url + '?imageView2/3/w/60'
  const [src, changeSrc] = useState(imageUrl || productDefaultImg)

  useEffect(() => {
    changeSrc(imageUrl || productDefaultImg)
  }, [url])

  const onError = () => {
    changeSrc(productDefaultImg)
  }

  return (
    <>
      <img
        {...res}
        src={src}
        width={width}
        height={height}
        style={{ borderRadius: '2px', ...style }}
        onError={onError}
        data-id='initMatchImagesImage'
        className={classNames('b-product-image-default')}
      />
    </>
  )
}

export default ProductImage
