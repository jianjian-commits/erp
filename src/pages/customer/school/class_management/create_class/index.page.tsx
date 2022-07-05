/* eslint-disable no-unused-expressions */
import React, { useEffect, useRef } from 'react'
import StudentInfo from './components/student_info'
import BaseInfo from './components/base_info'
import { Button, message } from 'antd'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { t } from 'gm-i18n'
import './style.less'
import store from './store'
import { observer } from 'mobx-react'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { StudentRef } from './interface'
const CreateClass = () => {
  const location =
    useGMLocation<{ class_id: string; customer_id: string; is_look: boolean }>()
  useEffect(() => {
    return store.init()
  }, [])

  const studentRef = useRef<StudentRef>(null)
  const handleSave = async () => {
    if (store.baseInfo.name === '') {
      message.error(t('请输入班级名称!'))
      return
    }

    if (location.query.class_id) {
      const res = await studentRef.current?.validateFieldFn()
      if (res?.errorFields && res?.errorFields[0]) {
        message.error('请输入完整的学生信息')
        return
      }
      Promise.all([store.updateCustomer(), store.updateStudentList()]).then(
        () => {
          message.success(t('修改成功'))
        },
      )
    } else {
      store.createClass(location.query.customer_id).then(() => {
        message.success(t('创建成功'))
        history.push('/customer/school/class_management')
      })
    }
  }
  const onCancel = () => {
    window.close()
  }
  return (
    <div className='student-class'>
      <BaseInfo
        is_look={location.query.is_look}
        class_id={location.query.class_id}
      />
      <StudentInfo ref={studentRef} is_look={location.query.is_look} />
      {!location.query.is_look && (
        <ButtonGroupFixed
          onCancel={onCancel}
          ButtonNode={
            <Button onClick={handleSave} type='primary'>
              {t('保存')}
            </Button>
          }
        />
      )}
    </div>
  )
}

export default observer(CreateClass)
