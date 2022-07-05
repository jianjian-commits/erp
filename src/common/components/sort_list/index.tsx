import React from 'react'
import _ from 'lodash'
import { Button } from '@gm-pc/react'

import SVGArrowTop from '@/svg/arrow_top.svg'
import SVGArrowBottom from '@/svg/arrow_bottom.svg'

interface Props<T> {
  list: T[]
  onChange: (list: T[]) => void
  renderItem: (v: T, i: number) => React.ReactElement
}

const Sort = <T,>(props: Props<T>): React.ReactElement => {
  const handleUp = (
    i: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault()
    const { list, onChange } = props
    list.splice(i - 1, 0, list.splice(i, 1)[0])
    onChange(list)
  }

  const handleDown = (
    i: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault()
    const { list, onChange } = props
    list.splice(i + 1, 0, list.splice(i, 1)[0])
    onChange(list)
  }

  const { list, renderItem } = props

  return (
    <div className='b-sort-list'>
      {_.map(list, (v, i) => (
        <div key={i} className='b-sort-list-item'>
          {renderItem(v, i)}
          {list.length > 1 && (
            <div className='b-sort-list-item-util'>
              <Button disabled={i === 0} onClick={(e) => handleUp(i, e)}>
                <SVGArrowTop />
              </Button>
              <Button
                disabled={i === list.length - 1}
                onClick={(e) => handleDown(i, e)}
              >
                <SVGArrowBottom />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

Sort.defaultProps = {
  onChange: () => {},
}

export default Sort
