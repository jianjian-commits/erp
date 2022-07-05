import React, { FC, ReactNode } from 'react'
import { t } from 'gm-i18n'
import { Button, Row, Col } from 'antd'
import _ from 'lodash'
import classNames from 'classnames'
import { Flex, Affix } from '@gm-pc/react'

interface FormButtonProps {
  onOkText?: string
  onCancelText?: string
  loading?: boolean
  disabled?: boolean
  other?: ReactNode
  onCancel?: () => void
}

/**
|--------------------------------------------------
|  @components
| # 表单提交按钮, 
  1、超出高度底部吸附 2、半页居中
|--------------------------------------------------
*/

const FormButton: FC<FormButtonProps> = ({
  onOkText = t('保存'),
  onCancelText = t('取消'),
  loading = false,
  disabled = false,
  other,
  onCancel,
}) => {
  return (
    <Affix bottom={0}>
      <div
        className={classNames(
          'gm-padding-tb-5 gm-margin-top-20 gm-text-center',
          {},
        )}
        style={{
          background: 'white',
        }}
      >
        {other && other}
        {onCancel && <Button onClick={onCancel}>{onCancelText}</Button>}
        <Button
          loading={loading}
          disabled={disabled}
          type='primary'
          htmlType='submit'
          className='gm-margin-left-10'
        >
          {onOkText}
        </Button>
      </div>
    </Affix>
  )
}

export default FormButton
