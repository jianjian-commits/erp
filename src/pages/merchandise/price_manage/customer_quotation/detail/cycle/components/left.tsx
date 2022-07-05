/**
 * @description 周期报价单tab左侧子报价单列表部分
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import {
  DatePicker,
  Button,
  List,
  Menu,
  Row,
  Col,
  Modal,
  message,
  Empty,
  Space,
} from 'antd'
import VirtualList from 'rc-virtual-list'
import { t } from 'gm-i18n'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
} from '@ant-design/icons'
import _ from 'lodash'
import '../style.less'
import store from '../store'
import baseStore from '../../store'
import CreateChildQuotation, {
  CreateModalRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/cycle/components/create_child_quotation'
import {
  Quotation,
  Quotation_Status,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { observer } from 'mobx-react'
import moment, { Moment } from 'moment'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import CycleItem from './cycle_item'
import SvgEdit from '@/svg/edit.svg'

/**
 * 根据报价单状态决定 「禁用」「启用」按钮是否显示
 */
function switchStatusActionButton(status?: Quotation_Status) {
  return {
    enable: status === Quotation_Status.STATUS_WAIT_VALID,
    disabled:
      status === Quotation_Status.STATUS_VALID ||
      status === Quotation_Status.STATUS_WAIT_AVAILABLE ||
      status === Quotation_Status.STATUS_AVAILABLE,
  }
}

