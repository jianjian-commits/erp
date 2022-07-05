import React, { FC, ReactNode, useState } from 'react'
import { Col, InputNumber, Row } from 'antd'
import { EditOutlined, EnterOutlined } from '@ant-design/icons'
import './index.less'
import { KCInputNumber } from '@gm-pc/keyboard'

interface EditableTextProps {
  /** eg. 0 | '0' | ReactNode */
  value?: string | number | ReactNode
  onChange?: (value: number | null) => void
}

const EditableText: FC<EditableTextProps> = ({ value, onChange }) => {
  const [state, setState] = useState({
    active: false,
    value: null as null | number,
  })

  const handleEnter = (val: number | null) => {
    setState({ ...state, value: val })
  }

  if (value === '') return <span>-</span>
  if (typeof value === 'string') value = +value

  return (
    <Row wrap={false} className='tw-w-full'>
      <Col>
        {(() => {
          if (typeof value === 'object' && !state.active) {
            return value
          }
          if (typeof value === 'object' && state.active) {
            return (
              <div className='tw-flex tw-items-center'>
                <KCInputNumber
                  value={state.value}
                  onChange={handleEnter}
                  min={0}
                  className='form-control input-sm'
                  precision={2}
                  onBlur={() => {
                    onChange && onChange(state.value)
                  }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      onChange && onChange(state.value)
                    }
                  }}
                />
                <EnterOutlined className='editable-enter-icon' />
              </div>
            )
          }
          if (typeof value === 'number' || typeof value === 'string') {
            return (
              <div className='tw-flex tw-items-center'>
                {!state.active && <span>{value}</span>}
                {state.active && (
                  <>
                    <KCInputNumber
                      value={state.value}
                      onChange={handleEnter}
                      min={0}
                      className='form-control input-sm'
                      precision={2}
                      onBlur={() => {
                        onChange && onChange(state.value)
                      }}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          onChange && onChange(state.value)
                        }
                      }}
                    />
                    <EnterOutlined className='editable-enter-icon' />
                  </>
                )}
              </div>
            )
          }
          return null
        })()}
      </Col>
      <Col offset={1}>
        {!state.active && (
          <EditOutlined
            className='tw-cursor-pointer'
            onClick={() => setState({ ...state, active: true })}
          />
        )}
      </Col>
    </Row>
  )
}

export default EditableText
