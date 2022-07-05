import { CSSProperties } from 'react'
import { ModalProps as AntdModalProps } from 'antd'
import {
  FieldSelectorProps as RawFieldSelectorProps,
  SelectedFields,
} from '../field_selector'
import { AnyObject, ValueInObject } from '../field_selector/interface'

type ModalProps = Omit<
  AntdModalProps,
  'destroyOnClose' | 'footer' | 'onOk' | 'onCancel'
>

type FieldSelectorProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> = Pick<
  RawFieldSelectorProps<RawData, TabId, RawDataKey>,
  | 'defaultActiveKey'
  | 'fetcher'
  | 'fieldKey'
  | 'labelKey'
  | 'tabs'
  | 'instance'
  | 'renderGroupTitle'
>

export interface FieldSelectorModalProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> extends FieldSelectorProps<RawData, TabId, RawDataKey>,
    ModalProps {
  /**
   * 设置容器样式（将直接作用于左右两个元素）
   *
   * 默认值为：`{ height: 460, maxHeight: 540, overflowY: 'auto' }`
   */
  containerStyle?: CSSProperties
  /**
   * 提交后关闭弹窗
   *
   * @default true
   */
  closeOnSubmit?: boolean
  /**
   * 弹窗关闭事件
   */
  onClose?: () => void
}

type SubmitFn<T> = ((value: T) => void) | ((value: T) => Promise<void>)

export interface SingleProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> extends FieldSelectorModalProps<RawData, TabId, RawDataKey> {
  /**
   * 是否开启批量提交（默认开启）
   *
   * 批量提交时，onSubmit 将传递一个数组
   */
  batchSubmit: false
  /**
   * 点击“保存”按钮时触发
   */
  onSubmit?: SubmitFn<SelectedFields<RawData, TabId>>
}
export interface BatchProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> extends FieldSelectorModalProps<RawData, TabId, RawDataKey> {
  /**
   * 是否开启批量提交（默认开启）
   *
   * 批量提交时，onSubmit 将传递一个数组
   */
  batchSubmit?: true
  /**
   * 点击“保存”按钮时触发
   */
  onSubmit?: SubmitFn<SelectedFields<RawData, TabId>[]>
}
export interface OverloadProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> extends FieldSelectorModalProps<RawData, TabId, RawDataKey> {
  /**
   * 是否开启批量提交（默认开启）
   *
   * 批量提交时，onSubmit 将传递一个数组
   */
  batchSubmit?: boolean
  /**
   * 点击“保存”按钮时触发
   */
  onSubmit?: SubmitFn<any>
}
