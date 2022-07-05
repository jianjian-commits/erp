import React, { FC, useState, useEffect } from 'react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import classNames from 'classnames'
import { IconsData } from '../interface'
interface props {
  id?: string
  iconData: IconsData[]
  onSelect: (e: IconsData) => any
}

const ChoseIcon: FC<props> = (props) => {
  const { id, onSelect, iconData } = props
  const [icons, setIcons] = useState<IconsData[]>(iconData)
  const icons_ = _.cloneDeep(iconData)
  const handleSave = (key: number) => {
    icons_[key].show = true
    setIcons(icons_)
    onSelect(icons_[key])
  }

  useEffect(() => {
    if (id) {
      const result = _.findIndex(icons, { id })
      icons_[result].show = true
      setIcons(icons_)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className='b-check-icon'>
      <Flex wrap>
        {_.map(icons, ({ url, show, id }, key) => {
          return (
            <div
              className={classNames({
                'b-alone-icon': true,
                'b-alone-icon-select': show,
              })}
              key={id}
              onClick={() => handleSave(key)}
            >
              <img src={url} className='b_icon_size' />
            </div>
          )
        })}
      </Flex>
    </div>
  )
}

export default ChoseIcon
