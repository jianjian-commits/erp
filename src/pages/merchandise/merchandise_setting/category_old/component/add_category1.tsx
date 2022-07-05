import React, { FC, useState, useCallback, useEffect } from 'react'
import { Form, FormItem, Input, Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { AddCategory1Options } from '../../../manage/interface'
import classNames from 'classnames'

const fill = new Array(10).fill(0)
const AddCategory1: FC<AddCategory1Options> = observer(
  ({ icon, name, icons, onChange, onSelected }) => {
    const [cloneIcons, changeIcons] = useState([])
    const [value, changeValue] = useState('')

    useEffect(() => {
      if (icon || name) {
        // 编辑
        changeValue(name)
        icons.forEach((item) => {
          item.selected = item.id === icon
        })
      } else {
        onSelected(null) // 新增
        onChange('')
        icons.forEach((item) => {
          item.selected = false
        })
      }
      changeIcons(icons)
    }, [])

    const handleInput = useCallback(({ target: { value } }) => {
      changeValue(value)
      onChange(value)
    }, [])

    const handleSelect = ({ id, selected }) => {
      cloneIcons.forEach((item) => {
        item.selected = item.id === id ? !selected : false
      })
      changeIcons([...cloneIcons])
      const find = cloneIcons.find((item) => item.selected)
      onSelected(find ? find.id : null)
    }

    const renderIcon = (type) => (
      <Flex wrap alignCenter justifyBetween>
        {cloneIcons
          .filter((item) => item.type === type)
          .map((item) => (
            <div
              className={classNames({
                'b-category-icon-item': true,
                'b-category-icon-item-selected': item.selected,
              })}
              key={item.id}
              onClick={() => handleSelect(item)}
            >
              <img src={item.url} alt={item.id} />
            </div>
          ))}
        {fill.map((item, index) => (
          <div key={index + 100} className='b-category-icon-fill' />
        ))}
      </Flex>
    )

    return (
      <Form labelWidth='80px'>
        <FormItem label={t('分类名称')} className='gm-margin-bottom-20'>
          <Input
            className='form-control'
            style={{ width: '220px' }}
            value={value}
            maxLength={30}
            onChange={handleInput}
          />
        </FormItem>
        <FormItem label={t('选择图标')}>
          <div
            className='b-category-icon-container'
            style={{ padding: '12px' }}
          >
            {renderIcon(1)}
            {/* <div style={{ height: '20px', borderTop: '1px solid #ccc' }} /> */}
            {/* {renderIcon(2)} */}
          </div>
        </FormItem>
      </Form>
    )
  },
)
export default AddCategory1
