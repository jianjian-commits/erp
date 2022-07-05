import _ from 'lodash'
import React from 'react'

export function rebuildTreeData(list) {
  return list.map((item) => {
    return {
      value: item.category_id,
      text: `${item.category_id}${item.name}`,
      children: item.children.length ? rebuildTreeData(item.children) : null,
    }
  })
}

export function findObject(list, value) {
  let result
  if (list.some((item) => item.category_id === value || item.name === value)) {
    result = list.find(
      (item) => item.category_id === value || item.name === value,
    )
  } else {
    _.forEach(list, (item) => {
      if (item.children) {
        result = findObject(item.children, value)
        if (result) {
          return false
        }
      }
    })
  }
  return result
}

/**
 * 判断当前节点勾选状态，并将其子节点的勾选状态设为一致
 * @param value {{checked,children}}
 */
export function checkChildren(value) {
  const { checked, children } = value
  children.forEach((item) => {
    item.checked = checked
    checkChildren(item)
  })
}

/**
 * 通过当前节点勾选状态，判断其父节点是否需要勾选
 * @param id {string}
 * @param list {object[]}
 * @returns {boolean}
 */
export function checkParent(category_id, list) {
  if (list.map((item) => item.category_id).includes(category_id)) {
    const value = list.find((item) => item.category_id === category_id)
    value.checked = value.children.every((item) => item.checked)
    return !!list.every((item) => item.checked)
  } else {
    list.forEach((item) => {
      item.checked = checkParent(category_id, item.children)
    })
  }
}

/**
 * 获取勾选的id集合
 * @param list {object[]}
 * @param checkedList {string[]}
 */
export function getCheckList(list, checkedList) {
  list.forEach((item) => {
    if (item.checked) {
      checkedList.push(item.category_id)
    } else {
      getCheckList(item.children, checkedList)
    }
  })
}

export function rebuildTreeNode(list, level, icons) {
  return _.map(list, (item) => {
    const { category_id, name, icon, parent_id, url, expand } = item
    const option = {
      expand,
      category_id,
      name,
      value: category_id,
      level,
      icon,
      children: [],
    }
    option.title =
      level === 0 ? (
        <span>
          <img
            src={url}
            alt={item.category_id}
            style={{ width: '40px', height: '40px' }}
            className='gm-margin-right-10'
          />
          {name}
        </span>
      ) : (
        name
      )
    if (parent_id) {
      option.parent_id = parent_id
    }
    return option
  })
}

export function rebuildTree(list1, list2) {
  list1.forEach((x) => {
    list2.forEach((y) => {
      if (y.parent_id === x.category_id) {
        x.children.push(y)
      }
    })
  })
  return list1
}

/**
 * 展开到id项
 * @param id {number}
 * @param list {object[]}
 */
export const expandToId = (id, list) => {
  if (!id || !list.length) return list
  const _list = list
  if (_list.some((item) => item.category_id === id)) {
    return true
  } else {
    _.forEach(_list, (item) => {
      if (item.children.length) {
        item.expand = expandToId(id, item.children)
        if (item.expand) {
          return false
        }
      }
    })
  }
  return _list.some((item) => item.expand)
}

/**
 * 查找分类名称对应的树节点
 * @param name {string}
 * @param list {object[]}
 * @returns {boolean}
 */
export const findTreeNode = (name, list) => {
  let flag = false
  if (list.some((item) => item.name === name)) {
    const beFound = list.find((item) => item.name === name)
    flag = true
    if (!this.node) {
      this.node = beFound
    }
  } else {
    list.forEach((item) => {
      item.expand = findTreeNode(name, item.children)
      flag = flag || item.expand
    })
  }
  return flag
}
