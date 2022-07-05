/**
 * @description 新建商品表单Item
 */

import {
  InputProps,
  InputNumberProps,
  SelectProps,
  UploadProps,
  CascaderProps,
  RadioGroupProps,
} from 'antd'
import { FormItemProps } from 'antd/lib/form/FormItem'
import { CheckboxGroupProps } from 'antd/lib/checkbox'
import { GroupProps, SearchProps, TextAreaProps } from 'antd/lib/input'
import { ReactNode } from 'react-hot-loader/node_modules/@types/react'
import { FieldData } from 'rc-field-form/es/interface'
import { NamePath } from 'rc-field-form/lib/interface'
import { UnitGlobal } from '@/stores/global'
import { Sku } from 'gm_api/src/merchandise'
import { FileType } from 'gm_api/src/cloudapi'
import { UploadFile } from 'antd/lib/upload/interface'
import { Key } from 'react'

export interface UploadImageProps {
  fileType: FileType
  fileLength: number
  setFileList: (files: UploadFile[]) => void
  upload: UploadProps
}

export interface FormItemInterface<valueType> extends FormItemProps {
  // form item 类型
  type:
    | 'input'
    | 'inputTextarea'
    | 'inputNumber'
    | 'select'
    | 'cascader'
    | 'checkboxGroup'
    | 'uploadImage'
    | 'radioGroup'
    | 'customer'
    | 'inputGroup'
    | 'inputSearch'
  input?: InputProps
  inputTextarea?: TextAreaProps
  inputNumber?: InputNumberProps
  select?: SelectProps<valueType>
  selectValueName?: string
  selectLabelName?: string
  cascader?: CascaderProps<valueType>
  checkboxGroup?: CheckboxGroupProps
  uploadImage?: UploadImageProps
  radioGroup?: RadioGroupProps
  customer?: ReactNode
  inputGroup?: GroupProps
  inputSearch?: SearchProps
  formItems?: FormItemInterface<valueType>[]
  toolTipDom?: ReactNode
  toolTipDomSpan?: number
  visible?: boolean
}

export interface FormBlockProps<valueType> {
  [key: string]: FormItemInterface<valueType>[]
}

export interface FormDataProps {
  onChange: (fields: FieldData[]) => void
  fields: FieldData[]
}

export interface UnitConversionItem extends InputProps {
  inputName?: NamePath
  afterName?: NamePath
  afterType?: 'select' | 'input' | 'text'
  selectList?: UnitGlobal[]
  text?: string
  afterDisabled?: boolean
}

export interface UnitConversionProps {
  front: UnitConversionItem
  end: UnitConversionItem
  isValidate?: boolean
  unitValidator?: (event: any, value: string) => any
}

export interface CustomUnitItem {
  custom_unit: string
  rate: number
  parent_id: string
}
export interface MulitUnitForm {
  auxiliary: string
  custom_units: CustomUnitItem[]
  second_base_num: string
  second_base_unit_id?: string
  second_base_unit_ratio?: string
  second_base_parent: string
}

export interface SkuForm extends Sku {
  alias?: string
  categories: Key[]
  sorting_type?: string
  second_base_unit?: string
  custom_unit_1?: string
  custom_unit_2?: string
  custom_unit_3?: string
  inventory_unit?: string
  production_num: string
  production_unit_id: string
  product_basic_unit?: string
  merchandise_pic?: string[]
  sale_state?: string
  shelf_ids?: string[]
  finance_category: string[]
  [key: string]: any
}
