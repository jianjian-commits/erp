import React, { useContext } from 'react'
import classNames from 'classnames'
import { LinkProps } from './Anchor'
import { AnchorContext } from './constants'

const Link = (props: LinkProps) => {
  const { id, title } = props
  const { activeId, onActive } = useContext(AnchorContext)

  const handleClick = () => {
    if (typeof onActive === 'function') onActive(id)
  }

  return (
    <div
      className={classNames('default_link', {
        activeMerchandise: activeId === id,
      })}
      onClick={handleClick}
    >
      <div>{title}</div>
    </div>
  )
}

export default Link
