import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { RadioGroup, Radio, InputNumber } from '@gm-pc/react'
import _ from 'lodash'

interface InputOptions {
  inputMin: number
  inputMax: number
  inputValue: number
  inputLabel?: string
}

interface TextOptions {
  value: number
  text: string
  needInput?: boolean
  inputOptions?: InputOptions
}

interface Props {
  info?: string
  texts: TextOptions[]
  currentValue: number
  onRadioChange(value: number): void
  onInputChange(value: number): void
}

const RadioInputGroup: FC<Props> = ({
  info,
  texts,
  currentValue,
  onRadioChange,
  onInputChange,
}) => {
  return (
    <RadioGroup
      value={currentValue}
      onChange={(value) => onRadioChange(Number(value))}
    >
      {_.map(texts, (text) => {
        if (text.needInput) {
          return (
            <Radio
              key={text.value}
              value={text.value}
              className='gm-block'
              style={{ marginTop: '-5px' }}
            >
              {text.text}
              <div className='gm-inline-block'>
                <div className='gm-gap-20' />
                {text?.inputOptions?.inputLabel || null}
                <InputNumber
                  min={text?.inputOptions!.inputMin}
                  disabled={currentValue === 2}
                  precision={0}
                  max={text?.inputOptions!.inputMax}
                  value={text?.inputOptions!.inputValue}
                  onChange={(value: number) => onInputChange(value)}
                  style={{ width: '80px' }}
                />
                {t('天')}
              </div>
            </Radio>
          )
        }

        return (
          <Radio
            key={text.value}
            value={text.value}
            className='gm-margin-top-5'
          >
            {text.text}
          </Radio>
        )
      })}
      {info && <div className='gm-text-desc gm-margin-top-10'>{info}</div>}
    </RadioGroup>
  )
}

export default RadioInputGroup
