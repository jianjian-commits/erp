import SVGTaskSplit from '@/svg/task_split.svg'
import { Button, Form, FormButton, Modal } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { message } from 'antd'
import { t } from 'gm-i18n'
import { ProcessTask_State } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import type { ChangeListTpe } from '../../../interface'
import store from '../../../store'
import SplitProcessTask from './split_process_task'

const Operation: FC<ChangeListTpe> = (props) => {
  const { OperationCellRowEdit, OperationIcon } = TableXUtil
  const { index, unitName, onChange } = props
  const { processor, edit, process_task_id, process_task, splitPrepareList } =
    store.list[index]

  const handleSplit = () => {
    if (processor === '0') {
      message.warning(t('请先分配车间'))
      return
    }
    Modal.render({
      children: (
        <SplitProcessTask
          unitName={unitName!}
          process_task_id={process_task_id}
          parentProcessor={processor}
          splitPrepareList={splitPrepareList}
        />
      ),
      title: t('拆分'),
      size: 'md',
      onHide: Modal.hide,
    })
  }

  const saveInfo = () => {
    if (processor === '0') {
      message.warning(t('未选择车间'))
      return
    }
    store.updateProcessTask(index).then(() => {
      message.success(t('修改成功'))
      Modal.hide()
      store.doRequest()
      return null
    })
  }

  const handleCancel = () => {
    store.doRequest()
  }

  const handleSave = () => {
    Modal.render({
      style: {
        width: '400px',
      },
      title: t('提示'),
      children: (
        <Form onSubmit={saveInfo}>
          <div className='gm-margin-left-10'>
            <div>
              {t(
                '修改车间后，已拆分指令的小组将全部展示该车间下的任一小组，是否确认修改？',
              )}
            </div>
            <span>{t('如有需要可重新拆分指令')}</span>
          </div>
          <FormButton btnPosition='right'>
            <Button
              onClick={() => {
                Modal.hide()
              }}
            >
              {t('取消')}
            </Button>
            <span className='gm-gap-10' />
            <Button type='primary' htmlType='submit'>
              {t('确认')}
            </Button>
          </FormButton>
        </Form>
      ),
    })
  }

  return (
    <OperationCellRowEdit
      disabled={process_task.state !== ProcessTask_State.STATE_PREPARE}
      isEditing={edit}
      onClick={() => {
        onChange(index, 'edit', true)
      }}
      onCancel={handleCancel}
      onSave={handleSave}
    >
      {process_task.state !== ProcessTask_State.STATE_FINISHED &&
        !!splitPrepareList.length && (
          <OperationIcon onClick={handleSplit} tip={t('拆分')}>
            <SVGTaskSplit />
          </OperationIcon>
        )}
    </OperationCellRowEdit>
  )
}

export default observer(Operation)
