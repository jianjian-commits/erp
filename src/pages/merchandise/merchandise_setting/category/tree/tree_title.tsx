import React from 'react'
import { DataNode } from '@/common/interface'
import { t } from 'gm-i18n'
import { Divider, Modal, Button, Space } from 'antd'
import globalStore from '@/stores/global'
import {
  createLevelMap,
  hasCreateLevelList,
  hasCreateLevelListForLite,
} from '../constants'
import ProductImage from '@/common/components/product_image'
import { DeleteTreeNodeTip } from '@/pages/merchandise/components/common'
import store, { GoUpProps } from '../store'
import { Permission } from 'gm_api/src/enterprise'
import classNames from 'classnames'
import '../../../style.less'
import SVGTop from '@/svg/top.svg'
import SVGSort from '@/svg/cate-sort.svg'

interface TreeTitleProps {
  /** current Node */
  node: DataNode
  /** edit node func */
  handleEdit: (node: DataNode) => void
  /** create node func */
  handleCreate: (node: DataNode) => void
  /** delete node func */
  handleDelete: (id: string) => void
  /** 排序置顶 */
  handleGoUp?: (i: GoUpProps) => void
}

/** Tree title and action node */
const TreeTitle = (props: TreeTitleProps) => {
  const {
    node,
    handleEdit,
    handleCreate,
    handleDelete,
    handleGoUp,
    node: { title = '-', level = 0, icon, nodeTitle, key, parentId },
  } = props

  /**
   * 新建节点
   */
  const onCreate = () => {
    if (typeof handleCreate === 'function') handleCreate(node)
  }

  /**
   * 编辑节点
   */
  const onEdit = () => {
    if (typeof handleEdit === 'function') handleEdit(node)
  }

  const onDelete = () => {
    Modal.confirm({
      title: t('删除'),
      content: <DeleteTreeNodeTip text={node.title as string} />,
      okType: 'danger',
      onOk: () => {
        if (typeof handleDelete === 'function')
          handleDelete(node.value as string)
      },
    })
  }

  /** 轻巧版下只有二级分类 */
  const createLevelList = globalStore.isLite
    ? hasCreateLevelListForLite
    : hasCreateLevelList

  const renderSortIcon = () => {
    return (
      <>
        <SVGTop
          className='tw-text-3xl'
          onClick={() => {
            handleGoUp &&
              handleGoUp({
                key,
                level,
                parentId,
              } as GoUpProps)
          }}
        />
        <Divider type='vertical' />
      </>
    )
  }

  return (
    <>
      <div className='tree-title-node'>
        <span title={title as string} className='tree-title'>
          {icon && (
            <span className='tree-title-icon'>
              <ProductImage
                url={
                  store.iconList.find((f) => f.category_image_id === icon)
                    ?.image?.path || ''
                }
              />
            </span>
          )}
          {nodeTitle || title}
        </span>
        <span className='tree-title-placeholder-node' />
        {globalStore.isLite && title === '未分类' ? (
          <span
            className='tree-title-action'
            style={{
              paddingRight: 295,
            }}
          >
            <Space className='gm-text-24 gm-text-bold'>
              {renderSortIcon()}
              <SVGSort className='tw-text-3xl' />
            </Space>
          </span>
        ) : (
          <span className='tree-title-action'>
            {globalStore.isLite && (
              <Space className='gm-text-24 gm-text-bold'>
                {renderSortIcon()}
                <SVGSort className='tw-text-3xl' />
                <Divider type='vertical' />
              </Space>
            )}
            {createLevelList.includes(level) && (
              <>
                <Button
                  className={classNames({
                    merchandise_a_disabled: !globalStore.hasPermission(
                      Permission.PERMISSION_MERCHANDISE_CREATE_CATEGORY,
                    ),
                  })}
                  onClick={onCreate}
                  type='link'
                >
                  {t('新建')}
                  {createLevelMap[level]}
                  {t('级分类')}
                </Button>
                <Divider type='vertical' />
              </>
            )}
            <Button
              type='link'
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_CATEGORY,
                ),
              })}
              onClick={onEdit}
            >
              {t('编辑')}
            </Button>
            <Divider type='vertical' />
            <Button
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_DELETE_CATEGORY,
                ),
              })}
              type='link'
              onClick={onDelete}
            >
              {t('删除')}
            </Button>
          </span>
        )}
      </div>
    </>
  )
}

export default TreeTitle
