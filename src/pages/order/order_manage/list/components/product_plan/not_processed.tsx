/* eslint-disable gm-react-app/no-deprecated-react-gm */
import React, { FC, useEffect, useState, useRef } from 'react'
import { t } from 'gm-i18n'
import { deliveryType, RadioGroupEnum } from '@/pages/order/enum'
import Panel from './components/panel'
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Radio,
  TreeSelect,
  Row,
  Col,
} from 'antd'
import { PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import moment from 'moment'
import { fetchTreeData } from './service'
import {
  NotProcessedData,
  SortGroupList,
  ProductPlanProps,
  SelectedNodeMap,
} from './interface'
import { DataNode, DataNodeMap } from '@/common/interface'

import { initNotProcessedData, treeDataProps, TipContent } from './enum'
import TipMessage from './components/tip_message'

import {
  flatTreeDataToList,
  scrollToBottom,
  getDisabledList,
  filterIds,
} from './util'
import './style.less'
import classNames from 'classnames'
import _ from 'lodash'
import {
  SyncPurchaseTaskFromOrder,
  SyncPurchaseTaskFromOrderRequest,
} from 'gm_api/src/orderlogic'
import orderStore from '../../view_order/store'
import productStore from '../../view_sku/store'
import store from './store'
import globalStore from '@/stores/global'

const { TreeNode } = TreeSelect

const NotProcessedProductPlan: FC<ProductPlanProps> = (props) => {
  const { isSelectAll, selected, onClose, isOrder } = props

  const [form] = Form.useForm()
  // 获取分类的type,非加工品为1
  const settingType = 1

  const selectedNodeRef = useRef<SelectedNodeMap>({})
  const flatTreeDataRef = useRef<DataNodeMap>({})

  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<DataNode[]>([])
  const [sortGroupList, setSortGroupList] = useState<SortGroupList[]>([]) // 分类组List
  const [notProcessedData, setNotProcessedData] = useState<NotProcessedData>({
    ...initNotProcessedData,
  })

  const [selectedList, setSelectedList] = useState<string[]>([])

  useEffect(() => {
    fetchTreeList()
    return () => store.initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * @description 获取分类数据
   */
  const fetchTreeList = async () => {
    const treeData = await fetchTreeData()
    flatTreeDataRef.current = flatTreeDataToList(treeData, {})
    store.fetchSetting(settingType).then(() => {
      const sortGroupList = store.categories
        .map((item, index) => {
          const id = Date.now().toString(36) + index
          // 当分类被删除时，需要做一个判断
          const value = filterIds(item.category_ids, flatTreeDataRef.current)
          selectedNodeRef.current[id] = value
          return {
            delivery_time: null,
            remark: '',
            value,
            id,
            treeData: _.cloneDeep(treeData),
          }
        })
        .filter((f) => f.value.length > 0)
      setSortGroupList(sortGroupList)
      updateSelectedList(sortGroupList)
      setNotProcessedData({
        ...notProcessedData,
        isSetClassify: store.category_setting_open,
      })
      form.setFieldsValue({ isSetClassify: store.category_setting_open })
    })
    setTreeData(treeData)
  }

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose()
  }

  /**
   * @description 统一修改分类组List的方法
   */
  const onChangeGroupList = <T extends keyof SortGroupList>(
    key: T,
    value: SortGroupList[T],
    index: number,
  ) => {
    sortGroupList[index][key] = value
    setSortGroupList([...sortGroupList])
  }

  /**
   * @description 更新已选择id集合
   * @param list setState 异步不好处理，增加这个参数，仅获取数据用
   */
  const updateSelectedList = (list?: SortGroupList[]) => {
    const selectedList: string[] = []
    const groupList = list || sortGroupList
    groupList.forEach((item) => {
      item.value.forEach((v) => {
        if (!selectedList.includes(v)) selectedList.push(v)
      })
    })
    setSelectedList(selectedList)
  }

  /**
   * @description 选择分类变化，需要记录已经选择的分类，不可重复
   */
  const onTreeChange = (keys: string[], id: string, index: number) => {
    onChangeGroupList('value', keys, index)
    selectedNodeRef.current[id] = keys
    updateSelectedList()
  }

  /**
   * @description 删除分类组
   */
  const handleDeleteGroupList = (index: number, id: string) => {
    sortGroupList.splice(index, 1)
    delete selectedNodeRef.current[id]
    updateSelectedList()
    setSortGroupList([...sortGroupList])
  }

  /**
   * @description 添加分类组
   */
  const handleAddGroupList = () => {
    const group = {
      delivery_time: null,
      remark: '',
      value: [],
      id: Date.now().toString(36),
      treeData: _.cloneDeep(treeData),
    }

    sortGroupList.push(group)
    setSortGroupList([...sortGroupList])
    setTimeout(() => scrollToBottom('order-product-plan-box'))
  }

  /**
   * @description 表单提交方法
   */
  const handleSubmit = async (values: NotProcessedData) => {
    setLoading(true)
    const { purchase_batch, purchase_time, purchase_type, isSetClassify } =
      values
    const appoint_time_pairs = sortGroupList.map((item) => ({
      type: settingType,
      rsp_time: item.delivery_time
        ? moment(moment(item.delivery_time).format('YYYY-MM-DD HH:mm')).format(
            'x',
          )
        : undefined,
      categories: { category_ids: item.value },
      batch: item.remark,
    }))
    const categories = appoint_time_pairs.map((item) => item.categories)
    // 生成的ts类型有点问题 isOrder存在是为按订单查看，不存在为按商品查看，业务不同入参也不同
    const params: SyncPurchaseTaskFromOrderRequest = {
      order_filter: {
        common_list_order: isSelectAll
          ? orderStore.getParams()
          : { order_ids: selected },
        paging: { limit: 100 },
      },
      detail_filter: {
        ...productStore.getParams(),
        detail_ids: !isSelectAll ? selected : undefined,
        paging: { limit: 100 },
      },
      all: !!isSelectAll,
      batch: {
        name: purchase_batch,
        last_purchase_time:
          purchase_type === 2
            ? moment(moment(purchase_time).format('YYYY-MM-DD HH:mm')).format(
                'x',
              )
            : undefined,
      },
      appoint_time_pairs: isSetClassify ? appoint_time_pairs : [],
    }

    isOrder ? delete params.detail_filter : delete params.order_filter
    SyncPurchaseTaskFromOrder({ ...params })
      .then(() => {
        store.updateSetting(settingType, categories, isSetClassify)
        handleCancel()
        globalStore.showTaskPanel('1')
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  /**
   * @description 树节点的渲染，考虑 节点disabled的逻辑，故不使用 treeData
   */
  const renderTreeNode = (treeData: DataNode[], id: string) => {
    if (treeData.length <= 0 || !treeData) return null
    const disabledList = getDisabledList(
      selectedNodeRef.current[id],
      selectedList,
      flatTreeDataRef.current,
    )
    return treeData.map((item) => (
      <TreeNode
        key={item.key}
        title={item.title}
        value={item.value}
        disableCheckbox={!!disabledList.find((f) => f === item.key)}
      >
        {renderTreeNode(item.children || [], id)}
      </TreeNode>
    ))
  }

  return (
    <Form
      name='not_processed_form'
      layout='horizontal'
      form={form}
      initialValues={notProcessedData}
      onFinish={handleSubmit}
      onValuesChange={(changeValues, allValue) => {
        form.setFieldsValue({ ...changeValues })
      }}
    >
      <Panel title='采购计划' />
      <Row>
        <Col span={10}>
          <Form.Item name='purchase_type' label={t('计划交期设置')}>
            <Select
              placeholder={t('请选择')}
              style={{ width: '180px' }}
              options={deliveryType}
            />
          </Form.Item>
        </Col>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('purchase_type') === 2 ? (
              <Col span={7}>
                <Form.Item name='purchase_time' label=''>
                  <DatePicker
                    format='YYYY-MM-DD HH:mm'
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
                  />
                </Form.Item>
              </Col>
            ) : null
          }
        </Form.Item>

        <Col span={7}>
          <Form.Item name='purchase_batch' label={t('波次')}>
            <Input placeholder={t('请输入波次信息')} />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Item name='isSetClassify' label={t('设置分类交期')}>
            <Radio.Group options={RadioGroupEnum} />
          </Form.Item>
        </Col>
        <Col style={{ lineHeight: '32px' }}>
          <TipMessage content={TipContent} />
        </Col>
      </Row>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue('isSetClassify') ? (
            <div className='order-list-product-plan-box'>
              {sortGroupList.length > 0 && (
                <div
                  className={classNames('product-plan-box', {
                    'order-plan-box-shadow': sortGroupList.length >= 2,
                  })}
                  id='order-product-plan-box'
                >
                  {sortGroupList.map((item, index) => (
                    <div className='product-plan' key={item.id}>
                      <div className='product-plan-left'>
                        <Row gutter={12}>
                          <Col span={24}>
                            <Form.Item label={t('分类')}>
                              <TreeSelect
                                {...treeDataProps}
                                value={item.value}
                                onChange={(keys) => {
                                  onTreeChange(keys, item.id, index)
                                }}
                              >
                                {renderTreeNode(item.treeData, item.id)}
                              </TreeSelect>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item label={t('日期')}>
                              <DatePicker
                                format='YYYY-MM-DD HH:mm'
                                showTime={{
                                  defaultValue: moment('00:00:00', 'HH:mm'),
                                }}
                                value={
                                  item.delivery_time &&
                                  moment(item.delivery_time)
                                }
                                onChange={(e) =>
                                  onChangeGroupList('delivery_time', e, index)
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label={t('波次')}>
                              <Input
                                placeholder={t('请输入')}
                                value={item.remark}
                                onChange={(e) =>
                                  onChangeGroupList(
                                    'remark',
                                    e.target.value,
                                    index,
                                  )
                                }
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                      <DeleteOutlined
                        className='product-plan-delete-icon'
                        onClick={() => handleDeleteGroupList(index, item.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <a onClick={handleAddGroupList}>
                <PlusCircleOutlined className='product-plan-add-group-list' />
                {t('添加分类组')}
              </a>
            </div>
          ) : null
        }
      </Form.Item>

      <div className='gm-drawer-footer'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button htmlType='submit' type='primary' loading={loading}>
          {t('确定')}
        </Button>
      </div>
    </Form>
  )
}

export default NotProcessedProductPlan
