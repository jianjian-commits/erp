import React, { FC } from 'react'
import { t } from 'gm-i18n'
import {
  FormGroup,
  FormPanel,
  ControlledForm,
  ControlledFormItem,
  Flex,
  TimeSpanPicker,
  Tip,
  useControlFormRef,
} from '@gm-pc/react'
import { observer } from 'mobx-react'
import { useMount } from 'react-use'
import { Permission } from 'gm_api/src/enterprise'
import { AppointTimeSettings_Type } from 'gm_api/src/preference'

import { dateTMM, MToDate } from '@/common/util'
import globalStore from '@/stores/global'
import store, { SelectedItem } from './store'
import '../styles.less'
import { savePromise } from '@/common/util/promise'

interface SettingItemProp {
  selected?: SelectedItem
  text: string
  onChange: (v: SelectedItem) => void
}

interface SettingTimeProp {
  value: {
    label: string
    text: string
    type: AppointTimeSettings_Type
  }
  onChange: (index: number, selected: SelectedItem) => void
}

const SettingItemSelector: FC<SettingItemProp> = observer(
  ({ selected = {}, onChange, text }) => {
    const timeSpanProps = {
      date: MToDate(selected.pre_start_time || '0'),
      span: 60 * 60 * 1000,
      onChange: (date: Date) => {
        onChange({
          pre_start_time: dateTMM(date),
        })
      },
    }
    return (
      <Flex column>
        <Flex>
          <Flex className='flex-text d-padding-6 gm-padding-right-10'>
            {text}
          </Flex>
          <TimeSpanPicker {...timeSpanProps} />
          <Flex className='gm-padding-lr-10 d-padding-6'>- {t('第二天')}</Flex>
          <TimeSpanPicker {...timeSpanProps} disabled />
          <Flex className='gm-padding-lr-10 d-padding-6'>
            {t('之间的订单为当日的待采订单')}
          </Flex>
        </Flex>
      </Flex>
    )
  },
)

const SettingTime: FC<SettingTimeProp> = observer((props) => {
  const {
    value: { label, text, type },
    onChange,
  } = props
  const item = store?.settings.find(
    (v) =>
      v.type ===
      AppointTimeSettings_Type.NONPROCESSED_PURCHASE_TIME_BEFORE_ORDER_RECV,
  )!
  const index = store.settings.indexOf(item)
  return (
    <ControlledFormItem label={label} key={type}>
      <SettingItemSelector
        text={text}
        selected={item}
        onChange={onChange.bind(null, index)}
      />
    </ControlledFormItem>
  )
})

const WaitForPurchaseOrder = observer(() => {
  useMount(store.getSetting)

  function handleSave() {
    savePromise(store.updateSetting)
  }
  function handleChange(index: number, selected: SelectedItem) {
    store.updateSelected(index, selected)
  }

  const formRef = useControlFormRef()

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_APPOINT_TIME_SETTINGS,
        )
      }
      // @ts-ignore
      formRefs={[formRef]}
      onSubmit={handleSave}
    >
      <ControlledForm labelWidth='166px' hasButtonInGroup disabledCol>
        <FormPanel title={t('待采订单配置')}>
          {[
            {
              label: t('设置待采订单日汇总规则'),
              text: '汇总销售订单收货时间在当天',
              type: AppointTimeSettings_Type.NONPROCESSED_PURCHASE_TIME_BEFORE_ORDER_RECV,
            },
          ].map((item) => {
            return (
              <SettingTime
                key={item.label}
                value={item}
                onChange={handleChange}
              />
            )
          })}
        </FormPanel>
      </ControlledForm>
    </FormGroup>
  )
})

export default WaitForPurchaseOrder
