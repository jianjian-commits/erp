interface RadioCheckDataType {
  value: string | number
  text: string
  tip: string
  disabled?: boolean
}

interface RadioCheckType {
  value: string | number
  data?: RadioCheckDataType[]
}

interface WhiteListDataType {
  value: string | number
  text: string
  disabled?: boolean
}

interface WhiteListType {
  value: string | number
  data?: WhiteListDataType[]
}

export type {
  RadioCheckType,
  WhiteListType,
  RadioCheckDataType,
  WhiteListDataType,
}
