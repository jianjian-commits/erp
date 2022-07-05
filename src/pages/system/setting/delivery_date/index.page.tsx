import TableListTips from '@/common/components/table_list_tips'
import globalStore from '@/stores/global'
import {
  Flex,
  Form,
  FormGroup,
  FormItem,
  FormPanel,
  InputNumber,
  TimeSpanPicker,
  Tip,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { AppointTimeSettings_Type } from 'gm_api/src/preference'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useRef } from 'react'
import '../styles.less'
import type { SelectedItem } from './store'
import store from './store'

interface SettingItemProp {
  selected?: SelectedItem
  text: string
  disabledTime?: boolean
  onChange: (v: {
    type: keyof SelectedItem
    value: SelectedItem[keyof SelectedItem]
  }) => void
}

interface SettingTimeProp {
  isTest?: boolean
  value: {
    label: string
    text: string
    type: AppointTimeSettings_Type
    disabledTime?: boolean
  }
  onChange: <T extends keyof SelectedItem>(
    index: number,
    selected: {
      type: T
      value: SelectedItem[T]
    },
  ) => void
}

const SettingItemSelector: FC<SettingItemProp> = observer(
  ({ selected = {}, onChange, text, disabledTime }) => {
    function handleChange<T extends keyof SelectedItem>(
      type: T,
      value: SelectedItem[T] | null,
    ) {
      onChange({ type, value })
    }
    return (
      <Flex column>
        <Flex>
          <Flex className='flex-text d-padding-6'>{text}</Flex>
          <Flex className='gm-padding-lr-10 d-padding-6'>-</Flex>
          <Flex alignCenter>
            <InputNumber
              style={{ width: 100 }}
              precision={0}
              min={0}
              value={selected.before_days}
              onChange={(value) => handleChange('before_days', value)}
            />
            <span className='gm-padding-lr-10'>{t('天')},</span>
            <TimeSpanPicker
              date={selected.time!}
              onChange={(date) => handleChange('time', date as Date)}
              disabled={disabledTime}
            />
          </Flex>
        </Flex>
      </Flex>
    )
  },
)

const SettingTime: FC<SettingTimeProp> = observer((props) => {
  const {
    value: { label, text, type, disabledTime },
    onChange,
    isTest,
  } = props
  return (
    <FormItem label={label} key={type}>
      <SettingItemSelector
        text={text}
        selected={store.selectedList[+type - 1]}
        onChange={onChange.bind(null, +type - 1)}
        disabledTime={disabledTime}
      />
      {isTest && (
        <div className='gm-text-desc gm-margin-top-10'>
          {t('仅适用于有组合生产计划的预生产')}
        </div>
      )}
    </FormItem>
  )
})

