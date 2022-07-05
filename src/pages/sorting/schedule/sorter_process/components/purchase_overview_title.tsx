import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import SvgNext from 'svg/next.svg'

interface PurchaseOverviewTitleProps {
  title?: string
  className?: string
  rightChildren?: React.ReactNode
  leftChildren?: React.ReactNode
  type?: string // 类型
  linkRoute?: string // 链接
  linkText?: string // 右边按钮文案
}

const PurchaseOverviewTitle: FC<PurchaseOverviewTitleProps> = ({
  title,
  className,
  rightChildren,
  leftChildren,
  type,
  linkRoute,
  linkText,
  ...rest
}) => {
  const rightContent = () => {
    if (rightChildren) {
      return rightChildren
    } else if (type === 'more') {
      // 查看更多
      return (
        <a
          href={'#' + linkRoute}
          className='gm-text-12 gm-flex gm-flex-align-center'
        >
          {linkText}&nbsp;
          <SvgNext />
        </a>
      )
    } else {
      return null
    }
  }

  return (
    <Flex {...rest} className='gm-text-14' alignStart>
      <Flex className='b-purchase-common-title-icon' />
      <Flex
        justifyBetween
        flex
        className={
          type === 'fullScreen'
            ? 'b-purchase-full-screen-link'
            : 'b-purchase-common-link'
        }
      >
        <Flex>
          {title}
          {leftChildren || null}
        </Flex>
        <Flex>{rightContent()}</Flex>
      </Flex>
    </Flex>
  )
}

export default PurchaseOverviewTitle
