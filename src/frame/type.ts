import { ReactNode } from 'react'

interface NavConfigSubSubOptions {
  name: string
  link: string
  disabled?: boolean | ((item: NavConfigSubSubOptions) => boolean)
}

interface NavConfigSubOptions {
  name: string
  link: string
  sub: NavConfigSubSubOptions[]
  disabled?: boolean | ((item: NavConfigSubOptions) => boolean)
}

interface NavConfigProps {
  link: string
  name: string
  sub: NavConfigSubOptions[]
  disabled?: boolean | ((item: NavConfigProps) => boolean)
  icon?: ReactNode
}

interface NavRouteMapType {
  [key: string]: {
    link: string
    disabled: boolean
    name: string
    twoName: string
    twoLink: string
    two: NavConfigSubSubOptions[]
    oneName: string
    one: NavConfigSubOptions[]
  }
}

export type {
  NavConfigSubSubOptions,
  NavConfigSubOptions,
  NavConfigProps,
  NavRouteMapType,
}
