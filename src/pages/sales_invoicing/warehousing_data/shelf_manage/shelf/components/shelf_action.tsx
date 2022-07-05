import SvgDelete from '@/svg/delete.svg'
import SvgEditPen from '@/svg/edit_pen.svg'
import SvgPlus from '@/svg/plus.svg'
import {
  Button,
  Flex,
  Form,
  FormItem,
  Input,
  Modal,
  Popover,
  PopupContentConfirm,
  Switch,
  Tip,
  FormButton,
} from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useRef, useEffect } from 'react'
import '../../style.less'
import store, { initNewState } from '../store'
import Select_Warehouse_Default from '@/common/components/select_warehouse'

const { OperationIcon } = TableXUtil

interface ShelfEditState {
  name: string
  is_leaf?: boolean
  is_kid?: boolean
  warehouse_id?: string
}

interface EditProps {
  isEdit?: boolean
  action?: 'add' | 'edit'
  // hasKidSwitch?: boolean
  // hasLeafSwitch?: boolean
  data: ShelfEditState
  onChange: <T extends keyof ShelfEditState>(
    name: T,
    value: ShelfEditState[T],
  ) => void
  isUnassigned?: boolean
  kidDisabled?: boolean
  handleConfirm?: () => void
  handleCancel?: () => void
}

const Edit: FC<EditProps> = observer((props) => {
  const {
    isEdit,
    action,
    onChange,
    isUnassigned,
    kidDisabled,
    handleConfirm,
    handleCancel,
  } = props
  const {
    shelfNewState: { warehouse_id, name, is_kid, is_leaf },
  } = store

  useEffect(() => store.initState, [])

  // 只有新建才可以编辑最小层级
  const editAdd = isEdit && action === 'add'
  const isSwitch = !isEdit || editAdd

  return (
    <Form className='gm-margin-10'>
      <FormItem label={t('选择仓库')}>
        <Select_Warehouse_Default
          value={warehouse_id}
          // disabled={editAdd}
          disabled={isEdit}
          onChange={(value) => {
            onChange('warehouse_id', value as string)
          }}
        />
      </FormItem>
      <FormItem label={t('货位名称')}>
        <Input
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          className='gm-margin-right-10'
        />
      </FormItem>
      {isSwitch && (
        <>
          <FormItem label={t('是否子级货位')}>
            <Switch
              checked={!!is_kid}
              onChange={(value) => onChange('is_kid', value)}
              disabled={kidDisabled} // 未分配只能创建同级货位
            />
            {isUnassigned && (
              <div className='gm-text-desc'>
                {t('未分配货位只能新建同级货位')}
              </div>
            )}
          </FormItem>
          <FormItem label={t('是否最小层级')}>
            <Switch
              checked={!!is_leaf}
              onChange={(value) => onChange('is_leaf', value)}
            />
            <div className='gm-text-desc'>
              {t('最小层级的货位只能新建同级货位')}
            </div>
          </FormItem>
        </>
      )}
      {handleConfirm && (
        <FormButton>
          <Button className='gm-margin-right-15' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleConfirm}>
            {t('确认')}
          </Button>
        </FormButton>
      )}
    </Form>
  )
})

