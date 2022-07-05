import { t } from 'gm-i18n'
import React, { FC, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableInfo, Tip } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import store from './store'
import Action from './component/action'
import TreeList from './component/tree_list'
import ItemEdit from './component/item_edit'
import ItemAction from './component/item_action'
import PopConfirm from './component/pop_confirm'
import { treeOptions } from '../../manage/interface'
import { rebuildTreeNode, rebuildTree, expandToId, findObject } from './util'
import _ from 'lodash'
import './style.less'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const CategoryList: FC = observer(() => {
  const [list, setList] = useState([])
  const [expandId, setExpandId] = useState('')
  const { checkList, spus, category2, category1, checkData, icons } = store
  const treeListRef = useRef(null)

  const node = null

  useEffect(() => {
    async function fetchData() {
      await store.getIcons()
      await store.getCategory()
    }

    fetchData()
  }, [])

  const handleCheck = (arr: string[]): void => {
    console.log('handleCheck', arr)
  }

  const handleExpand = (
    expand: boolean,
    value: { level: number; id: string; checked: boolean },
  ): void => {
    setExpandId('')
  }

  const handleMove = (value: {
    category_id_1: string
    category_id_2: string
    spu_id: string
  }): void => {
    console.log('handleMove', value)
  }

  const handleSort = (data: any, parent_id: any): void => {
    console.log('handleSort', data, parent_id)
  }

  const handleClearHighlight = (value: { highlight: boolean }): void => {
    console.log('handleClearHighlight', value)
  }

  const afterUpdate = (response: any, id: string, tip: string) => {
    Tip.success(tip)
    store.getCategory()
    setExpandId(id)
    return response
  }

  const handleEdit = (value: treeOptions, name: string, icon: any) => {
    const { category_id, level, parent_id } = value
    if (level === 2) {
      store.changeSpu(parent_id, category_id, name).then((json) => {
        return afterUpdate(json, category_id, '修改成功！')
      })
    } else {
      store.changeCategory(parent_id, category_id, name, icon).then((json) => {
        return afterUpdate(json, category_id, '修改成功！')
      })
    }
  }

  const handleHighlight = (): void => {
    console.log('handleHighlight')
  }

  const handleAddSubclass = (value: treeOptions): void => {
    const { level, category_id } = value
    // value 父级
    if (level === 1) {
      store.createSpu(category_id).then((json) => {
        return afterUpdate(json, json.response.spu.spu_id, '新增成功！')
      })
    } else {
      store.createCategory(category_id).then((json) => {
        return afterUpdate(
          json,
          json.response.category.category_id,
          '新增成功！',
        )
      })
    }
  }

  const handleChangeName = (name: string): void => {
    store.changeActiveCategory('name', name)
  }

  const handleCreateSpu = (value: treeOptions): void => {
    const { parent_id, category_id } = value
    const category2 = _.find(
      store.category2,
      (c) => c.category_id === parent_id,
    )
    window.open(
      `#/merchandise/manage/list/build_merchandise?category_id_1=${category2.parent_id}&category_id_2=${parent_id}&spu_id=${category_id}`,
    )
  }

  const handleDelete = (value: treeOptions): void => {
    const { category_id, level, parent_id } = value
    if (level === 2) {
      store.deleteSpu(category_id).then((json) => {
        return afterUpdate(json, parent_id, '删除成功！')
      })
    } else {
      store.deleteCategory(category_id).then((json) => {
        return afterUpdate(json, level === 0 ? '' : parent_id, '删除成功！')
      })
    }
  }

  const renderDelete = (value: any) => {
    const { name } = value
    return (
      <PopConfirm
        value={value}
        title={t('删除分类')}
        content={
          <>
            {t('是否确定删除分类')}
            <span
              className='gm-padding-left-5 gm-text-14'
              style={{ fontWeight: 'bold' }}
            >
              {name}
            </span>
            ？
          </>
        }
        onOkText={t('删除')}
        onOkType='danger'
        onOk={() => handleDelete(value)}
        onHighlight={handleHighlight}
      />
    )
  }

  const addActions = (list: treeOptions[]) => {
    list.forEach((item) => {
      item.edit = (
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY}
        >
          <ItemEdit
            value={item}
            icons={icons.slice()}
            onOk={handleEdit}
            onHighlight={handleHighlight}
          />
        </PermissionJudge>
      )
      item.actions = (
        <ItemAction
          value={item}
          onAddSubclass={handleAddSubclass}
          onChangeName={handleChangeName}
          onCreateSpu={handleCreateSpu}
          onHighlight={handleHighlight}
          renderDelete={renderDelete}
        />
      )
    })
  }

  // todo minyi scroll
  const handleLocation = (value: string) => {
    const flag = findObject(list, value)
    if (!flag) {
      return Tip.tip(t('没有找到该分类'))
    }
    setExpandId(flag.category_id)
  }

  useEffect(() => {
    const category1s = rebuildTreeNode(category1, 0, icons)
    const category2s = rebuildTreeNode(category2, 1)
    const spuss = rebuildTreeNode(spus, 2)
    addActions(category1s)
    addActions(category2s)
    addActions(spuss)

    const list = rebuildTree(category1s, rebuildTree(category2s, spuss))
    expandToId(expandId, list)
    setList(list)
  }, [category1, category2, spus, expandId])

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('分类总数'),
                content: list.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <Action
          onLocation={handleLocation}
          onAddCategory={() => setExpandId('')}
        />
      }
    >
      <TreeList
        treeData={list}
        checkList={checkList}
        checkData={checkData}
        ref={treeListRef}
        style={{
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
        }}
        onCheck={handleCheck}
        onExpand={handleExpand}
        onMove={handleMove}
        onSort={handleSort}
        onClearHighlight={handleClearHighlight}
      />
    </BoxTable>
  )
})

export default CategoryList
