import React, { useRef, useEffect } from 'react'
import { t } from 'gm-i18n'
import Steps from '@/common/components/steps'
import StepOne from './step_one'
import StepTwo from './step_two'
import store from './store'
import { observer } from 'mobx-react'

const CreateByMenu = observer(() => {
  const ref = useRef<any>(null)

  useEffect(() => {
    return () => store.init()
  }, [])

  function handleSetSelected(value: string) {
    if (ref.current) {
      ref.current.setSelected(value)
    }
  }

  const steps = [
    {
      value: '1',
      text: t('第一步：选择客户与日期'),
      children: <StepOne next={handleSetSelected.bind(null, '2')} />,
    },
    {
      value: '2',
      text: t('第二步：确认订单信息'),
      children: <StepTwo back={handleSetSelected.bind(null, '1')} />,
    },
  ]

  return <Steps steps={steps} ref={ref} />
})

export default CreateByMenu
