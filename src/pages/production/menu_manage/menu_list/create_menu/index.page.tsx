/* eslint-disable promise/no-nesting */
import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Input,
  Switch,
  Transfer,
  Flex,
  Validator,
  Tip,
  TextArea,
  Confirm,
  CheckboxGroup,
  Row,
  Col,
  Checkbox,
} from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { ListCustomer, Customer_Type, Permission } from 'gm_api/src/enterprise'
import store from './store'
import { MenuData } from './interface'
import '../style.less'
import { levelList } from '@/pages/customer/type'
import globalStore from '@/stores/global'
import { Filters_Bool } from 'gm_api/src/common'
import { InputNumber } from 'antd'
import { toJS } from 'mobx'

interface MenuQuery {
  viewType?: string
  menu_id?: string
  __is_default?: string
}
const BaseSetting = () => {
  const refForm1 = useRef<Form>(null)
  const location = useGMLocation<MenuQuery>()
  const { viewType, menu_id, __is_default } = location.query
  const isCreate = viewType === 'isCreate'
  const [customers, setCustomers] = useState<levelList[]>([])

  useEffect(() => {
    const fetchCustomer = ListCustomer({
      paging: { limit: 999 },
      level: 1,
      need_child_customers: true, // 返回所有班级, 在child_customers
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers, child_customers, child_customer_relation } =
        json.response

      const _customers = _.map(customers, (_school) => {
        return {
          ..._school,
          text: _school?.name,
          value: _school?.customer_id,
          children: _.map(
            child_customer_relation?.[_school?.customer_id]?.values,
            (class_id) => {
              const _class = child_customers[class_id]
              return {
                ..._class,
                value: _class?.customer_id,
                text: _class?.name,
              }
            },
          ),
        }
      })

      setCustomers(_customers)
      return json
    })

    const fetchMenuPeriodGroups = store.fetchMenuPeriodGroups(isCreate)

    Promise.all([fetchCustomer, fetchMenuPeriodGroups]).then(() => {
      if (!isCreate && menu_id) {
        store.fetchMenu(menu_id)
      }
      return null
    })

    return () => {
      store.init()
    }
  }, [isCreate, menu_id])

  const handleCancel = () => {
    history.push('/production/menu_manage/menu_list')
  }

  const handleSubmitPre = () => {
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
              {t('2. 立即更新班级关联的菜谱设置；')}
            </div>
            <div className='gm-margin-bottom-5'>
              {t('3. 菜谱的可见时间发生变更可能影响用户下单；')}
            </div>
          </div>
        </Flex>
      ),
      read: t('我已知晓上述风险，确认更新菜谱设置'),
    }).then(() => {
      if (menu_id) {
        store.updateMenu().then((json) => {
          Tip.success(t('修改成功'))
          return json
        })
      } else {
        store.createMenu().then((json) => {
          Tip.success(t('新建成功'))
          history.push('/production/menu_manage/menu_list')
          return json
        })
      }
      return null
    })
  }

  const handleChange = <T extends keyof MenuData>(
    key: T,
    value: MenuData[T],
    id?: string,
  ) => {
    if (key === 'meal_label') {
      const params = { ...store.menu_data.meal_label, [id as string]: value }
      store.updateMenuData(key, params)
      return
    }
    store.updateMenuData(key, value)
  }

  const handleCustomersSelect = (selected: string[]) => {
    store.updateCustomersSelected(selected)
  }

  return (
    <FormGroup
      disabled={
        !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_UPDATE_MENU,
        )
      }
      formRefs={[refForm1]}
      onCancel={handleCancel}
      onSubmitValidated={handleSubmitPre}
    >
      <FormPanel title={t('基础信息')}>
        <Form hasButtonInGroup ref={refForm1} labelWidth='150px' disabledCol>
          <FormItem
            label={t('菜谱名称')}
            required
            validate={Validator.create([], store.menu_data.inner_name)}
          >
            <Observer>
              {() => {
                const { inner_name } = store.menu_data
                return (
                  <Input
                    maxLength={8}
                    style={{ width: '300px' }}
                    value={inner_name}
                    onChange={(e) => handleChange('inner_name', e.target.value)}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem
            label={t('菜谱名称（对外）')}
            required
            validate={Validator.create([], store.menu_data.outer_name)}
          >
            <Observer>
              {() => {
                const { outer_name } = store.menu_data
                return (
                  <Input
                    maxLength={8}
                    style={{ width: '300px' }}
                    value={outer_name}
                    onChange={(e) => handleChange('outer_name', e.target.value)}
                  />
                )
              }}
            </Observer>
          </FormItem>
          <FormItem label={t('描述')}>
            <Observer>
              {() => {
                const { description } = store.menu_data
                return (
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
                )
              }}
            </Observer>
          </FormItem>
          <FormItem
            label={t('选择餐次')}
            required
            validate={Validator.create(
              [],
              store.menu_data.menu_period_group_id,
              (v) => {
                if (!v.length) {
                  return '请勾选'
                }
                const verfy = _.every(v, (item) => {
                  return store.menu_data.meal_label[item] !== undefined
                })
                if (!verfy) {
                  return '请输入餐次'
                }
                return ''
              },
            )}
          >
            <Observer>
              {() => {
                const {
                  menu_data: { menu_period_group_id, meal_label },
                  MenuPeriodGroups,
                } = store
                return (
                  <CheckboxGroup
                    value={menu_period_group_id}
                    onChange={(value) => {
                      handleChange('menu_period_group_id', value)
                    }}
                  >
                    <Row>
                      {_.map(MenuPeriodGroups, (v) => {
                        const show = _.find(
                          menu_period_group_id,
                          (item) => item === v.id,
                        )
                        return (
                          <Col
                            span={5}
                            key={v.id}
                            className='gm-margin-bottom-10'
                          >
                            <Flex alignStart>
                              <Checkbox value={v.id}>{v.name}</Checkbox>
                              {show ? (
                                <>
                                  <InputNumber
                                    style={{
                                      width: '100px',
                                      marginTop: '-5px',
                                      height: '30px',
                                    }}
                                    precision={2}
                                    min={0}
                                    value={+meal_label[v.id] || '0'}
                                    placeholder={t('请输入餐标')}
                                    onChange={(value) => {
                                      handleChange(
                                        'meal_label',
                                        (value || 0) as any,
                                        v.id,
                                      )
                                    }}
                                  />
                                  <span className='gm-margin-left-5'>
                                    {t('元')}
                                  </span>
                                </>
                              ) : null}
                            </Flex>
                          </Col>
                        )
                      })}
                    </Row>
                  </CheckboxGroup>
                )
              }}
            </Observer>
          </FormItem>

          <FormItem label={t('关联学校/班级')}>
            <>
              <Observer>
                {() => {
                  const { customer_data } = store
                  const value = _.map(customer_data, (item) => item.customer_id)
                  console.log('this.customer_data', toJS(store.customer_data))
                  return (
                    <Transfer
                      rightTree
                      className='gm-margin-top-10'
                      leftStyle={{ width: '300px', height: '400px' }}
                      rightStyle={{ width: '300px', height: '400px' }}
                      leftTitle={t('全部学校/班级')}
                      rightTitle={t('已选学校/班级')}
                      list={customers.slice()}
                      selectedValues={value}
                      onSelectValues={(selected: []) =>
                        handleCustomersSelect(selected)
                      }
                    />
                  )
                }}
              </Observer>
              <div className='gm-text-desc gm-margin-top-10'>
                {t(
                  '一个班级在一个类型下关联的菜谱只能有一个，如已关联菜谱，修改后将按最新关联菜谱展示商品',
                )}
              </div>
            </>
          </FormItem>

          <FormItem label={t('激活状态')}>
            <>
              <Observer>
                {() => {
                  const { is_active } = store.menu_data
                  const _is_active = is_active === Filters_Bool.TRUE
                  return (
                    <Switch
                      checked={_is_active}
                      onChange={(value) => {
                        handleChange(
                          'is_active',
                          value ? Filters_Bool.TRUE : Filters_Bool.FALSE,
                        )
                      }}
                      on={t('激活')}
                      off={t('不激活')}
                    />
                  )
                }}
              </Observer>
              <div className='gm-text-desc gm-margin-top-10'>
                {t('菜谱激活后用户可正常下单，否则无法下单')}
              </div>
            </>
          </FormItem>

          <FormItem label={t('是否为默认菜谱')}>
            <>
              <Observer>
                {() => {
                  const { is_default } = store.menu_data
                  const _is_default = is_default === Filters_Bool.TRUE
                  return (
                    <Switch
                      checked={_is_default}
                      disabled={__is_default === '1'}
                      onChange={(value) => {
                        handleChange(
                          'is_default',
                          value ? Filters_Bool.TRUE : Filters_Bool.FALSE,
                        )
                      }}
                      on={t('默认')}
                      off={t('不启用')}
                    />
                  )
                }}
              </Observer>
              <div className='gm-text-desc gm-margin-top-10'>
                <div>{t('设置为默认菜谱后，新加入的班级默认关联此菜谱')}</div>
                <div className='gm-margin-top-5'>
                  {t('"学生餐"类型均只能有一个默认菜谱')}
                </div>
              </div>
            </>
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
}

export default observer(BaseSetting)
