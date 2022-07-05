import React, { FC, HTMLAttributes, useState } from 'react'
import { Flex } from '@gm-pc/react'
import styled from 'styled-components'
import ArrowLeft from '@/svg/arrow_left.svg'
import ArrowRight from '@/svg/arrow_right.svg'

interface MenuSummaryDrawerProps extends HTMLAttributes<HTMLDivElement> {
  /** 区域宽度 */
  width: number | string
  height: number | string
  ref?: React.Ref<any>
  onActiveChange?: (active: boolean) => void
}

const MenuSummaryDrawer: FC<MenuSummaryDrawerProps> = ({
  children,
  width,
  height,
  style,
  onActiveChange,
}) => {
  const [active, setActive] = useState<boolean>(true)

  const Pattern = styled.div`
    width: 20px;
    height: 54px;
    line-height: 54px;
    text-align: center;
    background: #eef1f5;
    border-radius: 9px 0px 0px 9px;
    border: 1px solid #d8dee7;
  `

  return (
    <Flex>
      <Flex style={{ flexDirection: 'column-reverse', height: '40vh' }}>
        <Pattern
          onClick={() => {
            onActiveChange && onActiveChange(!active)
            setActive(!active)
          }}
        >
          {active ? <ArrowRight /> : <ArrowLeft />}
        </Pattern>
      </Flex>
      <Flex
        column
        style={{
          // transition: 'min-width .01s'
          minWidth: active ? width : 0,
          backgroundColor: '#e8eaf0',
          height: height || 'fit-content',
          ...style,
        }}
      >
        {active && children}
      </Flex>
    </Flex>
  )
}

export default MenuSummaryDrawer
