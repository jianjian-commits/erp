import React, { FC, useEffect } from 'react'
import { gmHistory } from '@gm-common/router'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment, { Moment } from 'moment'
import {
  Select,
  InputNumber,
  Form,
  Card,
  message,
  Tooltip,
  Row,
  Col,
  Modal,
  Spin,
} from 'antd'
import _ from 'lodash'
import { SemesterType } from 'gm_api/src/enterprise'
import { history } from '@/common/service'
import { InfoCircleOutlined } from '@ant-design/icons'
import { TERM_OPTIONS_TYPE_MAP, SELECT_SCHOOL_TYPE_MAP } from '../../../enum'
import store from '../store/detailStore'
import ButtonGroupFixed from '@/common/components/button_group_fixed'

interface ValuesProps {
  customer_id: string
  menu_period_group_id: string
  budget_meals_per_person: string
  budget_money_per_person: string
  year: Moment
  semester_type: SemesterType
}
interface DetailProps {
  budget_id?: string
}

const Detail: FC<DetailProps> = ({ budget_id }) => {
  const [form] = Form.useForm()
  const {
    budgetPlan,
    otherBudgetPlan,
    mealTimesInfo,
    customerList,
    termList,
    isLoading,
    loading,
  } = store
  const {
    customer_id,
    menu_period_group_id,
    budget_meals_per_person,
    budget_money_per_person,
  } = budgetPlan
  const { year, semester_type } = otherBudgetPlan

  // 根据学年分组
  const yearList = _.groupBy(termList, 'year')

  /**
   *
   * @param year_
   * @returns { year: [semester_type1, semester_type2]}
   */
  const getTermValueListByYear = (year_: string) => {
    return year_ && Object.keys(_.groupBy(yearList[year_], 'semester_type'))
  }

  // 学期 根据所选择的学年，得到该学年所包含的学期类型
  const termListOptions = getTermValueListByYear(year)

  // 获取学年选择列表
  const yearTypeOptions =
    _.map(Object.keys(yearList), (it) => {
      return {
        label: it,
        value: it,
      }
    }) || []

  // 根据选择学年后，获取学期
  const termTypeOptions =
    _.map(termListOptions, (it) => {
      return {
        label: TERM_OPTIONS_TYPE_MAP[it],
        value: it,
      }
    }) || []

  // 选中当前客户
  const customer =
    customer_id && _.find(customerList, (item) => item.value === customer_id)

  // 获取餐次人数
  const showMealCount = () => {
    let count
    if (customer && menu_period_group_id) {
      count =
        customer?.original?.attrs?.default_dining_count?.dinning_count_map![
          menu_period_group_id
        ]
    }
    return count
  }

  // 获取学校类型
  const showSchoolTypeText = () => {
    let school

    if (customer) {
      school = SELECT_SCHOOL_TYPE_MAP[customer?.original?.school_type!]
    }
    return school
  }

  // 获取展示时间
  const showRangeDate = () => {
    let time
    if (year && semester_type) {
      const semester = _.find(
        termList,
        (it) => `${it.year}-${it.semester_type}` === `${year}-${semester_type}`,
      )
      time = `${moment(+semester?.start_time!).format('YYYY-MM-DD')}~${moment(
        +semester?.end_time!,
      ).format('YYYY-MM-DD')}`
    }
    return time
  }

  const handleCancel = () => {
    Modal.confirm({
      okText: t('确定'),
      cancelText: t('取消'),
      content: t('信息还没有保存，确定退出吗？'),
      title: t('提示'),
      onOk: () => {
        gmHistory.go(-1)
      },
    })
  }

  const _handleCreate = (values: ValuesProps) => {
    if (showSchoolTypeText() === '未选择类型') {
      message.error('学校类型不能为空，请到客户详情设置！')
      return false
    }
    if (!showMealCount()) {
      message.error('用餐人数不能为空，请到客户详情设置！')
      return false
    }
    if (budget_id) {
      store.fetchUpdateBudget().then((json) => {
        if (json.response.budget) {
          message.success(t('保存成功！'))
          gmHistory.go(-1)
        }
        return null
      })
    } else {
      store.fetchCreateBudget().then((json) => {
        if (json.response.budget) {
          message.success(t('保存成功！'))
          gmHistory.go(-1)
        }
        return null
      })
    }
  }

  const fetchSemesterList = async () => {
    await store.fetchListTerm()
  }

  useEffect(() => {
    fetchSemesterList()
    store.fetchListCustomer()
    store.fetchMealTimesList()
    budget_id && store.fetchGetBudget(budget_id)
    return () => {
      store.init()
      form.resetFields()
    }
  }, [])

  useEffect(() => {
    budget_id &&
      form.setFieldsValue({
        customer_id: customer_id,
        menu_period_group_id: menu_period_group_id,
        year: year,
        semester_type:
          semester_type === null ? semester_type : semester_type + '',
        budget_meals_per_person: budget_meals_per_person,
        budget_money_per_person: budget_money_per_person,
      })
  })

  const layoutConfig = {
    gutter: { xs: 8, sm: 16, md: 24, lg: 32 },
  }

  return (
    <>
      <Form
        form={form}
        name='create_term'
        labelAlign='right'
        labelCol={{ span: 6 }}
        initialValues={{
          customer_id: customer_id || undefined,
          menu_period_group_id: menu_period_group_id || undefined,

          year: year || undefined,
          semester_type:
            semester_type === null ? semester_type : semester_type + '',

          budget_meals_per_person: budget_meals_per_person,
          budget_money_per_person: budget_money_per_person,
        }}
        onFinish={(values) => _handleCreate(values)}
      >
        <Spin spinning={isLoading}>
          <Card
            title={t('基础信息')}
            bordered
            style={{
              borderBottom: 'none',
              borderTop: 'none',
            }}
          >
            <Row gutter={layoutConfig.gutter}>
              <Col span={8}>
                <Form.Item
                  label={t('客户')}
                  name='customer_id'
                  rules={[{ required: true, message: t('客户不为空！') }]}
                >
                  <Select
                    showSearch
                    placeholder={t('请选择客户')}
                    options={store.customerList}
                    optionFilterProp='label'
                    virtual
                    onChange={(value: string) => {
                      store.updateBudgetPlan('customer_id', value)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('学校类型')}
                  tooltip={{
                    title: t('可在客户管理中选择学校类型'),
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <div className='gm-margin-left-5'>
                    {showSchoolTypeText() || '-'}
                  </div>
                  {/* {customer && customer.original.school_type === 0 && (
                  <a className='gm-margin-left-5'>{t('去客户详情设置')}</a>
                )} */}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={layoutConfig.gutter}>
              <Col span={8}>
                <Form.Item
                  label={t('餐次')}
                  name='menu_period_group_id'
                  rules={[{ required: true, message: t('餐次不为空！') }]}
                >
                  <Select
                    options={_.filter(mealTimesInfo, (it) => it.value !== '')}
                    placeholder={t('请选择餐次')}
                    onChange={(value: string) => {
                      store.updateBudgetPlan('menu_period_group_id', value)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={t('用餐人数')}
                  tooltip={{
                    title: t('此处为客户用餐信息中对应餐次的用餐人数'),
                    icon: <InfoCircleOutlined />,
                  }}
                >
                  <div className='gm-margin-left-5'>
                    {showMealCount() || '-'}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card
            title={t('预算设置')}
            bordered
            style={{
              borderTop: 'none',
              borderBottom: 'none',
            }}
          >
            <Row gutter={layoutConfig.gutter}>
              <Col span={8}>
                <Form.Item
                  shouldUpdate
                  label={t('学期')}
                  name='year'
                  rules={[{ required: true, message: t('学期不为空！') }]}
                  help={t('选择学期前请确保【学期管理】中已有相应设置')}
                >
                  <Select
                    options={yearTypeOptions}
                    placeholder={t('请选择学年')}
                    onChange={(value: string) => {
                      store.updateOtherBudgetPlan('year', value)
                    }}
                    onSelect={(value) => {
                      // 重置一下学期值
                      const TermValueList = getTermValueListByYear(value)
                      if (TermValueList.length) {
                        form.setFieldsValue({
                          semester_type: null,
                        })
                        store.updateOtherBudgetPlan('semester_type', null)
                      }
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <span className='gm-margin-top-5 gm-margin-right-5'>
                {t('年')}
              </span>
              <Col span={4}>
                <Form.Item
                  shouldUpdate
                  name='semester_type'
                  rules={[{ required: true, message: t('学期不为空！') }]}
                >
                  <Select
                    options={termTypeOptions}
                    placeholder={t('请选择学期')}
                    onChange={(value: number) => {
                      store.updateOtherBudgetPlan('semester_type', +value)
                    }}
                    disabled={!year}
                  />
                </Form.Item>
              </Col>
              <Tooltip title={t('跳转到学期管理')}>
                <a
                  className='gm-margin-top-5 gm-margin-left-5'
                  onClick={() => {
                    history.push('/customer/school/term_management')
                  }}
                >
                  {t('设置学期')}
                </a>
              </Tooltip>
            </Row>
            <Row gutter={layoutConfig.gutter}>
              <Col span={8}>
                <Form.Item label={t('起止日期')}>
                  <div className='gm-text-desc'>{showRangeDate() || '-'}</div>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={layoutConfig.gutter}>
              <Col span={8}>
                <Form.Item
                  label={t('计划餐数')}
                  name='budget_meals_per_person'
                  rules={[{ required: true, message: t('计划参数不为空！') }]}
                  help={t('填写本学期预计每人用餐次数')}
                >
                  <InputNumber
                    min={1}
                    max={9999}
                    maxLength={4}
                    keyboard
                    type='number'
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder={t('请输入计划餐数')}
                    onChange={(value) => {
                      store.updateBudgetPlan(
                        'budget_meals_per_person',
                        +value + '',
                      )
                    }}
                  />
                </Form.Item>
              </Col>
              <span className='gm-margin-top-5'>{t('次/人')}</span>
            </Row>
            <Row gutter={layoutConfig.gutter} className='gm-margin-top-20'>
              <Col span={8}>
                <Form.Item
                  label={t('计划金额')}
                  name='budget_money_per_person'
                  rules={[{ required: true, message: t('计划金额不为空！') }]}
                  help={t('填写本学期预计每人用餐总金额')}
                >
                  <InputNumber
                    min={0.01}
                    max={99999}
                    maxLength={5}
                    keyboard
                    type='number'
                    style={{ width: '100%' }}
                    precision={2}
                    placeholder={t('请输入计划金额')}
                    onChange={(value) => {
                      store.updateBudgetPlan(
                        'budget_money_per_person',
                        +value + '',
                      )
                    }}
                  />
                </Form.Item>
              </Col>
              <span className='gm-margin-top-5'>{t('元/人')}</span>
            </Row>
          </Card>
        </Spin>
        {/* <FormButton onCancel={handleCancel} /> */}
        <ButtonGroupFixed onCancel={handleCancel} />
      </Form>
    </>
  )
}

export default observer(Detail)
