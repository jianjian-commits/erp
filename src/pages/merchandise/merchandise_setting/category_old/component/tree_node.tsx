import React, {
  FC,
  useCallback,
  useState,
  useContext,
  useEffect,
  forwardRef,
} from 'react'
import { Flex, Checkbox } from '@gm-pc/react'
import classNames from 'classnames'
import SvgPlus from '@/svg/expand.svg'
import SvgMinus from '@/svg/minus.svg'
import { checkListContext } from './tree_list'
import { Sortable } from '@gm-pc/sortable'
import { treeNodeOptions } from '../../../manage/interface'
import { getCheckList, checkChildren, checkParent } from '../util'

const TreeNode: FC<treeNodeOptions> = forwardRef((props, ref) => {
  const {
    value,
    treeData,
    onCheck,
    onExpand,
    noDataText,
    onSort,
    onClearHighlight,
  } = props
  const {
    children,
    category_id,
    title,
    actions,
    level,
    edit,
    highlight,
    parent_id,
    loading,
    showSort,
  } = value
  /* 勾选状态 */
  const [checked, changeChecked] = useState(false)
  /* 展开状态 */
  const [expand, changeExpand] = useState(false)

  useEffect(() => {
    changeChecked(value.checked)
  }, [value.checked])

  useEffect(() => {
    changeExpand(value.expand)
  }, [value.expand])

  const checkList = useContext(checkListContext)

  const toggle = useCallback((event) => {
    changeExpand(!event)
    value.expand = !value.expand
    onExpand({ expand: !event, value })
  }, []) // eslint-disable-line

  const check = useCallback((event) => {
    const checked = !event
    changeChecked(checked)
    value.checked = checked
    checkChildren(value)
    if (value.parent_id) {
      checkParent(value.parent_id, treeData)
    }
    if (checkList.includes(category_id)) {
      checkList.splice(
        checkList.findIndex((item) => item === category_id),
        1,
      )
    }
    const checkedList: string[] = []
    getCheckList(treeData, checkedList)
    onCheck({ checked, value: checked ? value : null, checkList: checkedList })
  }, []) // eslint-disable-line

  const editMerchandiseOrder = true
  const editCategory = true

  const renderTreeNode = () => {
    if (!expand) {
      return
    }
    // if (!children.length) {
    //   return loading ? (
    //     <Loading />
    //   ) : (
    //     <p
    //       className='no-data-text'
    //       style={{ paddingLeft: `${level * 49 + 20}px` }}
    //     >
    //       {noDataText}
    //     </p>
    //   )
    // }

    if (!editMerchandiseOrder || (level === 2 && !showSort)) {
      return children.map((child) => (
        <TreeNode
          value={child}
          key={child.category_id}
          treeData={treeData}
          ref={(ref) => (child.ref = ref)}
          noDataText={noDataText}
          onCheck={onCheck}
          onExpand={onExpand}
          onClearHighlight={onClearHighlight}
        />
      ))
    }

    return (
      <Sortable
        data={children}
        onChange={onSort}
        renderItem={renderTreeNodeItem}
        options={{
          handle: '.tree-sortable-handle',
          chosenClass: 'sort-tree-item',
          ghostClass: 'sort-tree-ghost',
          dragClass: 'sort-tree-drag',
          group: parent_id,
        }}
      />
    )
  }

  const renderTreeNodeItem = (item) => (
    <TreeNode
      value={item}
      key={item.category_id}
      treeData={treeData}
      ref={(ref) => (item.ref = ref)}
      noDataText={noDataText}
      onCheck={onCheck}
      onExpand={onExpand}
      onSort={onSort}
      onClearHighlight={onClearHighlight}
    />
  )

  const handleClearHighlight = () => {
    if (highlight) {
      onClearHighlight(value)
    }
  }

  return (
    <>
      <div
        ref={ref}
        className={classNames('station-tree-item', { selected: highlight })}
        onClick={handleClearHighlight}
      >
        <div className='station-tree-item-container'>
          <Flex
            alignCenter
            style={{
              paddingLeft: `${level * 49 - (level === 3 ? 24 : 0) + 10}px`,
            }}
          >
            {children.length ? (
              <div onClick={() => toggle(expand)}>
                {expand ? (
                  <SvgMinus className='station-tree-icon gm-text-primary' />
                ) : (
                  <SvgPlus className='station-tree-icon gm-text' />
                )}
              </div>
            ) : (
              <div className='gm-gap-10' />
            )}
            <div className='gm-gap-10' />
            <Checkbox
              checked={checked}
              name={category_id}
              onChange={() => check(checked)}
              className='station-tree-checkbox'
            />
            <Flex flex={1} alignCenter>
              {title}
              <div className='gm-gap-10' />
              {editCategory ? edit : null}
              {/* {onSort && ( */}
              {/*  <> */}
              {/*    <div className='gm-gap-10' /> */}
              {/*    <OperationIcon tip={t('按住拖动排序')}> */}
              {/*      <div className='tree-sortable-handle station-tree-edit gm-cursor-grab gm-text-hover-primary'> */}
              {/*        <SvgSort /> */}
              {/*      </div> */}
              {/*    </OperationIcon> */}
              {/*  </> */}
              {/* )} */}
            </Flex>
            {actions}
          </Flex>
        </div>
      </div>
      {renderTreeNode()}
    </>
  )
})

export default TreeNode
