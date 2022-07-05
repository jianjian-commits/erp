import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  Key,
} from 'react'
import { observer } from 'mobx-react'
import { Modal, Steps, Button, message } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import SelectTable, {
  Pagination,
  SelectTableRef,
} from '@/common/components/select_table'
import {
  ListQuotationForBindingSku,
  map_Quotation_Type,
  Quotation,
  QuotationSortField,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import TableTextOverflow from '@/common/components/table_text_overflow'
import store from './store'
import combineStore from '../../store'
import quotationStore from '../store'
import DetailConfirm from './detail_confirm'
import { DetailModalRef, QuotaionProps } from '../../interface'
import '../../../style.less'
import classNames from 'classnames'
import { getChildEffectiveTime } from '@/pages/merchandise/manage/util'
import { QUOTATION_TYPE_OPTIONS } from '@/pages/merchandise/price_manage/customer_quotation/constants'

const { Step } = Steps

const steps = [
  {
    title: t('添加报价单'),
    content: 'First-content',
  },
  {
    title: t('确认报价信息'),
    content: 'Second-content',
  },
]

const DetailModal = observer(
  forwardRef<DetailModalRef, any>((props, modalRef) => {
    const {
      selectedRows,
      selectedRowKeys,
      setBindSelected,
      submitBoundQuotation,
    } = store
    const selectTableRef = useRef<SelectTableRef<any>>(null)
    const quotionRef = useRef<QuotaionProps>(null)
    const [isShow, setIsShow] = useState<boolean>(false)
    const [current, setCurrent] = useState<number>(2)
    const [disabledList, setDisabledList] = useState<string[]>([])
    const [nextDisabled, setNextDisabled] = useState<boolean>(true)
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)

    useImperativeHandle(modalRef, () => ({
      openModal,
    }))

    const onSelect = (keys: Key[]) => {
      setNextDisabled(keys.length === 0)
    }

    const openModal = () => {
      setCurrent(0)
      setIsShow(true)
    }

    /** 获取报价单 */
    const fetchList = (
      paging: Pagination,
      values:
        | { quotation_q: string; quotation_type: Quotation_Type }
        | undefined,
    ) => {
      return ListQuotationForBindingSku({
        filter_params: {
          ...values,
          quotation_type:
            values?.quotation_type === Quotation_Type.UNSPECIFIED
              ? undefined
              : values?.quotation_type,
          quotation_types:
            !values || values?.quotation_type === Quotation_Type.UNSPECIFIED
              ? [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC]
              : undefined,
          sku_id: combineStore.skuId,
          parent_quotation_filter: true,
          periodic_time: `${Date.now()}`,
        },
        sort_by: [
          { field: Number(QuotationSortField.QUOTATION_ID), desc: true },
        ],
        paging,
      }).then((json) => {
        const {
          bound_quotation_ids = [],
          paging,
          quotations = [],
        } = json.response
        setDisabledList(bound_quotation_ids)

        const newQuotation = _.map(quotations, (quotationItem) => {
          if (quotationItem.type === Quotation_Type.PERIODIC) {
            const { parent_child_inner_name = '', parent_serial_no = '' } =
              quotationItem
            return {
              ...quotationItem,
              inner_name: parent_child_inner_name,
              serial_no: parent_serial_no,
            }
          } else {
            return quotationItem
          }
        })

        return {
          list: newQuotation,
          count: paging.count,
        }
      })
    }

    const handleClose = () => {
      setBindSelected([], [])
      setCurrent(2)
      setNextDisabled(true)
      setIsShow(false)
    }

    /** 取消 */
    const handleCancel = () => {
      if (current === 1) {
        Modal.confirm({
          title: t('提示'),
          content: t('取消后已填写的信息将会失效，确定要离开？'),
          okText: t('继续填写'),
          cancelText: t('离开'),
          onCancel: () => {
            handleClose()
          },
        })
      } else {
        handleClose()
      }
    }

    /** 确定 */
    const handleOk = async () => {
      if (quotionRef.current) {
        const result = await quotionRef.current.handleVerify()
        if (result.errorFields?.length) {
          message.error(result.errorFields[0].errors[0])
        } else {
          setSubmitLoading(true)
          submitBoundQuotation()
            .then(() => {
              message.success(t('绑定成功'))
              combineStore.getQuotationCount()
              quotationStore.getQuotationList(true)
              handleClose()
            })
            .catch((err) => {
              console.log('bound err', err)
            })
            .finally(() => {
              setSubmitLoading(false)
            })
        }
      }
    }

    const onPrev = () => {
      Modal.confirm({
        title: t('提示'),
        content: t('返回上一步后已填写的信息将会失效，确定要离开？'),
        okText: t('继续填写'),
        cancelText: t('上一步'),
        onCancel: () => {
          setCurrent(0)
        },
      })
    }

    /** 上/下一步 */
    const handleStep = async () => {
      if (current === 0) {
        if (selectTableRef.current) {
          const { selectedRows, selectedRowKeys } = selectTableRef.current
          const errList = await setBindSelected(selectedRows, selectedRowKeys)
          if (errList?.length) {
            errList.forEach((errItem) => {
              message.error(
                `商品${errItem.skuName}在报价单${errItem.quotationName}中已超过20条报价信息，无法绑定`,
              )
            })
          } else {
            setCurrent(1)
          }
        }
      } else {
        onPrev()
      }
    }

    const columns: ColumnType<Quotation>[] = [
      {
        title: t('报价单名称'),
        key: 'inner_name',
        dataIndex: 'inner_name',
        width: 180,
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('报价单编码'),
        key: 'serial_no',
        dataIndex: 'serial_no',
      },
      {
        title: t('对外简称'),
        key: 'outer_name',
        dataIndex: 'outer_name',
        width: 180,
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('类型'),
        key: 'type',
        dataIndex: 'type',
        width: 110,
        render: (text) => t(map_Quotation_Type[text]),
      },
      {
        title: t('生效日期'),
        key: 'start_time',
        dataIndex: 'start_time',
        width: 220,
        align: 'center',
        render: (_, record) => t(getChildEffectiveTime(record)),
      },
    ]

    return (
      <Modal
        title={t('关联报价单')}
        visible={isShow}
        maskClosable={false}
        style={{ top: 20 }}
        destroyOnClose
        bodyStyle={{
          margin: '0px 16px',
          padding: '16px 16px 0 16px',
        }}
        width={1250}
        onCancel={handleCancel}
        footer={[
          <Button key='cancel' onClick={handleCancel} disabled={submitLoading}>
            {t('取消')}
          </Button>,
          <>
            {current === 0 && (
              <Button
                key='step'
                type='primary'
                disabled={nextDisabled}
                onClick={handleStep}
              >
                {t('下一步')}
              </Button>
            )}
          </>,
          <>
            {current === 1 && (
              <Button key='step' onClick={handleStep} disabled={submitLoading}>
                {t('上一步')}
              </Button>
            )}
          </>,
          <>
            {current === 1 && (
              <Button
                key='confirm'
                type='primary'
                loading={submitLoading}
                onClick={handleOk}
              >
                {t('提交')}
              </Button>
            )}
          </>,
        ]}
      >
        <div style={{ width: '360px' }}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </div>
        <div className='line' />
        <div className={classNames({ 'bound-table-hide': current !== 0 })}>
          {console.log('disabledList', disabledList)}
          <SelectTable
            tableRef={selectTableRef} // 拿数据用
            selectedKey='inner_name'
            key='quotation_id'
            rowKey='quotation_id' // id 唯一项
            onSelect={onSelect}
            onSearch={fetchList}
            columns={columns}
            defaultSelectedRows={selectedRows}
            defaultSelectedRowKeys={selectedRowKeys}
            disabledList={disabledList}
            limitCount={50}
            filter={[
              {
                name: 'quotation_type',
                type: 'select',
                options: QUOTATION_TYPE_OPTIONS,
                initialValue: Quotation_Type.UNSPECIFIED,
              },
              {
                name: 'quotation_q',
                placeholder: t('请输入报价单名称/编码'),
                type: 'input',
              },
            ]}
          />
        </div>
        {current === 1 && <DetailConfirm ref={quotionRef} />}
      </Modal>
    )
  }),
)
export default DetailModal
