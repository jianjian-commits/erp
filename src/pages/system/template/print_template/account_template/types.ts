export interface OriginType {
  address_name: string
  quantity: string | undefined
}
export type CustomizeOrderDetial<T> = T & {
  _originDetails?: OriginType[]
}
