/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Modal, Form, Cascader, Input, Row, Col, Checkbox, message } from 'antd'
import { DateRangePicker, Flex } from '@gm-pc/react'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import _ from 'lodash'
import { MenuPeriodIds } from 'gm_api/src/eshop'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { ItemProps, MenuPeriodsMap } from '../interface'
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
}
interface BatchModalProp {
  visible: boolean
  handleSetVisible: (params: boolean) => void
}

const BatchModal: FC<BatchModalProp> = observer(
  ({ visible, handleSetVisible }) => {
    const [form] = Form.useForm()
    const {
      customers,
      leave_params,
      getLeaveMenu,
      setLeaveParams,
      menu_period_map,
      menu_period,
      setLeaveInfo,
      createLeave,
      fetchList,
      verify,
    } = store

    useEffect(() => {
      if (!visible) {
        store.initModal()
        form.setFieldsValue({
          class_id: '',
          remark: '',
        })
      }
      if (leave_params.class_id && visible) {
        getLeaveMenu()
      }
    }, [
      leave_params.class_id,
      leave_params.leave_date_start,
      leave_params.leave_date_end,
      visible,
    ])

    const handleOk = () => {
      if (verify()) {
        // 调用接口
        createLeave().then(() => {
          message.success(t('创建成功'))
          fetchList()
        })
        handleSetVisible(false)
      }
    }
    const handleCancel = () => {
      handleSetVisible(false)
    }
    const onValuesChange = (changedValues: any) => {
      if (changedValues.class_id) {
        const params = {
          ...leave_params,
          class_id: changedValues.class_id[changedValues.class_id.length - 1],
        }
        setLeaveParams(params)
        return
      }
      const params = {
        ...leave_params,
        ...changedValues,
      }
      setLeaveParams(params)
    }
    const handleChange = (key: number, value: CheckboxValueType[]) => {
      const params = {
        ...store.leave_info,
        ['' + key]: { menu_period_group_ids: value },
      } as MenuPeriodsMap
      setLeaveInfo(params)
    }

    const renderCheckout = (item: ItemProps) => {
      return (
        <Checkbox.Group
          style={{ width: '100%' }}
          onChange={(value) => handleChange(+_.keys(item), value)}
        >
          <Row>
            {_.map(
              item[+_.keys(item)].menu_period_group_ids,
              (menu_ids, index) => {
                return (
                  <Col span={6} key={index}>
                    <Checkbox
                      value={menu_ids}
                      key={menu_ids}
                      style={{ marginBottom: '5px' }}
                    >
                      {/* {_.find(
                        menu_period,
                        (period_group_id) =>
                          period_group_id.menu_period_group_id === menu_ids,
                      )?.name || ''} */}
                      {menu_period?.[menu_ids]?.name || ''}
                    </Checkbox>
                  </Col>
                )
              },
            )}
          </Row>
        </Checkbox.Group>
      )
    }

    const leaveChange = (begin: Date, end: Date) => {
      const params = {
        ...leave_params,
        leave_date_start: begin.getTime(),
        leave_date_end: end.getTime(),
      }
      setLeaveParams(params)
    }
    return (
      <Modal
        title={t('批量新建请假单')}
        visible={visible}
        onOk={handleOk}
        width={1000}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name='Form'
          {...formItemLayout}
          onValuesChange={onValuesChange}
        >
          <Form.Item name='class_id' label={t('请假班级')}>
            <Cascader
              allowClear={false}
              expandTrigger='hover'
              style={{ width: '400px' }}
              options={customers}
              placeholder='请选择班级'
            />
          </Form.Item>
          <Form.Item label={t('请假日期')}>
            <DateRangePicker
              begin={leave_params.leave_date_start as Date}
              end={leave_params.leave_date_end as Date}
              onChange={leaveChange}
              style={{ width: '400px' }}
            />
          </Form.Item>
          <Form.Item label={t('请假餐次')}>
            {menu_period_map.length > 0 && leave_params.class_id.length > 0 ? (
              _.map(menu_period_map, (item, index) => {
                return (
                  <Row key={index}>
                    <Flex
                      alignCenter
                      style={{
                        width: '100%',
                        marginBottom: '20px',
                        border: '1px solid #eee',
                        padding: '5px',
                      }}
                    >
                      <Col span={6}>
                        <span style={{ fontSize: '12px' }}>
                          {moment(+_.keys(item)).format('YYYY-MM-DD')}
                        </span>
                      </Col>
                      <Col span={18}>{renderCheckout(item as ItemProps)}</Col>
                    </Flex>
                  </Row>
                )
              })
            ) : (
              <span>{t('暂无餐次')}</span>
            )}
          </Form.Item>
          <Form.Item name='remark' label={t('备注')}>
            <Input
              placeholder={t('请输入备注')}
              maxLength={30}
              style={{ width: '400px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  },
)
export default BatchModal
