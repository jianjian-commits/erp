import React, { FC, ImgHTMLAttributes } from 'react'
import { useBoolean } from '@/common/hooks'
import classNames from 'classnames'
import SvgRemove from '@/svg/remove.svg'
import './index.less'

export interface ZImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  defaultSrc?: string
}
export const ZImage: FC<ZImageProps> = ({
  defaultSrc,
  className,
  width,
  height = width,
  ...res
}) => {
  // 是否放大
  const { state: isAmplify, toggle } = useBoolean()
  // 放大图片
  return (
    <>
      <img
        {...res}
        src={defaultSrc || res.src}
        width={width}
        height={height}
        onClick={toggle}
        className={classNames('b-z-image-default', className)}
      />
      {isAmplify && (
        <div className='b-z-image-modal'>
          <img {...res} />
          <SvgRemove onClick={toggle} />
        </div>
      )}
    </>
  )
}
