import { RadioGroup, Radio } from '@gm-pc/react'
import { t } from 'gm-i18n'
import classNames from 'classnames'
import { PrintingTemplate } from 'gm_api/src/preference'
import React, { FC, ReactElement, useState } from 'react'
import _ from 'lodash'
import { ContentItem } from '@/pages/delivery/interface'
import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import store from './store'

export const commonClass = classNames(
  'gm-border-bottom',
  'gm-padding-bottom-20',
  'gm-padding-top-20',
)

const templateMap: Record<string, string> = {
  '1': 'delivery_template',
  '3': 'account_template',
}

interface GroupRadioItemProps {
  templateList: PrintingTemplate[]
  value: string
  onChange(args: string): void
  prefixChild?(): ReactElement
  suffixChild?(): ReactElement
}

export const GroupRadioItem: FC<GroupRadioItemProps> = ({
  templateList,
  value,
  onChange,
  suffixChild,
  prefixChild,
}) => {
  const { deliveryType } = store.printModalOptions
  return (
    <RadioGroup
      name='template_customer'
      value={value}
      onChange={onChange}
      className='b-distribute-order-popup-temp-radio'
    >
      {prefixChild && prefixChild()}
      {templateList.map((item: PrintingTemplate) => (
        <Radio
          value={item.printing_template_id}
          key={item.printing_template_id}
          style={{ display: 'block' }}
          className={commonClass}
        >
          <span>{item.name}</span>
          <a
            href={`#/system/template/print_template/${templateMap[deliveryType]}/edit?template_id=${item.printing_template_id}`}
            className='gm-text-12'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('设置模板>')}
          </a>
        </Radio>
      ))}
      {suffixChild && suffixChild()}
    </RadioGroup>
  )
}

interface TypeGroupRadioProps {
  title: string
  value: string
  name: string
  contentList: ContentItem[]
  onChange(e: string): void
  childTypeValue?: childType
  onChildChange?: (e: childType) => void
}

export const TypeGroupRadio: FC<TypeGroupRadioProps> = ({
  contentList,
  title,
  value,
  name,
  onChange,
  childTypeValue,
  onChildChange,
}) => {
  const [useChose, setChose] = useState(value)

  const handleChose = (e: string) => {
    setChose(e)
    onChange(e)
    onChildChange!(
      _.map(
        _.find(contentList, { value: e })?.childRadios,
        (v) => v.value,
      )?.[0] || 0,
    )
  }
  return (
    <div style={{ marginBottom: '25px' }} className='gm-margin-top-5'>
      <span>{title}:</span>
      <RadioGroup
        name={name}
        value={value}
        onChange={handleChose}
        className='gm-padding-left-10 gm-margin-top-15'
      >
        {_.map(
          _.filter(contentList, (item) => !item.disabled),
          ({ value, disabled, label, sameLevel, childRadios }) => (
            <Radio
              className='gm-margin-bottom-10'
              value={value}
              key={value}
              style={{ display: 'block' }}
              disabled={disabled}
            >
              {label}
              {value === useChose && (
                <>
                  {!!childRadios?.length && (
                    <RadioGroup
                      className='gm-margin-bottom-10'
                      onChange={onChildChange}
                      value={childTypeValue}
                      key={value}
                      style={{ display: 'block' }}
                    >
                      {_.map(childRadios, (child) => (
                        <Radio
                          className='gm-margin-top-10 gm-margin-left-10'
                          value={child.value}
                          key={child.value}
                          style={{ display: 'block' }}
                        >
                          {child.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  )}
                  {sameLevel}
                </>
              )}
            </Radio>
          ),
        )}
      </RadioGroup>
    </div>
  )
}
