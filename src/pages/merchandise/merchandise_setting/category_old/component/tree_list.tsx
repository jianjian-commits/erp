import { t } from 'gm-i18n'
import React, {
  FC,
  createContext,
  useEffect,
  useState,
  forwardRef,
} from 'react'
import { Flex, Modal } from '@gm-pc/react'
import { Sortable } from '@gm-pc/sortable'
import TreeNode from './tree_node'
import SvgEmpty from '@/svg/empty.svg'
import CheckNumber from './check_number'
import MoveModal from './move_modal'
import { treeListOptions } from '../../../manage/interface'
import { rebuildTreeData, findObject } from '../util'

export const checkListContext = createContext([])
const { Provider } = checkListContext

const TreeList: FC<treeListOptions> = forwardRef((props, ref) => {
  const {
    treeData,
    noDataText,
    checkList,
    checkData,
    onCheck,
    onExpand,
    onMove,
    onSort,
    onClearHighlight,
  } = props
  const editMerchandiseOrder = true

  const moveCategory = true

  /* 用于转移分类模态框中的LevelSelect的数据 */
  const [selectData, changeSelectData] = useState([])

  useEffect(() => {
    changeSelectData(rebuildTreeData(treeData))
  }, [treeData])

  /**
   * 打开转移分类的模态框
   */
  const handleMoveCategory = () => {
    Modal.render({
      title: t('转移分类库设置'),
      children: <MoveModal data={selectData} onMove={handleMoveOk} />,
      size: 'md',
      style: {
        width: '700px',
      },
      onHide: Modal.hide,
    })
  }

  /**
   * 点击确认转移分类
   * @param value {{category_id_1:string, category_id_2:string, pinlei_id :string}}
   */
  const handleMoveOk = (value) => {
    onMove(value)
  }

  /**
   * 拖动排序
   * @param value {object[]}
   */
  const handleSort = (value) => {
    const [{ parent_id }] = value
    onSort(value, findObject(treeData, parent_id))
  }

  const renderItem = (item) => (
    <TreeNode
      value={item}
      key={item.id}
      ref={(ref) => (item.ref = ref)}
      noDataText={noDataText}
      onCheck={onCheck}
      onExpand={onExpand}
      onSort={handleSort}
      treeData={treeData}
      onClearHighlight={onClearHighlight}
    />
  )

  const renderTreeNode = () =>
    editMerchandiseOrder ? (
      <Sortable
        data={treeData}
        onChange={handleSort}
        renderItem={renderItem}
        options={{
          handle: '.tree-sortable-handle',
          chosenClass: 'sort-tree-item',
          ghostClass: 'sort-tree-ghost',
          dragClass: 'sort-tree-drag',
        }}
      />
    ) : (
      treeData.map((item) => renderItem(item))
    )

  return (
    <Provider value={checkList}>
      {treeData.length ? (
        <div className='station-tree'>
          {moveCategory && (
            <CheckNumber
              data={checkData}
              handleMoveCategory={handleMoveCategory}
            />
          )}
          <div ref={ref}>{renderTreeNode()}</div>
        </div>
      ) : (
        <Flex
          alignCenter
          column
          style={{ paddingTop: '180px', paddingBottom: '400px' }}
        >
          <SvgEmpty style={{ fontSize: '60px' }} />
          <p style={{ color: '#798294' }}>{noDataText}</p>
        </Flex>
      )}
    </Provider>
  )
})

export default TreeList