const ShelfAction: FC<Props> = observer((props) => {
  const { data } = props
  const { setNewState, shelfNewState: newState } = store
  const isEdit = data.value !== '0'

  const isUnassigned = data.shelf_id === '0'

  const delRef = useRef<Popover>(null)

  const handleNewChange = <T extends keyof ShelfEditState>(
    name: T,
    value: ShelfEditState[T],
  ) => {
    const { shelfNewState: newState } = store
    setNewState({ ...newState, [name]: value })
  }

  const checkName = (name: string) => {
    let bool = false
    if (!_.trim(name)) {
      Tip.danger(t('货位名称不能为空'))
      bool = true
    }
    return bool
  }

  const handleEdit = () => {
    const { shelfNewState: editState } = store
    if (checkName(editState.name)) return
    // editRef.current!.apiDoSetActive(false)
    store
      .updateShelf({
        ...data,
        name: editState.name,
        parent_id: data.parent_id,
        is_leaf: editState.is_leaf,
        shelf_id: data.shelf_id,
        warehouse_id: editState.warehouse_id,
      })
      .then((json) => {
        if (json.code === 20770005) {
          Tip.danger(t('不能存在同名货位'))
        } else {
          Modal.hide()
          store.fetchShelf()
        }
        return json
      })
    setNewState({ ...initNewState })
    // setEditState({ ...initEditState })
  }

  const handleDelete = () => {
    delRef.current!.apiDoSetActive(false)
    store.deleteShelf(data.shelf_id).then(() => {
      return store.fetchShelf()
    })
  }

  const handleNew = () => {
    const { shelfNewState: newState } = store
    if (checkName(newState.name)) return
    // newRef.current!.apiDoSetActive(false)
    store
      .createShelf({
        name: newState.name,
        parent_id: newState.is_kid ? data.shelf_id : data.parent_id, // 如果是子级的话，parentId取当前shelf_id
        is_leaf: newState.is_leaf,
        warehouse_id: newState.warehouse_id,
      })
      .then((json) => {
        if (json.code === 20770005) {
          Tip.danger(t('不能存在同名货位'))
        } else {
          Modal.hide()
          store.fetchShelf()
        }
        return json
      })
    setNewState({ ...initNewState })
  }

  const handleCancel = () => {
    !isUnassigned && delRef.current!.apiDoSetActive(false)
    // !isUnassigned && editRef.current!.apiDoSetActive(false)
    // newRef.current!.apiDoSetActive(false)
    Modal.hide()

    setNewState({ ...initNewState })
    // setEditState({ ...initEditState })
  }

  const handCreateNew = (action: 'add' | 'edit' = 'add') => {
    // 打开弹窗，赋新值

    if (isEdit) {
      // 编辑操作
      let _data = data
      if (action === 'add') {
        _data = {
          ...initNewState,
          isKid: true,
          parent_id: data.shelf_id,
          warehouse_id: data.warehouse_id,
        }
      }
      store.setNewState(_data)
    }

    Modal.render({
      title: isEdit ? t('编辑货位') : t('新建货位'),
      style: {
        width: '400px',
      },
      children: (
        <Edit
          onChange={handleNewChange}
          isEdit={isEdit}
          action={action}
          data={newState}
          // hasKidSwitch={!isEdit}
          // hasLeafSwitch={!isEdit} // 只有新建才可以编辑最小层级
          isUnassigned={isUnassigned}
          handleConfirm={action === 'edit' ? handleEdit : handleNew}
          handleCancel={handleCancel}
          kidDisabled={data.is_leaf || isUnassigned} // 当前标记为最小层级时，不可新建子级,is_kid默认为false
        />
      ),
    })
  }

  return (
    <Flex
      alignCenter
      justifyCenter
      className='gm-margin-right-10'
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      {!isUnassigned && (
        <OperationIcon className='b-shelf-action gm-text-12' tip={t('编辑')}>
          <SvgEditPen onClick={() => handCreateNew('edit')} />
        </OperationIcon>
      )}
      <OperationIcon
        className='b-shelf-action gm-text-12 gm-margin-left-10'
        tip={t('添加')}
      >
        <SvgPlus onClick={() => handCreateNew('add')} />
      </OperationIcon>
      {!isUnassigned && (
        <Popover
          ref={delRef}
          showArrow
          popup={
            <PopupContentConfirm
              type='delete'
              title={t('删除货位')}
              onCancel={handleCancel}
              onDelete={handleDelete}
            >
              {t(
                '删除后该货位层级及子级中的商品信息将移入“未分配“中，请确认是否删除？',
              )}
            </PopupContentConfirm>
          }
        >
          <OperationIcon
            className='b-shelf-action gm-text-12 gm-margin-left-10'
            tip={t('删除')}
          >
            <SvgDelete />
          </OperationIcon>
        </Popover>
      )}
    </Flex>
  )
})

export default ShelfAction
