import { t } from 'gm-i18n'
import React, { FC, CSSProperties } from 'react'
import classNames from 'classnames'
import styled from 'styled-components'

interface Props {
  selected?: boolean
  className?: string
  style?: CSSProperties
}

const WordBreak = styled.div`
  word-break: break-all;
`

const SelectedBox: FC<Props> = ({
  children,
  selected,
  className = '',
  style = undefined,
  ...rest
}) => {
  return (
    <WordBreak
      className={classNames(className, {
        'gm-text-primary': selected,
      })}
      data-label={t('组合商品')}
      style={style}
      {...rest}
    >
      {children}
    </WordBreak>
  )
}

export default SelectedBox
