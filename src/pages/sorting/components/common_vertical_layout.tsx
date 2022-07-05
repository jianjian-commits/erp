import React, { FC, ReactElement } from 'react'
import classNames from 'classnames'
import { Flex, Tooltip } from '@gm-pc/react'

interface CommonVerticalLayoutProps {
  name: string | ReactElement
  value: number | ReactElement // 数字
  color: string // value的颜色
  numberClassName: string | null // number 自定义样式
  symbol?: string // 数字单位
  className?: string // title样式
  tipContent?: string // 提示内容
}

const CommonVerticalLayout: FC<CommonVerticalLayoutProps> = (props) => {
  const {
    name,
    tipContent,
    symbol,
    value,
    className,
    color,
    numberClassName,
    ...rest
  } = props
  return (
    <Flex flex justifyCenter alignCenter className={classNames('', className)}>
      <Flex column justifyStart>
        <Flex alignCenter>
          <Flex>{name}</Flex>
          {tipContent ? (
            <Tooltip
              style={{ fontSize: '1.2em' }}
              popup={
                <div className='gm-padding-5' style={{ width: '180px' }}>
                  {tipContent}
                </div>
              }
              className='gm-margin-left-5'
            />
          ) : null}
        </Flex>
        <Flex
          className='b-purchase-overview-amount-number gm-text-bold'
          style={{ color: color, fontSize: '32px' }}
          {...rest}
          alignCenter
        >
          {symbol ? (
            <span className='b-purchase-overview-amount-unit'>{symbol}</span>
          ) : null}
          <span className={classNames('gm-number-family', numberClassName)}>
            {value}
          </span>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default CommonVerticalLayout
