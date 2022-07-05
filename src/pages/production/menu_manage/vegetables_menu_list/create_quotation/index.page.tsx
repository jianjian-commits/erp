import { observer } from 'mobx-react'
import React, { useEffect, useRef, ChangeEvent } from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Input,
  Select,
  TimeSpanPicker,
  Switch,
  Transfer,
  Flex,
  Validator,
  TextArea,
  CheckboxGroup,
  Row,
  Col,
  Checkbox,
  Confirm,
  Tip,
} from '@gm-pc/react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { MenuQuotation, QuotationData } from '../interface'
import { Week } from '../enum'
import store from './store'

const MenuDetail = () => {
  const { viewType, quotation_id } = useGMLocation<{
    viewType?: string
    quotation_id?: string
  }>().query

  const {
    quotation_data: {
      inner_name,
      outer_name,
      description,
      is_active,
      is_default,
      customer_ids,
      menu_period_group_ids,
      start_day,
      start_time_front,
    },
    MenuPeriodGroups,
    CustomerGroups,
  } = store
  const refForm1 = useRef<Form>(null)
  const refForm2 = useRef<Form>(null)

  const isEdit = viewType === 'isEdit'
  useEffect(() => {
    Promise.all([
      store.fetchCustomer(),
      store.fetchMenuPeriodGroups(isEdit),
    ]).then(() => {
      if (isEdit && quotation_id) {
        store.fetchQuotation(quotation_id)
      }
      return null
    })

    return store.init
  }, [isEdit, quotation_id])

  const handleCancel = () => {
    history.push('/production/menu_manage/vegetables_menu_list')
  }

  const handleSave = () => {
    Confirm({
      title: t('编辑菜谱'),
      children: (
        <Flex column>
          <div>{t('请确认是否更新菜谱信息，更新后会产生如下变动：')}</div>
          <div className='gm-text-red gm-padding-top-10'>
            <div className='gm-margin-bottom-5'>
              {t('1. 立即更新默认菜谱的设置；')}
            </div>
            <div className='gm-margin-bottom-5'>
              {t('2. 立即更新客户关联的菜谱设置；')}
            </div>
            <div className='gm-margin-bottom-5'>
              {t('3. 菜谱的可见时间发生变更可能影响用户下单；')}
            </div>
          </div>
        </Flex>
      ),
      read: t('我已知晓上述风险，确认更新菜谱设置'),
    }).then(() => {
      if (quotation_id) {
        store.updateQuotation().then((json) => {
          Tip.success(t('修改成功'))
          history.push('/production/menu_manage/vegetables_menu_list')
          return json
        })
      } else {
        store.createQuotation().then((json) => {
          Tip.success(t('新建成功'))
          history.push('/production/menu_manage/vegetables_menu_list')
          return json
        })
      }
      return null
    })
  }

  const handleChange = <T extends keyof MenuQuotation>(
    key: T,
    value: MenuQuotation[T],
  ) => {
    store.updateQuotationData(key, value)
  }

  const handleCustomersSelect = (selected: []) => {
    store.updateCustomersSelected(selected)
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_UPDATE_CLEANFOOD_MENU,
        )
      }
      formRefs={[refForm1, refForm2]}
      onCancel={handleCancel}
      onSubmitValidated={handleSave}
    >
      <FormPanel title={t('基础信息')}>
        <Form hasButtonInGroup ref={refForm1} labelWidth='150px' disabledCol>
          <FormItem
            label={t('菜谱名称')}
            required
            validate={Validator.create([], inner_name)}
          >
            <Input
              style={{ width: '300px' }}
              value={inner_name}
              onChange={(e) => handleChange('inner_name', e.target.value)}
            />
          </FormItem>
          <FormItem
            label={t('菜谱名称（对外）')}
            required
            validate={Validator.create([], outer_name)}
          >
            <Input
              style={{ width: '300px' }}
              value={outer_name}
              onChange={(e) => handleChange('outer_name', e.target.value)}
            />
          </FormItem>
          <FormItem label={t('描述')}>
            <TextArea
              className='gm-form-control'
              style={{ width: '650px', height: 'auto' }}
              name='description'
              rows={2}
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                handleChange('description', e.target.value)
              }}
            />
          </FormItem>
          <FormItem
            label={t('选择餐次')}
            required
            validate={Validator.create([], menu_period_group_ids, (v) => {
              if (!v.length) {
                return '请勾选'
              }
              return ''
            })}
          >
            <CheckboxGroup
              value={menu_period_group_ids}
              onChange={(value) => {
                handleChange('menu_period_group_ids', value)
              }}
            >
              <Row>
                {_.map(MenuPeriodGroups, ({ value, text }, k) => (
                  <Col span={5} key={k}>
                    <Checkbox value={value}>{text}</Checkbox>
                  </Col>
                ))}
              </Row>
            </CheckboxGroup>
          </FormItem>
          <FormItem label={t('关联公司/客户')}>
            <Transfer
              rightTree
              className='gm-margin-top-10'
              leftStyle={{ width: '300px', height: '400px' }}
              rightStyle={{ width: '300px', height: '400px' }}
              leftTitle={t('全部公司/客户')}
              rightTitle={t('已选公司/客户')}
              list={CustomerGroups.slice()}
              selectedValues={customer_ids.slice()}
              onSelectValues={(selected: []) => handleCustomersSelect(selected)}
            />
            <div className='gm-text-desc gm-margin-top-10'>
              {t(
                '一个客户关联的菜谱只能有一个，如已关联菜谱，修改后将按最新关联菜谱展示商品',
              )}
            </div>
          </FormItem>
          <FormItem label={t('激活状态')}>
            <Switch
              checked={is_active === undefined ? true : is_active}
              onChange={() => {
                handleChange('is_active', !is_active)
              }}
              on={t('启用')}
              off={t('禁用')}
            />
            <div className='gm-text-desc gm-margin-top-10'>
              {t('菜谱启用后用户可正常下单，否则无法下单')}
            </div>
          </FormItem>
          <FormItem label={t('是否为默认菜谱')}>
            <Switch
              checked={is_default === undefined ? false : is_default}
              onChange={() => {
                handleChange('is_default', !is_default)
              }}
              on={t('是')}
              off={t('否')}
            />
            <div className='gm-text-desc gm-margin-top-10'>
              {t('设置为默认菜谱后，新加入的客户默认关联此菜谱')}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
      <FormPanel title={t('时间配置')}>
        <Form hasButtonInGroup ref={refForm2} labelWidth='150px' disabledCol>
          <FormItem label={t('更新时间')}>
            <Flex>
              <Select
                className='gm-margin-right-20'
                style={{ width: '150px' }}
                data={Week}
                value={Number(start_day)}
                onChange={(value: string) => {
                  handleChange('start_day', value + '')
                }}
              />

              <TimeSpanPicker
                style={{ width: '100px' }}
                date={start_time_front}
                onChange={(date: Date) => {
                  handleChange('start_time_front', date)
                }}
              />
            </Flex>
            <div className='gm-text-desc gm-margin-top-10'>
              {t(
                '示例：设置周五 08：00，即每周五8点开始更新下一周（周一至周日）的菜谱',
              )}
            </div>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
}

export default observer(MenuDetail)
