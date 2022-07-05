/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import { Table, Form, TableColumnProps, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import Supplier from './supplier_modal'
import Purchase from './purchase_modal'
import GradeModal from './grade_modal'
import createStore from '../store'
import ProductImage from '@/common/components/product_image'
import GradeSelect from '../../grade_select'
import SupplierSelect from '../../supplier_select'
import PurchaseSelect from '../../purchase_select'
import { getCategoryName } from '@/common/util'
import { List } from '../interface'
import store from '../../../store'

import { LabelFilter } from '@/pages/purchase/purchase_rules/rules/interface'

interface AddRulesInfoProps {
  columnsType: string
}
interface AddRulesRef {
  handleVerify: () => Promise<boolean>
}

const AddRulesInfo = observer(
  forwardRef<AddRulesRef, AddRulesInfoProps>(({ columnsType }, ref) => {
    const [form] = Form.useForm()
    const [supplierVisible, setSupplierVisible] = useState(false)
    const [purchaseVisible, setPurchaseVisible] = useState(false)
    const [gradeVisible, setGradeVisible] = useState(false)
    const [isVerify, setIsVerify] = useState(false)
    const { supplierList, purchaseList, category_map } = store
    const {
      client_selectedRow,
      merchandise_selectedRow,
      list,
      changeList,
      deleteList,
      loading,
      // type,
    } = createStore

    useEffect(() => {
      form.setFieldsValue({
        table_list: list,
      })
    }, [list, list.length])

    // 父组件使用子组件的校验方法
    useImperativeHandle(ref, () => ({
      handleVerify,
    }))

    /** 父组件使用handleVerify来检验 */
    const handleVerify = async () => {
      setIsVerify(true)
      const res = await form
        .validateFields()
        .then(() => true)
        .catch(() => false)
      return res
    }

    // 供应商的一键设置
    const handleSupplierVisible = (visible: boolean) => {
      setSupplierVisible(visible)
    }
    // 采购员的一键设置
    const handlePurchaseVisible = (visible: boolean) => {
      setPurchaseVisible(visible)
    }
    // 商品等级的一键设置
    const handleGradeVisible = (visible: boolean) => {
      setGradeVisible(visible)
    }

    // select的一键设置
    const handleChange = (value: string, index: number, key: string) => {
      validator(index)
      changeList(value, index, key)
      isVerify && form.validateFields()
    }

    // 三个自定义校验
    const validator = (index: number) => {
      if (
        form.getFieldValue(['table_list', index, 'supplier_id']) ||
        form.getFieldValue(['table_list', index, 'purchaser_id']) ||
        form.getFieldValue(['table_list', index, 'level_field_id'])
      ) {
        return Promise.resolve(true)
      } else {
        return Promise.reject(t('供应商、采购员、商品等级最少填写一项'))
      }
    }

    /** 操作删除 */
    const handleDelete = (id: string, name: string) => {
      setIsVerify(false)
      Modal.confirm({
        title: t('删除提示'),
        icon: <ExclamationCircleOutlined />,
        content: t(`确认删除${name}吗？`),
        okText: t('确认'),
        cancelText: t('取消'),
        onOk: () => {
          deleteList(id, columnsType)
        },
      })
    }

    const columns: TableColumnProps<List>[] = [
      {
        title: '',
        dataIndex: 'index',
        key: 'index',
        width: 50,
        render: (text, record, index) => {
          return index + 1
        },
      },
      columnsType === 'client'
        ? {
            title: t('商品名'),
            dataIndex: 'name',
            key: 'name',
          }
        : {
            title: t('客户名'),
            dataIndex: 'name',
            key: 'name',
          },
      {
        title: (
          <Flex alignCenter>
            <span>{t('供应商')}</span>
            <span
              className='header-color tw-cursor-pointer'
              onClick={() => setSupplierVisible(true)}
            >
              {t('一键设置')}
            </span>
          </Flex>
        ),
        dataIndex: 'supplier_id',
        key: 'supplier_id',
        render: (text: string, record, index) => {
          if (record.supplier_id) {
            const res = _.some(
              supplierList,
              (item) => item.value === record.supplier_id,
            )
            if (!res) {
              form.setFields([
                { name: ['table_list', index, 'supplier_id'], value: '' },
              ])
            }
          }
          return (
            <Form.Item
              name={['table_list', index, 'supplier_id']}
              dependencies={[
                ['table_list', index, 'purchaser_id'],
                ['table_list', index, 'level_field_id'],
              ]}
              rules={[
                {
                  validator: () => validator(index),
                },
              ]}
            >
              <SupplierSelect
                options={supplierList}
                onChange={(value) => handleChange(value, index, 'supplier_id')}
              />
            </Form.Item>
          )
        },
      },
      {
        title: (
          <Flex alignCenter>
            <span>{t('采购员')}</span>
            <span
              className='header-color tw-cursor-pointer'
              onClick={() => setPurchaseVisible(true)}
            >
              {t('一键设置')}
            </span>
          </Flex>
        ),
        dataIndex: 'purchaser_id',
        key: 'purchaser_id',
        render: (text: string, record, index) => {
          if (record.purchaser_id) {
            const res = _.some(
              purchaseList,
              (item) => item.value === record.purchaser_id,
            )
            if (!res) {
              form.setFields([
                { name: ['table_list', index, 'purchaser_id'], value: '' },
              ])
            }
          }
          return (
            <Form.Item
              name={['table_list', index, 'purchaser_id']}
              dependencies={[
                ['table_list', index, 'supplier_id'],
                ['table_list', index, 'level_field_id'],
              ]}
              rules={[
                {
                  validator: () => validator(index),
                },
              ]}
            >
              <PurchaseSelect
                options={purchaseList}
                onChange={(value) => handleChange(value, index, 'purchaser_id')}
              />
            </Form.Item>
          )
        },
      },
      {
        title: (
          <>
            <Flex alignCenter>
              <span>{t('商品等级')}</span>
              {columnsType === 'merchandise' && (
                <span
                  className='header-color tw-cursor-pointer'
                  onClick={() => setGradeVisible(true)}
                >
                  {t('一键设置')}
                </span>
              )}
            </Flex>
          </>
        ),
        dataIndex: 'level_field_id',
        key: 'level_field_id',
        render: (__: string, record, index) => {
          // 传两个给到子组件
          const optionsData =
            columnsType === 'client'
              ? _.find(
                  merchandise_selectedRow,
                  (item) => item.sku_id === record.sku_id!,
                )?.sku_level?.sku_level || []
              : merchandise_selectedRow[0]?.sku_level?.sku_level! || []

          const options: LabelFilter[] =
            optionsData.length > 0
              ? _.map(optionsData, (item) => {
                  return {
                    ...item,
                    label: item.name!,
                    value: item.level_id!,
                  }
                })
              : []
          const skuInfo = _.find(
            merchandise_selectedRow,
            (item) => item.sku_id === record.sku_id,
          )
          if (record.level_field_id) {
            const res = _.some(
              options.filter((i) => !i.is_delete),
              (item) => item.value === record.level_field_id,
            )

            if (!res) {
              form.setFields([
                { name: ['table_list', index, 'level_field_id'], value: '' },
              ])
            }
          }
          return (
            <Form.Item
              dependencies={[
                ['table_list', index, 'purchaser_id'],
                ['table_list', index, 'supplier_id'],
              ]}
              name={['table_list', index, 'level_field_id']}
              rules={[
                {
                  validator: () => validator(index),
                },
              ]}
            >
              {/* 如果一开始客户过来的 */}
              <GradeSelect
                options={options}
                type={columnsType}
                skuInfo={skuInfo}
                onChange={(value) =>
                  handleChange(value, index, 'level_field_id')
                }
              />
            </Form.Item>
          )
        },
      },
      {
        title: t('操作'),
        dataIndex: 'action',
        width: 100,
        key: 'action',
        align: 'center',
        render: (text, record, index) => (
          <a
            onClick={() =>
              handleDelete(
                columnsType === 'client' ? record.sku_id! : record.customer_id!,
                record.name,
              )
            }
          >
            {t('删除')}
          </a>
        ),
      },
    ]

    // 一键设置的商品等级数据
    const settingsOptions: LabelFilter[] = useMemo(() => {
      const data = _.map(
        merchandise_selectedRow[0].sku_level?.sku_level,
        (item) => {
          return {
            ...item,
            label: item.name!,
            value: item.level_id!,
          }
        },
      )
      return data
    }, [gradeVisible, merchandise_selectedRow])

    return (
      <div className='rules-info'>
        <Flex className='rules-info-header'>
          {columnsType === 'client' ? (
            <Flex alignCenter className='tw-w-full tw-h-full'>
              {t('当前客户：')}
              {t(`${client_selectedRow?.[0]?.name || '-'}`)}
            </Flex>
          ) : (
            <Flex className='tw-my-2 tw-box-border'>
              <ProductImage
                url={
                  merchandise_selectedRow[0]?.repeated_field?.images?.[0]
                    ?.path! || ''
                }
                style={{ width: '64px', height: '64px', maxWidth: '64px' }}
              />

              <Flex className='tw-h-full tw-ml-2' column justifyBetween>
                <span
                  className='tw-text-base tw-font-bold'
                  style={{ color: '#000' }}
                >
                  {t(`${merchandise_selectedRow?.[0]?.name || '-'}`)}
                </span>
                <span className='tw-text-sm tw-font-normal'>
                  {getCategoryName(
                    category_map,
                    merchandise_selectedRow?.[0]?.category_id! || '',
                  )}
                </span>
              </Flex>
            </Flex>
          )}
        </Flex>

        <div className='rules-info-body'>
          <Observer>
            {() => {
              const { list } = createStore
              return (
                <Form form={form}>
                  <Table
                    scroll={{ y: 600 }}
                    loading={loading}
                    columns={columns.slice()}
                    dataSource={list.slice()}
                    pagination={false}
                  />
                </Form>
              )
            }}
          </Observer>
        </div>

        {/* 一键设置 */}
        {supplierVisible && (
          <Supplier
            options={supplierList}
            visible={supplierVisible}
            handleSupplierVisible={handleSupplierVisible}
          />
        )}
        {purchaseVisible && (
          <Purchase
            options={purchaseList}
            visible={purchaseVisible}
            handlePurchaseVisible={handlePurchaseVisible}
          />
        )}
        {gradeVisible && (
          <GradeModal
            options={settingsOptions}
            skuInfo={merchandise_selectedRow[0]}
            type={columnsType}
            visible={gradeVisible}
            handleGradeVisible={handleGradeVisible}
          />
        )}
      </div>
    )
  }),
)
export default AddRulesInfo
