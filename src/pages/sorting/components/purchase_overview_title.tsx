import React, { ReactNode } from 'react'
import { Flex } from '@gm-pc/react'
import SvgNext from 'svg/next.svg'

interface PurchaseOverviewTitleProps {
  title: string
  type: string // 类型
  linkText: string // 右边按钮文案
  linkRoute: string // 链接
  rightChildren?: ReactNode
  leftChildren?: ReactNode
  className?: string
}

class PurchaseOverviewTitle extends React.Component<
  PurchaseOverviewTitleProps
> {
  rightContent = () => {
    const { rightChildren, type, linkRoute, linkText } = this.props
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

  render() {
    const {
      title,
      className,
      rightChildren,
      leftChildren,
      type,
      linkRoute,
      linkText,
      ...rest
    } = this.props

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
          <Flex>{this.rightContent()}</Flex>
        </Flex>
      </Flex>
    )
  }
}

export default PurchaseOverviewTitle
