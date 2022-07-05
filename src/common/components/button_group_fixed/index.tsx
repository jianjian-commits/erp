import React, { FC, ReactNode } from 'react'
import { Button } from 'antd'
import './index.less'
import classNames from 'classnames'
import { t } from 'gm-i18n'
interface ButtonGroupFixedProps {
  onCancel?(): void
  disabled?: boolean
  /* 确定按钮的文案，默认为保存 */
  saveText?: string
  /* 取消按钮的文案，默认为取消 */
  cancelText?: string
  /* 按钮是否靠右显示，默认居中显示 */
  right?: boolean
  /* position定位使用绝对定位 */
  absolute?: boolean
  loading?: boolean
  // 不是嵌套在form下面的 使用自定义事件来提交
  ButtonNode?: ReactNode
}

const ButtonGroupFixed: FC<ButtonGroupFixedProps> = ({
  onCancel,
  disabled = false,
  saveText = t('保存'),
  cancelText = t('取消'),
  right = false,
  loading = false,
  absolute = false,
  ButtonNode,
}) => {
  return (
    <>
      {/* 解决使用固定定位时遮挡其他区域 ,使用绝对定位不需要 */}
      {!absolute && <div className='gm-margin-bottom-40' />}
      <div
        className={classNames(
          'gm-padding-tb-10 gm-margin-top-20 gm-text-center b-form-group-position-fixed-box b-form-group-box', // 统一padding,margin样式
          {
            'b-text-align-right': right, // 按钮靠右侧显示
            'b-form-group-position-absolute-box': absolute, // 使用绝对定位
          },
        )}
      >
        {onCancel && (
          <>
            <Button onClick={onCancel}>{cancelText}</Button>
            <div className='gm-gap-10' />
          </>
        )}
        {ButtonNode || (
          <Button
            type='primary'
            htmlType='submit'
            disabled={disabled}
            loading={loading}
          >
            {saveText}
          </Button>
        )}
      </div>
    </>
  )
}
export default ButtonGroupFixed
