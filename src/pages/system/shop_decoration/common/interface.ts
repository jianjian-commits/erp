import { SwitchProps, UploaderFile } from '@gm-pc/react'
import { ShopLayout_Banner, Shop_Type } from 'gm_api/src/preference'
import { Image } from 'gm_api/src/common'
import { HTMLAttributes } from 'react'

export interface BSwitchProps extends SwitchProps {
  tip?: string
}

export interface SwiperProps extends HTMLAttributes<HTMLDivElement> {
  size: number
  width: number
  delay?: number
  renderItem(...args: any[]): any
}

export interface SelectModuleProps {
  left: JSX.Element
  right: JSX.Element
  rightTitle: string
  hideRight?: boolean
}

export interface LogoProps {
  logo: string
  disabled?: boolean
  onUpload: (file: UploaderFile[]) => void
}

export interface BannerModalProps {
  data: BannersType[]
  shopType: Shop_Type
  /** 不可选的数据 */
  disabledSelected?: string[]
  onChange(banners: BannersType[]): void
}

export interface ImageType extends Image {
  url: string
}

export interface BannersType extends ShopLayout_Banner {
  image: ImageType
}

export interface RadioCheckType {
  value: number
  data: any
}
