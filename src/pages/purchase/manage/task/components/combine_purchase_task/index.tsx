import React, { FC, useState, useEffect } from 'react'
import { Flex } from '@gm-pc/react'
import {
  Modal,
  Table,
  TableColumnProps,
  Select,
  Input,
  Popover,
  message,
} from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { InfoCircleOutlined } from '@ant-design/icons'
import moment from 'moment'
import { observer } from 'mobx-react'
import { CombineTask } from '../../interface'
import store from '../../store'
import baseStore from '../../../../store'
import Big from 'big.js'
import { selectMode } from '../../../../enum'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'

interface CombinePurchaseTaskProps {
  visible: boolean
  handleVisible: () => void
}

const CombinePurchaseTask: FC<CombinePurchaseTaskProps> = ({
  visible,
  handleVisible,
}) => {
  const [setting, setSetting] = useState('')
  const [loading, setLoading] = useState(false)
  // 用一个来管理这个value
  const [value, setValue] = useState('')
  const {
    combinePurchaseTask,
    updateCombinePurchaseTask,
    setCombinePurchaseTask,
    mergePurchaseTask,
    doRequest,
  } = store

  const { purchasers, suppliers, fetchPurchasers, fetchSuppliers } = baseStore
  useEffect(() => {
    fetchPurchasers()
    fetchSuppliers()
  }, [])
  const handleBatchSetting = (setting: string) => {
    setSetting(setting)
  }

  const handleOk = () => {
    // 处理数据问题
    setLoading(true)
    mergePurchaseTask()
      .then(() => {
        message.success(t('合并成功'))
        doRequest()
        handleCancel()
      })
      .finally(() => setLoading(false))
  }

  const handleCancel = () => {
    handleVisible()
  }

  // 表格中的修改
  const handleChange = (value: string, key: string, index: number) => {
    if (key === 'batch[name]') {
      setCombinePurchaseTask('1', 'batch_id', index)
    }
    setCombinePurchaseTask(value, key, index)
  }

  /** @description 一键设置的方法 */
  const handleSetting = () => {
    const combineData = _.map(combinePurchaseTask, (item) => ({
      ...item,
      supplier_id: setting === 'supplier' ? value : item.supplier_id,
      purchaser_id: setting === 'purchaser' ? value : item.purchaser_id,
    }))
    updateCombinePurchaseTask(combineData)
    setValue('')
    setSetting('')
  }

  const columns: TableColumnProps<CombineTask>[] = [
    {
      title: '',
      width: 50,
      dataIndex: 'index',
      align: 'center',
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: t('计划交期'),
      dataIndex: 'plan_time',
      align: 'center',
      width: 220,
      render: (_, record) => (
        <>{moment(+record?.purchase_time! || 0).format('YYYY-MM-DD HH:mm')}</>
      ),
    },
    {
      title: t('商品名'),
      align: 'center',
      width: 130,
      dataIndex: 'sku_name',
      render: (_, record) => <>{record?.sku?.name || ''}</>,
    },
    {
      title: t('需求数'),
      width: 130,
      align: 'center',
      dataIndex: 'need',
      render: (text, record, index) => {
        const quantity = record.request_value?.calculate?.quantity! || '0'
        if (+quantity === 0) {
          return (
            <Flex alignCenter justifyCenter style={{ color: 'red' }}>
              -
              <Popover
                placement='bottomRight'
                content={
                  <strong>
                    {t(
                      '若勾选的采购计划未关联采购明细,合并后的采购计划将同样不关联采购明细,即需求数为0',
                    )}
                  </strong>
                }
              >
                <InfoCircleOutlined
                  className='tw-ml-1'
                  style={{ color: '#ffa530' }}
                />
              </Popover>
            </Flex>
          )
        }
        return (
          <>
            {Big(quantity || '0')
              .div(record.rate || 1)
              .toFixed(4)}
            {record.unit_name}
          </>
        )
      },
    },
    {
      title: t('计划采购'),
      width: 130,
      align: 'center',
      dataIndex: 'plan_task',
      render: (_, record, __) => {
        return (
          <>
            {Big(record.plan_value?.calculate?.quantity! || 0)
              .div(record.rate || 1)
              .toFixed(4)}
            {record.unit_name}
          </>
        )
      },
    },
    {
      title: (
        <Flex alignCenter>
          <span className='tw-mr-1'>{t('供应商')}</span>
          <a onClick={() => handleBatchSetting('supplier')}>{t('一键设置')}</a>
        </Flex>
      ),
      width: 200,
      dataIndex: 'supplier',
      render: (__, record, index) => {
        // 这个是供应商select
        const existSupplier =
          _.findIndex(
            suppliers,
            (item) => item.value === record.supplier_id,
          ) !== -1
        return (
          <Select
            placeholder={t('请选择供应商')}
            className='tw-w-full'
            options={suppliers.slice() || []}
            optionFilterProp='label'
            showSearch
            value={
              +record?.supplier_id! === 0 || !existSupplier
                ? undefined
                : record.supplier_id
            }
            onChange={(value) => handleChange(value, 'supplier_id', index)}
          />
        )
      },
    },
    {
      title: (
        <Flex alignCenter>
          <span className='tw-mr-1'>{t('采购员')}</span>
          <a onClick={() => handleBatchSetting('purchaser')}>{t('一键设置')}</a>
        </Flex>
      ),
      width: 200,
      dataIndex: 'purchase',
      render: (__, record, index) => {
        // 这个是采购员select
        const existPurchaser =
          _.findIndex(
            purchasers,
            (item) => item.value === record.purchaser_id,
          ) !== -1
        return (
          <Select
            placeholder={t('请选择采购员')}
            className='tw-w-full'
            optionFilterProp='label'
            options={purchasers.slice() || []}
            showSearch
            value={
              record?.purchaser_id! === '0' || !existPurchaser
                ? undefined
                : record.purchaser_id
            }
            onChange={(value) => handleChange(value, 'purchaser_id', index)}
          />
        )
      },
    },
    {
      title: t('商品等级'),
      width: 130,
      dataIndex: 'grade',
      render: (__, record, index) => {
        // 这个是商品等级select
        const selectData = record.levelData.filter((i) => !i.is_delete)
        const findIndex = _.findIndex(
          selectData,
          (i) => i.level_id === record.sku_level_filed_id,
        )
        if (
          record.sku_level_filed_id &&
          record.sku_level_filed_id !== '0' &&
          findIndex === -1
        ) {
          const disableData = _.find(
            record.levelData,
            (i) => i.level_id === record.sku_level_filed_id,
          )
          selectData.push({
            ...disableData!,
            disable: true,
            text: disableData?.text!,
          })
        }

        return (
          <Select
            placeholder={t('请选择商品等级')}
            className='tw-w-full'
            options={selectData.slice() || []}
            showSearch
            value={
              record.sku_level_filed_id === '0'
                ? undefined
                : record.sku_level_filed_id
            }
            onChange={(value) =>
              handleChange(value, 'sku_level_filed_id', index)
            }
          />
        )
      },
    },
    {
      title: t('供应商协作模式'),
      width: 150,
      render: (__, record, index) => {
        return (
          <Select
            placeholder={t('请选择模式')}
            className='tw-w-full'
            options={selectMode.slice() || []}
            disabled={!record.has_amend_mode}
            value={record.supplier_cooperate_model_type}
            showSearch
            onChange={(value) =>
              handleChange(
                value as unknown as string,
                'supplier_cooperate_model_type',
                index,
              )
            }
          />
        )
      },
    },
    {
      title: t('计划波次'),
      dataIndex: 'batch',
      width: 150,
      render: (__, record, index) => {
        return (
          <Input
            className='tw-w-full'
            placeholder={t('请输入计划波次')}
            value={record.batch_id !== '0' ? record?.batch?.name : ''}
            onChange={(e) => handleChange(e.target.value, 'batch[name]', index)}
          />
        )
      },
    },
    {
      title: t('备注'),
      dataIndex: 'remark',
      width: 150,
      render: (__, record, index) => {
        return (
          <Input
            className='tw-w-full'
            placeholder={t('请输入备注')}
            value={record.remark}
            onChange={(e) => {
              handleChange(e.target.value, 'remark', index)
            }}
          />
        )
      },
    },
  ]

  return (
    <>
      <Modal
        destroyOnClose
        title={t('合并采购计划')}
        visible={visible}
        onOk={handleOk}
        confirmLoading={loading}
        width={1590}
        onCancel={handleCancel}
      >
        <Table
          scroll={{ y: 500 }}
          columns={columns}
          pagination={false}
          dataSource={combinePurchaseTask.slice()}
        />
      </Modal>
      {/**  @description 一键设置 */}
      <Modal
        title={
          setting === 'supplier' ? t('一键设置供应商') : t('一键设置采购员')
        }
        destroyOnClose
        visible={Boolean(setting)}
        onOk={handleSetting}
        onCancel={() => setSetting('')}
        width={400}
      >
        <Flex alignCenter>
          {setting === 'supplier' ? (
            <>
              <span>{t('供应商：')}</span>
              <Select
                style={{ width: '260px' }}
                placeholder={t('输入供应商名称')}
                options={suppliers.slice() || []}
                onChange={(value) => setValue(value)}
              />
            </>
          ) : (
            <>
              <span>{t('采购员：')}</span>
              <Select
                style={{ width: '260px' }}
                placeholder={t('输入采购员名称')}
                options={purchasers.slice() || []}
                onChange={(value) => setValue(value)}
              />
            </>
          )}
        </Flex>
      </Modal>
    </>
  )
}
export default observer(CombinePurchaseTask)
