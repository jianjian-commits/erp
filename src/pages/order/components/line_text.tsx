import styled from 'styled-components'
import React from 'react'

interface LineTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 最大文字行数，超出隐藏
   *
   * @default 1
   */
  maxLine?: number
}

const LineText = styled.div.attrs((props) => props)<LineTextProps>`
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: ${(props) => props.maxLine || 1};
  -webkit-box-orient: vertical;
`

export default LineText
