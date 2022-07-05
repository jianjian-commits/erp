/**
 * @description 新建售后单-不关联订单（选择客户）
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { Modal, Form, Select } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Customer, Customer_Type, ListCustomer } from 'gm_api/src/enterprise'
import { Filters_Bool } from 'gm_api/src/common'

export interface SelectCustomerProps {
  isModalVisible: boolean
  closeModal: () => void
  createWithoutOrder: (id: string) => void
}

const { Option } = Select

const SelectCustomer: FC<SelectCustomerProps> = observer((props) => {
  const { isModalVisible, closeModal, createWithoutOrder } = props

  const [customerId, setCustomerId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])

  const searchTimerRef = useRef<NodeJS.Timer | null>(null)

  useEffect(() => {
    getCustomerList('')
  }, [])

  /** 获客户列表 */
  const getCustomerList = (value: string) => {
    ListCustomer({
      // 匹配字符串
      q: value || '',
      // 以下部分和新建订单保持一致
      need_service_periods: true,
      is_bill_target: Filters_Bool.ALL,
      is_ship_target: Filters_Bool.ALL,
      type: Customer_Type.TYPE_SOCIAL,
      need_quotations: true,
      bind_quotation_without_time: Filters_Bool.TRUE,
      need_parent_customers: true,
      bind_quotation_periodic: Filters_Bool.TRUE,
      paging: {
        offset: 0,
        limit: 999,
      },
    }).then((json) => {
      const customers = json.response.customers || []
      setCustomerOptions(customers)
    })
  }

  /** 查询客户 */
  const handleSearchCustomer = (value: string) => {
    if (value) {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current as NodeJS.Timer)
        searchTimerRef.current = null
      }
      searchTimerRef.current = setTimeout(() => {
        getCustomerList(value)
      }, 500)
    }
  }

  const onCustomerIdChange = (values: any) => {
    setCustomerId(values)
  }

  return (
    <Modal
      title={t('不关联订单')}
      visible={isModalVisible}
      confirmLoading={isLoading}
      onOk={() => createWithoutOrder(customerId)}
      onCancel={closeModal}
    >
      <Form.Item required label={t('请选择客户')}>
        <Select
          style={{ width: 220 }}
          value={customerId}
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
          showSearch
          onChange={onCustomerIdChange}
          onSearch={(value) => handleSearchCustomer(value)}
        >
          {_.map(customerOptions, (item) => {
            return (
              <Option key={item.customer_id} value={item.customer_id}>
                {item.name}
              </Option>
            )
          })}
        </Select>
      </Form.Item>
    </Modal>
  )
})

export default SelectCustomer