const DeliveryDate = observer(() => {
  useEffect(() => {
    store.getSetting()
  }, [])

  function handleSave() {
    store
      .updateSetting()
      .then(() => {
        Tip.success(t('保存成功'))
        return null
      })
      .catch(() => {
        Tip.danger(t('保存失败'))
      })
  }
  function handleChange<T extends keyof SelectedItem>(
    index: number,
    selected: {
      type: T
      value: SelectedItem[T]
    },
  ) {
    store.updateSelected(index, selected.type, selected.value)
  }

  const formRef = useRef<Form>(null)
  const formRefSome = useRef<Form>(null)
  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_PREFERENCE_UPDATE_APPOINT_TIME_SETTINGS,
        )
      }
      formRefs={[formRef]}
      onSubmit={handleSave}
    >
      <div className='gm-padding-top-10'>
        <TableListTips
          tips={[
            <div key={0}>
              {t(
                '来自销售订单的商品，发布计划时可设置默认进入采购、生产、包装计划的交期时间；日期设置含当日，指具体日期如8月9日，时间设置指交期的具体截止时间，如早上6点。',
              )}
              <br />
              {t(
                '示例：加工品采购计划交期设置为”收货日期-2天”，时间设置为06：00，订单的收货日期为08-11，则采购计划交期为08-09 06：00',
              )}
            </div>,
            t('预生产的商品，发布生产计划时可设置原料生成采购计划的交期时间'),
            t(
              '预包装的商品，发布包装计划时可设置原料生成生产计划的交期时间，采购计划交期将根据预生产发布计划的设置来生成',
            ),
          ].filter(Boolean)}
        />
      </div>
      <FormPanel title={t('销售订单发布计划')}>
        <Form ref={formRef} labelWidth='166px' hasButtonInGroup disabledCol>
          {_.map(
            [
              {
                label: t('非加工品采购计划交期设置'),
                text: '收货日期',
                type: AppointTimeSettings_Type.NONPROCESSED_PURCHASE_TIME_BEFORE_ORDER_RECV,
              },
              {
                label: t('加工品采购计划交期设置'),
                text: '收货日期',
                type: AppointTimeSettings_Type.PROCESSED_INGREDIENT_PURCHASE_TIME_BEFORE_ORDER_RECV,
              },
              {
                label: t('生产计划交期设置'),
                text: `单品 收货日期`,
                type: AppointTimeSettings_Type.PROCESSED_CLEANFOOD_PRODUCE_TIME_BEFORE_ORDER_RECV,
                disabledTime: true,
              },
              {
                label: '',
                text: '组合 收货日期',
                type: AppointTimeSettings_Type.PROCESSED_PRODUCE_TIME_BEFORE_ORDER_RECV,
                disabledTime: true,
              },
              {
                label: t(''),
                text: '包装 收货日期',
                type: AppointTimeSettings_Type.PROCESSED_PACK_TIME_BEFORE_ORDER_RECV,
                disabledTime: true,
              },
            ],
            ({ label, text, type, disabledTime }) => {
              return (
                <SettingTime
                  value={{ label, text, type, disabledTime }}
                  onChange={handleChange}
                />
              )
            },
          )}
        </Form>
      </FormPanel>

      {/* <FormPanel title={t('预包装发布计划')}>
        <Form ref={formRefSome} labelWidth='166px' hasButtonInGroup disabledCol>
          {_.map(
            [
              {
                label: t('采购计划交期设置'),
                text: '包装计划',
                type: AppointTimeSettings_Type.PURCHASE_TIME_BEFORE_PACK,
              },
              {
                label: t('生产计划交期设置'),
                text: ' 单品 包装计划',
                type: AppointTimeSettings_Type.CLEANFOOD_PRODUCE_TIME_BEFORE_PACK,
              },
              {
                label: '',
                text: ' 组合 包装计划',
                type: AppointTimeSettings_Type.PRODUCE_TIME_BEFORE_PACK,
              },
            ],
            ({ label, text, type }) => {
              return (
                <SettingTime
                  value={{ label, text, type }}
                  onChange={handleChange}
                />
              )
            },
          )}
        </Form>
      </FormPanel>
      <FormPanel title={t('预生产发布计划')}>
        <Form ref={formRefSome} labelWidth='166px' hasButtonInGroup disabledCol>
          {_.map(
            [
              {
                label: t('采购计划交期设置'),
                text: '生产计划',
                type: AppointTimeSettings_Type.PURCHASE_TIME_BEFORE_PRODUCE,
              },
              {
                label: t('生产计划交期设置'),
                text: ' 单品 生产计划',
                type: AppointTimeSettings_Type.CLEANFOOD_TIME_BEFORE_PRODUCE,
              },
            ],
            ({ label, text, type }) => {
              return (
                <SettingTime
                  value={{ label, text, type }}
                  onChange={handleChange}
                  isTest={
                    type ===
                    AppointTimeSettings_Type.CLEANFOOD_TIME_BEFORE_PRODUCE
                  }
                />
              )
            },
          )}
        </Form>
      </FormPanel> */}
      <FormPanel title={t('发布需求')}>
        <Form ref={formRefSome} labelWidth='166px' hasButtonInGroup disabledCol>
          {_.map(
            [
              {
                label: t('采购计划交期设置'),
                text: '生产计划交期',
                type: AppointTimeSettings_Type.CLEANFOOD_TIME_BEFORE_PRODUCE,
              },
            ],
            ({ label, text, type }) => {
              return (
                <SettingTime
                  value={{ label, text, type }}
                  onChange={handleChange}
                />
              )
            },
          )}
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default DeliveryDate
