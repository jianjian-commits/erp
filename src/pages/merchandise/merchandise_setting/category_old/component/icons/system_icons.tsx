import { t } from 'gm-i18n'
import React, { ChangeEvent, FC, useContext, useRef } from 'react'
import { Checkbox, Flex, Popover } from '@gm-pc/react'
import {
  SystemIconsOptions,
  SystemIconOptions,
} from '../../../../manage/interface'
import { defaultIconContext } from '../icons_manage'
import _ from 'lodash'
import classNames from 'classnames'

const fill = new Array(10).fill(0)
const SystemIcons: FC<SystemIconsOptions> = ({ icons, onSetDefault }) => {
  const handleClick = (id: number) => {
    onSetDefault(id)
  }

  return (
    <>
      <div
        className='b-category-icon-container'
        style={{
          padding: '12px',
          width: '100%',
          borderTop: 'none',
          height: 'auto',
          maxHeight: '300px',
          minHeight: '200px',
        }}
      >
        <Flex wrap alignCenter justifyBetween>
          {icons.map((item) => (
            <Icon key={item.id} icon={item} onClick={handleClick} />
          ))}
          {fill.map((item, index) => (
            <div
              key={index + 100}
              data-id={item}
              className='b-category-icon-fill'
            />
          ))}
        </Flex>
      </div>
    </>
  )
}

const Icon: FC<SystemIconOptions> = ({ icon, onClick }) => {
  const defaultIcon = useContext(defaultIconContext)
  const popRef = useRef<Popover>(null)

  const handleClick = (id: number) => {
    setTimeout(() => {
      popRef.current && popRef.current.apiDoSetActive(false)
    }, 3000)
    onClick(id)
  }

  const handleCheck = (event: ChangeEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  return (
    <Popover
      key={icon.id}
      popup={
        <div
          className='gm-padding-lr-15 gm-padding-tb-5'
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          {t('默认图标')}
        </div>
      }
      showArrow
      top
      offset={18}
      ref={popRef}
    >
      <div
        className={classNames({
          'b-category-icon-item': true,
          'b-category-icon-item-selected': icon.selected,
        })}
        onClick={() => handleClick(icon.id)}
      >
        <img src={icon.url} alt={_.toString(icon.id)} />
        {defaultIcon === icon.id && (
          <Checkbox
            className='img-checkbox'
            checked={defaultIcon === icon.id}
            onChange={handleCheck}
          />
        )}
      </div>
    </Popover>
  )
}
export default SystemIcons
