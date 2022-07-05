import React, { FC, useRef } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { SaleCardOptions, CardRowOptions } from '../types'
import classNames from 'classnames'
import { Flex, Popover, List } from '@gm-pc/react'
import SVGMore from '@/svg/more.svg'

const Label: FC<{ text: string }> = ({ text }) => {
  return (
    <Flex column className='b-label-container'>
      <Flex className='b-card-label'>{text}</Flex>
      <Flex className='b-card-label-content'>
        <div className='b-card-label-left' />
        <div className='b-card-label-right' />
      </Flex>
    </Flex>
  )
}

const SaleCard: FC<SaleCardOptions> = observer((props) => {
  const {
    quotation_id,
    title,
    label,
    disabled,
    onSettingClick,
    onDelete,
    children,
    onClick,
  } = props
  const popoverRef = useRef<Popover>(null)

  const handleClick = (): void => {
    onClick(quotation_id)
  }

  const renderPopup = () => {
    const menu = [
      {
        value: 'setting',
        text: t('设置'),
        handle: onSettingClick,
      },
      {
        value: 'delete',
        text: t('删除'),
        handle: onDelete,
      },
    ]

    const handleSelect = (value: any) => {
      popoverRef.current!.apiDoSetActive(false)
      // @ts-ignore
      _.find(menu, (v) => v.value === value)?.handle(quotation_id)
    }

    return (
      <List
        data={menu.filter((_) => _)}
        onSelect={handleSelect}
        className='gm-border-0 b-salemenu-more'
      />
    )
  }

  return (
    <div
      className={classNames('b-salemenu-card', {
        'b-salemenu-disabled': disabled,
      })}
      onClick={handleClick}
    >
      <div
        className={classNames('b-card-header', {
          'merchandise-input-tips-wrap': title.length > 14,
          'b-disabled': disabled,
        })}
      >
        <Flex flex column>
          <Flex>
            <Flex>
              <Label text={label} />
            </Flex>
            <Flex flex justifyEnd>
              <Popover
                ref={popoverRef}
                right
                showArrow
                type='hover'
                popup={renderPopup()}
              >
                <div className='gm-padding-top-5 b-card-info'>
                  <SVGMore className='gm-text-16' />
                </div>
              </Popover>
            </Flex>
          </Flex>
          <Flex className='gm-text-14 b-card-title'>
            {title || t('报价单')}
          </Flex>
        </Flex>
      </div>
      <ul className='b-card-ul'>{children}</ul>
    </div>
  )
})

const CardRow: FC<CardRowOptions> = observer((props) => {
  let { name, content } = props
  content =
    String(content).length > 36 ? String(content).slice(0, 36) + '...' : content
  return (
    <li className='b-card-li'>
      <span>{name}：</span>
      <span>{content}</span>
    </li>
  )
})

export { SaleCard, CardRow }
