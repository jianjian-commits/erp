/* eslint-disable gm-react-app/no-deprecated-react-gm */
import { ReleaseProductPlan } from '@/common/components/release_product_plan'
import { getProductPlanTree } from '@/common/components/release_product_plan/uti'
import { DataNode, DataNodeMap } from '@/common/interface'
import { deliveryType, RadioGroupEnum } from '@/pages/order/enum'
import globalStore from '@/stores/global'
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Radio,
  Row,
  Select,
  TreeSelect,
} from 'antd'
import { DefaultOptionType } from 'antd/lib/cascader'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { Filters_Bool, SetFlag_Bool } from 'gm_api/src/common'
import {
  DispatchProductionTaskFromOrder,
  DispatchProductionTaskFromOrderRequest,
} from 'gm_api/src/orderlogic'
import {
  ListProductionOrder,
  ListProductionOrderRequest_ViewType,
  ProductionOrder_TimeType,
} from 'gm_api/src/production'
import _, { last } from 'lodash'
import moment from 'moment'
import React, {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import orderStore from '../../view_order/store'
import productStore from '../../view_sku/store'
import Panel from './components/panel'
import TipMessage from './components/tip_message'
import { initProcessedData, TipContent, treeDataProps } from './enum'
import {
  ProcessedData,
  ProductPlanParams,
  ProductPlanProps,
  SelectedNodeMap,
  SortGroupList,
} from './interface'
import { fetchTreeData } from './service'
import store from './store'
import './style.less'
import {
  filterIds,
  flatTreeDataToList,
  getDisabledList,
  scrollToBottom,
} from './util'

const { TreeNode } = TreeSelect

const ProcessedProductPlan = forwardRef<any, ProductPlanProps>((props, ref) => {
  const { onClose, selected, isSelectAll, isOrder, defaultValue } = props

  const [form] = Form.useForm()

  // 获取分类的type,加工品为2
  const settingType = 2

  // 每颗树已选择id，用于计算树的互斥逻辑
  const selectedNodeRef = useRef<SelectedNodeMap>({})
  // treeData 的地址，便于查找
  const flatTreeDataRef = useRef<DataNodeMap>({})

  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<DataNode[]>([])
  const [sortGroupList, setSortGroupList] = useState<SortGroupList[]>([]) // 分类组List
  const [productionOrderList, setProductionOrderList] = useState<
    DefaultOptionType[]
  >([])
  const [processedData, setProcessedData] = useState<ProcessedData>({
    ...initProcessedData,
    ...defaultValue,
  })

  // 已选择的所有Id集合，用于计算树的互斥逻辑
  const [selectedList, setSelectedList] = useState<string[]>([])

  const getParams = () => {
    const { params, categories, formData } = handleGetData()
    return {
      params,
      categories,
      saveSetting: () =>
        store.updateSetting(settingType, categories, formData.isSetClassify),
    } as ProductPlanParams
  }

  useImperativeHandle(ref, () => ({
    getParams,
  }))

  useEffect(() => {
    fetchTreeList()
    fetchOrder()
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
      setProcessedData({
        ...processedData,
        isSetClassify: store.category_setting_open,
      })
      form.setFieldsValue({ isSetClassify: store.category_setting_open })
    })
    setTreeData(treeData)
  }

  const fetchOrder = () => {
    ListProductionOrder({
      begin_time: '' + moment().add(-7, 'day'),
      end_time: '' + moment().add(7, 'day'),
      time_type: ProductionOrder_TimeType.TIME_TYPE_DELIVERY,
      paging: { limit: 999 },
      view_type: ListProductionOrderRequest_ViewType.VIEW_TYPE_DELIVERY,
    }).then((json) => {
      setProductionOrderList(
        getProductPlanTree(json.response.production_orders_view!),
      )
      return json
    })
  }

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose()
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
    setSortGroupList([...sortGroupList])
    updateSelectedList()
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
    // 需要在dom渲染完成后才能获取底部位置
    setTimeout(() => scrollToBottom('order-product-plan-box'))
  }

  const handleGetData = () => {
    const formData = form.getFieldsValue(true)
    const {
      purchase_time,
      purchase_batch,
      pack_time,
      pack_batch,
      pack_merge_mode,
      production_merge_mode,
      production_time,
      production_batch,
      production_cleanfood_time,
      production_cleanfood_batch,
      isSetClassify,
      need_purchase,
      production_cleanfood_order,
      productio_order,
      pack_order,
      to_production_order,
    } = formData
    const appoint_time_pairs = isSetClassify
      ? sortGroupList
          .filter((f) => f.value.length > 0)
          .map((item) => ({
            type: settingType,
            rsp_time: item.delivery_time
              ? moment(
                  moment(item.delivery_time).format('YYYY-MM-DD HH:mm'),
                ).format('x')
              : purchase_time &&
                moment(moment(purchase_time).format('YYYY-MM-DD HH:mm')).format(
                  'x',
                ),
            categories: { category_ids: item.value },
            batch: item.remark === '' ? purchase_batch : item.remark,
          }))
      : []
    const categories = appoint_time_pairs.map((item) => item.categories)

    const purchase_pairs = {
      type: 2,
      rsp_time: purchase_time && '' + moment(purchase_time),
      categories: { category_ids: [] },
      batch: purchase_batch,
    }

    const pack_pairs = {
      type: 4,
      rsp_time: pack_time && '' + moment(pack_time).endOf('days'),
      categories: { category_ids: [] },
      batch: pack_batch,
      production_order_id:
        to_production_order === Filters_Bool.TRUE
          ? pack_order?.slice(-1)[0]
          : undefined,
    }

    const production_pairs = {
      type: 3,
      rsp_time: production_time && '' + moment(production_time).endOf('days'),
      categories: { category_ids: [] },
      batch: production_batch,
      production_order_id:
        to_production_order === Filters_Bool.TRUE
          ? productio_order?.slice(-1)[0]
          : undefined,
    }

    const production_cleanfood_pairs = {
      type: 7,
      rsp_time:
        production_cleanfood_time &&
        '' + moment(production_cleanfood_time).endOf('days'),
      categories: { category_ids: [] },
      batch: production_cleanfood_batch,
      production_order_id:
        to_production_order === Filters_Bool.TRUE
          ? production_cleanfood_order?.slice(-1)[0]
          : undefined,
    }

    const params: DispatchProductionTaskFromOrderRequest = {
      order_filter: isOrder
        ? {
            common_list_order: isSelectAll
              ? orderStore.getParams()
              : { order_ids: selected },
            paging: { limit: 100 },
          }
        : undefined,
      detail_filter: isOrder
        ? undefined
        : {
            ...productStore.getParams(),
            detail_ids: !isSelectAll ? selected : undefined,
            paging: { limit: 100 },
          },
      all_order: !!isSelectAll,
      pack_merge_mode,
      production_merge_mode,
      appoint_time_pairs: [
        ...appoint_time_pairs,
        purchase_pairs,
        pack_pairs,
        production_pairs,
        production_cleanfood_pairs,
      ],
      need_purchase,
    }
    return { params, categories, formData }
  }

  /**
   * @description 表单提交方法
   */
  const handleSubmit = (fieldsValue: ProcessedData) => {
    setLoading(true)
    const { params, categories } = handleGetData()
    return DispatchProductionTaskFromOrder({ ...params })
      .then(() => {
        store.updateSetting(settingType, categories, fieldsValue.isSetClassify)
        handleCancel()
        setLoading(false)
        globalStore.showTaskPanel('1')
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
      name='processed_form'
      layout='horizontal'
      form={form}
      initialValues={processedData}
      onFinish={handleSubmit}
      onValuesChange={(changeValues, allValue) => {
        form.setFieldsValue({ ...changeValues })
      }}
    >
      <Panel title={t('采购计划')} />
      <Form.Item name='need_purchase' label={t('是否进行采购计划')}>
        <Radio.Group
          options={[
            {
              label: t('是'),
              value: SetFlag_Bool.TRUE,
            },
            {
              label: t('否'),
              value: SetFlag_Bool.FALSE,
            },
          ]}
        />
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue('need_purchase') === SetFlag_Bool.TRUE ? (
            <>
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
                            showTime={{
                              defaultValue: moment('00:00:00', 'HH:mm'),
                            }}
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
                            <div className='product-plan' key={index}>
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
                                          defaultValue: moment(
                                            '00:00:00',
                                            'HH:mm',
                                          ),
                                        }}
                                        value={
                                          item.delivery_time &&
                                          moment(item.delivery_time)
                                        }
                                        onChange={(e) =>
                                          onChangeGroupList(
                                            'delivery_time',
                                            e,
                                            index,
                                          )
                                        }
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item label={t('波次')}>
                                      <Input
                                        placeholder={t('请输入波次信息')}
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
                                onClick={() =>
                                  handleDeleteGroupList(index, item.id)
                                }
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
            </>
          ) : null
        }
      </Form.Item>
      <Panel title={t('生产计划')} />
      <ReleaseProductPlan options={productionOrderList} />
      {!ref && (
        <div className='gm-drawer-footer'>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          <Button htmlType='submit' type='primary' loading={loading}>
            {t('确定')}
          </Button>
        </div>
      )}
    </Form>
  )
})

export default ProcessedProductPlan
