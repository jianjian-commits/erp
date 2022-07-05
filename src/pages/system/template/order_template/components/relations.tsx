import React, { ReactNode, FC } from 'react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import classNames from 'classnames'

interface Column {
  header?: ReactNode
  width: number
  Cell: (c: { original: any; index: number }) => ReactNode
}
interface HeaderProps {
  columns: Column[]
}

const Header: FC<HeaderProps> = (props) => (
  <Flex>
    {_.map(props.columns, (column, i) => (
      <div
        key={i}
        className={classNames('gm-flex-flex', {
          'gm-flex-none': column.width,
        })}
        style={{
          width: `${column.width}px`,
        }}
      >
        {column.header}
      </div>
    ))}
  </Flex>
)

interface ContentProps {
  columns: Column[]
  index: number
  item: any
}

const Content: FC<ContentProps> = ({ item, columns, index }) => (
  <Flex justifyCenter alignCenter className='gm-padding-top-10'>
    {_.map(columns, (column, i) => {
      let content = null
      if (column.Cell) {
        content = column.Cell({
          original: item,
          index,
        })
      }
      return (
        <div
          key={i}
          className={classNames('gm-flex-flex', {
            'gm-flex-none': column.width,
          })}
          style={{
            width: `${column.width}px`,
          }}
        >
          {content}
        </div>
      )
    })}
  </Flex>
)

interface RelationsProps {
  columns: Column[]
  data: any[]
}
const Relations: FC<RelationsProps> = ({ data, columns }) => {
  return (
    <Flex column style={{ padding: '6px 0' }}>
      <Header columns={columns} />
      {_.map(data, (item, i) => (
        <Content key={i} item={item} columns={columns} index={i} />
      ))}
    </Flex>
  )
}

export default Relations
