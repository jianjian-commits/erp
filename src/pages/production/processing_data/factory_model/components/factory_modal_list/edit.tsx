import { t } from 'gm-i18n'
import React, { useRef, useEffect, useState, FC, FormEvent } from 'react'
import { Form, FormItem, FormButton, Input, Tip } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'

import SVGCompleted from '@/svg/completed.svg'
import SVGRemove from '@/svg/remove.svg'
import { ProcessorItem } from '../../interface'
import store from '../../store'

interface EditProps {
  item: ProcessorItem
}

const Edit: FC<EditProps> = observer(({ item }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { name, processor_id, parent_id } = item
  const [new_name, changeNewName] = useState(name)

  useEffect(() => inputRef.current!.focus(), [])

  const handleCancel = () => {
    if (processor_id === '') {
      // 如果是添加则删除当前项
      store.deleteFactoryModalItem(item.parent_id || '', item.processor_id)
      return
    }

    store.updateFactoryModalItem(
      item.parent_id || '',
      item.processor_id,
      'edit',
      false,
    )
  }

  const updateList = (new_processor_id: string) => {
    const { factory_modal_list } = store
    const index = _.findIndex(
      factory_modal_list,
      (m) => m.processor_id === new_processor_id,
    )
    if (index !== -1) {
      const list = toJS(factory_modal_list)
      list[index].expand = true
      store.updateFactoryModalList(list)
    }
  }

  const handleOk = () => {
    if (!_.trim(new_name).length) {
      Tip.danger(t('请填写模型名称'))
      return
    }
    if (_.trim(new_name).length > 30) {
      Tip.danger(t('模型名称不可超过30个字符'))
    }

    let new_processor_id: string = ''
    // 说明当前为新建状态，否则为编辑状态
    if (processor_id === '') {
      // 调用接口
      store
        .createFactoryModal(new_name, parent_id)
        .then((json) => {
          if (json) {
            Tip.success(t('新建成功'))
            const { processor } = json.response
            new_processor_id = processor?.parent_id || ''
            return store.getFactoryModalList()
          }
          return json
        })
        .then((json) => {
          // 找到新建的货位，更新状态值
          if (json) {
            updateList(new_processor_id)
          }

          return json
        })
      return
    }

    store
      .updateFactoryModal({ ...item, name: new_name })
      .then((json) => {
        if (json) {
          Tip.success(t('更新成功'))
          // 找到更新的货位，更新状态值
          const { processor } = json.response
          new_processor_id = processor?.parent_id || ''
          return store.getFactoryModalList()
        }

        return json
      })
      .then((json) => {
        // 找到新建的货位，更新状态值
        if (json) {
          updateList(new_processor_id)
        }

        return json
      })
  }

  const handleClick = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation()
  }

  return (
    <Form inline onClick={handleClick}>
      <FormItem>
        <Input
          placeholder={t('请输入模型名称')}
          className='form-control b-factory-edit-input'
          value={new_name}
          onChange={(event) => changeNewName(event.target.value)}
          ref={inputRef}
          maxLength={30}
        />
      </FormItem>
      <FormButton>
        <span
          className='b-factory-edit-icon'
          title={t('保存')}
          onClick={handleOk}
        >
          <SVGCompleted />
        </span>
        <div className='gm-gap-5' />
        <span
          className='b-factory-edit-icon'
          title={t('取消')}
          onClick={handleCancel}
        >
          <SVGRemove />
        </span>
      </FormButton>
    </Form>
  )
})

export default Edit