const CycleLeft: FC = observer(() => {
  const {
    setPagingOffset,
    childQuotationList,
    setPeriodicTime,
    activeQuotationId,
    setActiveQuotationId,
    setSkuType,
    listLoading,
    listHasMore,
    listIsEmpty,
  } = store
  const isVaildId = !_.isEmpty(activeQuotationId)

  /** 当前操作的子报价单 */
  const [operatedQuotation, setOperatedQuotation] = useState<
    Quotation | undefined
  >(undefined)
  /** 报价单信息弹窗状态 */
  const [isCreate, setIsCreate] = useState(true)
  /** 子报价单列表高度 */
  const [listHeight, setListHeight] = useState(0)

  /** 编辑子报价单信息弹窗 */
  const createChildRef = useRef<CreateModalRef>(null)

  useEffect(() => {
    setListHeight(window.innerHeight - 300)
    setPagingOffset(false)
  }, [])

  useEffect(() => {
    setSkuType(Sku_SkuType.NOT_PACKAGE)
  }, [activeQuotationId])

  /** 新建子报价单 */
  const createChildQuotation = () => {
    setIsCreate(true)
    setOperatedQuotation(undefined)
    createChildRef.current && createChildRef.current.setIsVisible(true)
  }

  /** 子报价单列表时间筛选 */
  const onDateChange = (date: Moment | null) => {
    setPeriodicTime(date ? moment(date).valueOf().toString() : '')
  }

  /** 滚动拉取更多子报价单 */
  const onScroll = (e: any) => {
    if (!listHasMore) return
    if (e.target.scrollHeight - e.target.scrollTop === listHeight) {
      setPagingOffset(true)
    }
  }

  /** 获取当前操作子报价单信息 */
  const getOperatedQuotation = (id: string) => {
    return _.find(childQuotationList, (item) => item.quotation_id === id)
  }

  /** 编辑子报价单 */
  const handleEdit = (id: string) => {
    setOperatedQuotation(_.cloneDeep(getOperatedQuotation(id)))
    setIsCreate(false)
    createChildRef.current && createChildRef.current.setIsVisible(true)
  }

  /** 启用子报价单 */
  const handleEnable = (id: string) => {
    Modal.confirm({
      title: t('启用'),
      content: t('确认要启用该周期内的报价单吗？'),
      onOk: async () => {
        try {
          store.enableQuotation(id).then(() => {
            message.success(t('操作成功'))
          })
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      },
    })
  }

  /** 禁用子报价单 */
  const handleDisable = (id: string) => {
    Modal.confirm({
      title: t('禁用'),
      content: t('确认要禁用该周期内的报价单吗？'),
      onOk: async () => {
        try {
          await store.disableQuotation(id)
          message.success(t('操作成功'))
          return Promise.resolve()
        } catch (error) {
          return Promise.reject(error)
        }
      },
    })
  }

  /** 删除子报价单 */
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('删除'),
      content: (
        <>
          <span>{t('确认要删除该周期内的报价单吗？')}</span>
          <p style={{ color: '#f00' }}>
            {t('注意：删除后，该周期内客户将无法正常下单。')}
          </p>
        </>
      ),
      okText: t('删除'),
      okButtonProps: { danger: true },
      async onOk() {
        await store.deleteQuotation(id)
        await baseStore.getQuotationRequest(baseStore.parentQuotationId)
      },
    })
  }

  /** 子报价单操作按钮 */
  const moreOperation = (id: string, status?: Quotation_Status) => {
    const { disabled, enable } = switchStatusActionButton(status)
    return (
      <Menu className='tw-text-center tw-p-0' style={{ minWidth: 104 }}>
        <Menu.Item
          key='edit'
          style={{ minHeight: 44 }}
          onClick={() => handleEdit(id)}
          disabled={
            !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
            )
          }
        >
          <Space size={6} align='center'>
            <SvgEdit className='gm-text-18' style={{ marginTop: 2 }} />
            {t('编辑')}
          </Space>
        </Menu.Item>
        {disabled && (
          <Menu.Item
            key='disabled'
            style={{ minHeight: 44 }}
            onClick={() => handleDisable(id)}
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              )
            }
          >
            <Space size={6}>
              <StopOutlined className='gm-text-16' />
              {t('禁用')}
            </Space>
          </Menu.Item>
        )}
        {enable && (
          <Menu.Item
            key='disabled'
            style={{ minHeight: 44 }}
            onClick={() => handleEnable(id)}
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              )
            }
          >
            <Space size={6}>
              <CheckCircleOutlined className='gm-text-16' />
              {t('启用')}
            </Space>
          </Menu.Item>
        )}
        <Menu.Item
          key='delete'
          style={{ minHeight: 44 }}
          onClick={() => handleDelete(id)}
          disabled={
            !globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_DELETE_QUOTATION,
            )
          }
        >
          <Space size={6}>
            <DeleteOutlined className='gm-text-16' />
            {t('删除')}
          </Space>
        </Menu.Item>
      </Menu>
    )
  }

  return (
    <div>
      <Row
        className='cycle_left_top tw-items-stretch'
        justify='space-between'
        align='middle'
      >
        <Col>
          <DatePicker className='left_date_picker' onChange={onDateChange} />
        </Col>
        <Col>
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_CREATE_QUOTATION}
          >
            <Button
              className='left_new_btn'
              icon={<PlusOutlined />}
              onClick={createChildQuotation}
            >
              {t('新建')}
            </Button>
          </PermissionJudge>
        </Col>
      </Row>
      <List split={false} className='cycle_left_list'>
        {!isVaildId || listIsEmpty ? (
          <div
            className='tw-flex tw-items-center tw-justify-center'
            style={{ height: listHeight }}
          >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <VirtualList
            data={childQuotationList}
            itemKey='quotation_id'
            height={listHeight}
            itemHeight={50}
            onScroll={onScroll}
          >
            {(item) => {
              const { quotation_id, inner_name, status } = item
              return item.quotation_id ? (
                <List.Item key={quotation_id}>
                  <CycleItem
                    quotationId={quotation_id}
                    status={status!}
                    name={inner_name}
                    activated={activeQuotationId === quotation_id}
                    onClick={setActiveQuotationId}
                    overlay={moreOperation(quotation_id, status)}
                  />
                </List.Item>
              ) : (
                <>
                  {listLoading && (
                    <List.Item>
                      <Row
                        className='cycle_left_list_end'
                        justify='center'
                        align='middle'
                      >
                        {t('加载中')}
                      </Row>
                    </List.Item>
                  )}
                </>
              )
            }}
          </VirtualList>
        )}
      </List>
      <CreateChildQuotation
        ref={createChildRef}
        isCreate={isCreate}
        quotation={operatedQuotation}
      />
    </div>
  )
})

export default CycleLeft
