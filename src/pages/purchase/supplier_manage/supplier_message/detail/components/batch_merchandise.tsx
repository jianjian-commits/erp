import React, { FC, useEffect, useState } from 'react'
import {
  Table,
  TableColumnType,
  Form,
  FormInstance,
  Radio,
  InputNumber,
  Modal,
} from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import _ from 'lodash'

import store from '../store'
import { Sku } from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import BatchModal from './batch_modal'
interface AddMerchandiseProps {
  form: FormInstance<any>
}

interface TableProps extends Sku {
  enable?: boolean
}

const AddMerchandise: FC<AddMerchandiseProps> = ({ form }) => {
  const [visible, setVisible] = useState(false)
  const [disabledList, setDisabledList] = useState<string[]>([])
  const { merchandiseList, setMerchandiseList, selectSkuList } = store

  useEffect(() => {
    const newDisableList = merchandiseList.map((item) => item.sku_id)
    setDisabledList(newDisableList)
    form.setFieldsValue({ table: merchandiseList })
  }, [merchandiseList])

  const handleChange = (
    index: number,
    key: string,
    value: boolean | number,
  ) => {
    _.set(merchandiseList[index], key, value)
    setMerchandiseList(merchandiseList)
  }

  const handleDelete = (index: number) => {
    const newMerchandiseList = [...merchandiseList]
    newMerchandiseList.splice(index, 1)
    setMerchandiseList(newMerchandiseList)
  }

  const columns: TableColumnType<TableProps>[] = [
    {
      title: '',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (text, record, index: number) => <>{index + 1}</>,
    },
    {
      title: t('商品名称'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => <>{text}</>,
    },
    {
      title: t('是否启用供货上限'),
      dataIndex: 'enable',
      key: 'enable',
      render: (text, record, index) => {
        return (
          <Form.Item name={['table', index, 'enable']}>
            <Radio.Group
              onChange={(e) => handleChange(index, 'enable', e.target.value)}
            >
              <Radio value>{t('是')}</Radio>
              <Radio value={false}>{t('否')}</Radio>
            </Radio.Group>
          </Form.Item>
        )
      },
    },
    {
      title: t('供货上限设置'),
      dataIndex: 'upper_limit',
      render: (text, record, index: number) => {
        return (
          <Form.Item
            name={['table', index, 'upper_limit']}
            rules={[{ required: true }]}
          >
            {record.enable ? (
              <InputNumber
                onChange={(value) => handleChange(index, 'upper_limit', value)}
                onKeyDown={(e) => {
                  if (e.key === '.') {
                    e.preventDefault()
                  }
                }}
                addonAfter={
                  globalStore.getUnitName(record?.purchase_unit_id!) ||
                  globalStore.getPurchaseUnitName(
                    record?.units?.units,
                    record?.purchase_unit_id!,
                  )
                }
                min={0}
                max={100}
              />
            ) : (
              ''
            )}
          </Form.Item>
        )
      },
    },
    {
      title: t('操作'),
      dataIndex: 'index',
      width: 120,
      align: 'center',
      render: (text, record, index: number) => (
        <a onClick={() => handleDelete(index)}>{t('删除')}</a>
      ),
    },
  ]

  const handleBatchMerchandise = () => {
    setVisible(true)
  }
  const handleOk = () => {
    // 处理这个Table的list数据
    const list = _.map(selectSkuList.concat(merchandiseList), (item) => ({
      ...item,
      // @ts-ignore
      enable: item.enable || false,
      // @ts-ignore
      upper_limit: item.upper_limit || 0,
    }))
    const disList = _.map(list, (item) => item.sku_id)
    setDisabledList(disList)
    setMerchandiseList(list)
    setVisible(false)
  }

  return (
    <>
      <Form form={form} className='form-merchandise tw-mb-2 '>
        <Flex>
          <Flex>
            <span style={{ color: 'red' }}>*</span>
            <p className='tw-w-14'>{t('经营商品:')}</p>
          </Flex>
          <Table
            columns={columns}
            dataSource={merchandiseList.slice()}
            pagination={false}
            scroll={{ y: 500 }}
            footer={() => (
              <Flex
                className='tw-h-5 tw-cursor-pointer'
                alignCenter
                onClick={handleBatchMerchandise}
              >
                <CopyOutlined className='tw-mr-1' />
                {t('批量添加商品')}
              </Flex>
            )}
          />
        </Flex>
      </Form>
      <Modal
        visible={visible}
        destroyOnClose
        title={t('批量添加商品')}
        onOk={handleOk}
        width={1250}
        onCancel={() => setVisible(false)}
      >
        <BatchModal disabledList={disabledList} />
      </Modal>
    </>
  )
}
export default observer(AddMerchandise)
