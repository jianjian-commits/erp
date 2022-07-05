import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
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
  ListSkuForBindingQuotation,
  ListSkuV2Request,
  Sku,
  Sku_SkuType,
} from 'gm_api/src/merchandise'
import { DetailModalRef, QuotaionProps } from '../interface'
import CombineConfirm from './combine_confirm'
import _ from 'lodash'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import globalStore from '@/stores/global'
import store from './store'
import combineStore from '../store'
import quotationStore from '@/pages/merchandise/price_manage/customer_quotation/detail/store'
import classNames from 'classnames'
import '../../../style.less'

const { Step } = Steps

const steps = [
  {
    title: t('添加组合商品'),
    content: 'First-content',
  },
  {
    title: t('确认报价信息'),
    content: 'Second-content',
  },
]

const CombineModal = observer(
  forwardRef<DetailModalRef, any>((props, modalRef) => {
    const {
      selectedRows,
      selectedRowKeys,
      setBindSelected,
      submitBoundQuotation,
      clearStore,
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

    useEffect(() => {
      return () => clearStore()
    }, [])

    const openModal = () => {
      setCurrent(0)
      setIsShow(true)
    }

    const onSelect = (selectedRowKeys: Key[]) => {
      setNextDisabled(selectedRowKeys.length === 0)
    }

    /** 获取组合商品 */
    const fetchList = (paging: Pagination, values?: any) => {
      const filter_params = {
        q: values?.q || '',
        quotation_id: quotationStore.quotation_id,
        sku_type: Sku_SkuType.COMBINE,
      }

      const req: ListSkuV2Request = {
        filter_params,
        paging,
        sort_by: { field: 6, desc: true },
      }

      return ListSkuForBindingQuotation(req).then((json) => {
        const { bound_sku_ids = [], paging, skus = [] } = json.response
        setDisabledList(bound_sku_ids)
        return { list: skus, count: paging.count }
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
              combineStore.getCombineSkuList()
              quotationStore.getQuotation()
              handleClose()
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

    const columns: ColumnType<Sku>[] = [
      {
        title: t('商品图片'),
        key: 'image',
        dataIndex: 'image',
        render: (_, record) => {
          const { repeated_field } = record
          const images = repeated_field?.images || []
          return <ProductImage url={images[0] && images[0].path} />
        },
      },
      {
        title: t('商品名称'),
        key: 'name',
        dataIndex: 'name',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('商品编码'),
        key: 'customize_code',
        dataIndex: 'customize_code',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('基本单位'),
        key: 'base_unit_id',
        dataIndex: 'base_unit_id',
        width: 150,
        render: (text) => globalStore.getUnitName(text) || '-',
      },
    ]

    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        title={t('关联组合商品')}
        visible={isShow}
        style={{ top: 20 }}
        bodyStyle={{ margin: '0px 16px', padding: '16px 16px 0 16px' }}
        width={1250}
        onCancel={handleCancel}
        footer={[
          <Button key='cancel' disabled={submitLoading} onClick={handleCancel}>
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
              <Button key='step' disabled={submitLoading} onClick={handleStep}>
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
        <div className={classNames({ 'table-hide': current !== 0 })}>
          <SelectTable
            tableRef={selectTableRef} // 拿数据用
            selectedKey='name'
            key='sku_id'
            rowKey='sku_id' // id 唯一项
            onSelect={onSelect}
            onSearch={fetchList}
            columns={columns}
            defaultSelectedRows={selectedRows}
            defaultSelectedRowKeys={selectedRowKeys}
            disabledList={disabledList}
            limitCount={50}
            filter={[
              {
                name: 'q',
                placeholder: t('请输入商品名称/编码'),
                type: 'input',
              },
            ]}
          />
        </div>
        {current === 1 && <CombineConfirm ref={quotionRef} />}
      </Modal>
    )
  }),
)
export default CombineModal
