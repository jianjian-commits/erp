import { t } from 'gm-i18n'
import React, { FC, useRef, useState, useEffect, useCallback } from 'react'
import SvgEditPen from '@/svg/edit_pen.svg'
import { Popover, Tip, Flex, Button, Input } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { is } from '@gm-common/tool'
import SvgRemove from '@/svg/remove.svg'
import AddCategory1 from './add_category1'
import { itemEditOptions, editOptions } from '../../../manage/interface'

const Edit: FC<editOptions> = ({
  value,
  onOk,
  container,
  icons,
  onHighlight,
}) => {
  const { title, level } = value
  const [name, changeName] = useState(level ? title : value.name)
  const [icon, changeIcon] = useState(value.icon)

  useEffect(() => {
    onHighlight(true)
    return () => {
      onHighlight(false)
    }
  }, [])

  const handleChange = useCallback((event) => {
    changeName(event.target.value)
  }, [])

  const handleCancel = () => {
    const { current } = container
    current.apiDoSetActive()
  }

  const handleOk = () => {
    if (!name) {
      Tip.tip(t('请输入分类名称'))
      return
    }
    if (!onOk) {
      console.error(t('请传入onOk方法'))
      return
    }
    const result = onOk(value, name, icon)
    if (!is.promise(result)) {
      console.error(t('请传入一个Promise对象'))
      return
    }
    Promise.resolve(result).then(() => handleCancel())
  }

  const renderFirstLevel = () => (
    <div className='gm-padding-20' style={{ width: '656px' }}>
      <Flex alignCenter>
        <div className='b-category-icon-div' />
        <div className='gm-gap-10' />
        <Flex flex={1} className='gm-text-14' style={{ fontWeight: 'bold' }}>
          {t('分类编辑')}
        </Flex>
        <Button
          className='btn'
          style={{ fontSize: '18px' }}
          onClick={handleCancel}
        >
          <SvgRemove />
        </Button>
      </Flex>
      <AddCategory1
        onSelected={changeIcon}
        name={name}
        icon={icon}
        onChange={changeName}
        icons={icons}
      />
      <Flex justifyEnd alignCenter className='gm-padding-top-10'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <div className='gm-gap-10' />
        <Button type='primary' onClick={handleOk}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )

  const renderCommon = () => (
    <Flex className='gm-padding-lr-15 gm-padding-tb-10'>
      <Input
        className='form-control'
        maxLength={30}
        value={name}
        onChange={handleChange}
      />
      <Flex alignCenter className='gm-margin-left-10'>
        <Button type='primary' onClick={handleOk}>
          {t('保存')}
        </Button>
      </Flex>
    </Flex>
  )

  return level ? renderCommon() : renderFirstLevel()
}

const ItemEdits: FC<itemEditOptions> = ({
  icons,
  value,
  onHighlight,
  onOk,
}) => {
  const editRef = useRef()

  const handleHighlight = (highlight: boolean) => {
    value.highlight = highlight
    onHighlight()
  }

  return (
    <Popover
      popup={
        <Edit
          icons={icons}
          value={value}
          container={editRef}
          onOk={onOk}
          onHighlight={handleHighlight}
        />
      }
      ref={editRef}
      top={false}
    >
      <TableXUtil.OperationIcon
        className='station-tree-icon station-tree-edit'
        tip={t('编辑')}
      >
        <SvgEditPen />
      </TableXUtil.OperationIcon>
    </Popover>
  )
}

export default ItemEdits
