/* eslint-disable no-unused-expressions */
import React, { FC, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
// import { FormGroup } from '@gm-pc/react'
import BaseInfo from './components/base_info'
import BaseInfoLook from './components/base_info_look'
import ServiceInfo from './components/service_info'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { StudentFormValidator } from '../interface'
import { message, Form, Button } from 'antd'
import store from './store'
import _ from 'lodash'
import './style.less'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
interface FromProps {
  validateFrom: () => void
}

const Create: FC = observer(() => {
  const location = useGMLocation<{ customer_id: string; is_look: boolean }>()

  const form1 = useRef<FromProps>(null)
  const form2 = useRef<StudentFormValidator>(null)

  useEffect(() => {
    const getMenuList = () => {
      if (location.query.customer_id) {
        store.getShoolCustomer(location.query.customer_id)
        store.getCodeImg(location.query.customer_id)
      } else {
        store.getMenuPeriodList()
      }
    }
    getMenuList()
    return () => store.init()
  }, [])

  const handleCancel = () => {
    window.close()
  }

  const handleCreate = async () => {
    const res = await form2.current?.ValidatorChange()
    const formRes = await form1.current?.validateFrom()
    if (!res) {
      message.warning(t('请完善订单周期'))
      return
    }
    if (!verifyReceive()) {
      message.warning(t('请完善收货日期'))
      return
    }
    if (!formRes) {
      message.warning(t('请完善基础信息'))
      return
    }
    if (location.query.customer_id) {
      store.updateSchoolCustomer()
    } else {
      store.createSchool().then(() => {
        history.push(`/customer/school/class_management`)
      })
    }
  }

  const verifyReceive = () => {
    const result = _.every(
      store.serviceInfo.delivery_infos,
      (item) => item.receive_date !== null,
    )
    return result
  }

  return (
    <>
      {location.query.is_look ? (
        <>
          <BaseInfoLook is_look={location.query.is_look} />
          <ServiceInfo is_look={location.query.is_look} />
        </>
      ) : (
        <div className='school'>
          <BaseInfo ref={form1} />
          <ServiceInfo ref={form2} />
          <ButtonGroupFixed
            onCancel={() => {
              history.go(-1)
            }}
            ButtonNode={
              <>
                <Button type='primary' onClick={handleCreate}>
                  {t('保存')}
                </Button>
              </>
            }
          />
        </div>
      )}
    </>
  )
})

export default Create
