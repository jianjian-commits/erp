import React, {
  useMemo,
  useEffect,
  useContext,
  useImperativeHandle,
  forwardRef,
} from 'react'
import {
  Card,
  Form,
  InputNumber,
  Modal,
  PaginationProps,
  Row,
  Table,
  TableColumnType,
  Tooltip,
} from 'antd'

import '../style.less'
import { ChildrenType } from '@/pages/merchandise/price_manage/customer_quotation/data'
import { t } from 'gm-i18n'
import ProductImage from '@/common/components/product_image'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { priceValidator } from '@/pages/merchandise/util'
import store, { FormularParams, TableList } from './store'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import { formatParamsForPagination } from '@/common/util'
import { observer } from 'mobx-react'
import PriceFormularFilter from './filter'
import _ from 'lodash'
import { selectSkuIdsContext } from '../list'
import { parseFormula } from '@/common/components/formula/calculator'
import { DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo } from 'gm_api/src/merchandise'
import { QuestionCircleOutlined } from '@ant-design/icons'

interface PriceFormularProps {
  ref: React.Ref<PriceFormularRef>
  /**
   * 下一步&查询
   */
  handleNextStep: (
    fetchList: (
      formularParams?: FormularParams,
      isResetCurrent?: boolean,
    ) => Promise<any>,
  ) => void
}

export type PriceFormularRef = {
  modifyList: Required<DeltaUpdateBasicPriceV2ByPricingFormulaRequest_BasicPriceItemInfo>[]
  deleteRow: string[]
}

/**
 * @description: 定价公式-填写商品单价
 */
const PriceFormular = forwardRef<PriceFormularRef, PriceFormularProps>(
  (props, ref) => {
    const {
      expandedRowKeys,
      setExpandedRowKeys,
      tableList,
      paging,
      setPaging,
      setPagination,
      setDeleteRow,
      setSelected,
      setModifyList,
      realCount,
      fetchList,
      init,
      loading,
      modifyList,
      deleteRow,
    } = store

    const [form] = Form.useForm()

    const selected = useContext(selectSkuIdsContext)

    useEffect(() => {
      init()
      setSelected(selected)
      props.handleNextStep(fetchList)
    }, [])

    useImperativeHandle(ref, () => ({
      modifyList,
      deleteRow,
    }))

    const columns: TableColumnType<TableList>[] = useMemo(
      () => [
        {
          title: t('商品名'),
          width: 250,
          dataIndex: 'order_unit_id',
          key: 'order_unit_id',
          render: (_, record) => {
            const { name, customize_code = '', images } = record
            return (
              <div className='gm-order-unit-tr-colspan'>
                <ProductImage url={images?.path || ''} />
                <TableTextOverflow text={name + ' ID:' + customize_code} />
              </div>
            )
          },
          className: 'gm-order-unit-columns',
        },
        {
          title: t('下单单位'),
          dataIndex: 'order_unit_id',
          key: 'order_unit_id',
          width: 100,
        },
        {
          title: t('定价公式'),
          dataIndex: 'formular',
          key: 'formular',
          width: 150,
        },
        {
          title: t('更新前单价'),
          key: 'fee_unit_price',
          width: 100,
          dataIndex: 'fee_unit_price',
        },
        {
          title: (
            <span>
              {t('更新后单价')}
              <Tooltip
                overlay={t(
                  '更新后单价为负数/0时，数据显示为空，保存则不更新。',
                )}
              >
                <QuestionCircleOutlined
                  className='gm-text-12'
                  style={{ marginLeft: 4, color: '#8F8F8F' }}
                />
              </Tooltip>
            </span>
          ),
          key: 'fee_unit_price_after',
          width: 350,
          dataIndex: 'fee_unit_price_after',
        },
        {
          title: t('操作'),
          dataIndex: 'operation',
          key: 'operation',
          width: 120,
          render: (_, record) => {
            return (
              <a
                onClick={() => {
                  Modal.confirm({
                    title: t('删除'),
                    content: t(`确定要删除${record.name}的所有定价条目吗？`),
                    okText: t('确认'),
                    cancelText: t('取消'),
                    onOk: (close) => {
                      setDeleteRow(record.items.map((i) => i.id))
                      close()
                    },
                  })
                }}
              >
                {t('删除')}
              </a>
            )
          },
        },
      ],
      [],
    )

    /** 子表 */
    const expandedRowRender = (record: TableList) => {
      const columns: TableColumnType<ChildrenType>[] = [
        // 占位用
        { title: '', width: 250, render: () => '' },
        {
          title: (
            <>
              <span className='gm-text-red'>*</span>
              {t('下单单位')}
            </>
          ),
          dataIndex: 'order_unit_id',
          key: 'order_unit_id',
          width: 100,
          // align: 'center',
          render: (_, row) => {
            const { units, order_unit_id } = row
            return units.find((f) => f.value === order_unit_id)?.label || '-'
          },
        },
        {
          title: t('定价公式'),
          dataIndex: 'formular',
          key: 'formular',
          width: 150,
          render: (_, row) =>
            parseFormula(row.formula_text)
              .map((item) => item.content)
              .join('') || '-',
        },
        {
          title: t('更新前单价'),
          key: 'fee_unit_price',
          // align: 'center',
          width: 100,
          dataIndex: 'fee_unit_price',
          render: (_, record) => {
            const { fee_unit_price_origin, units } = record
            return (
              <>
                {fee_unit_price_origin.val}
                {t('元')}/
                {units.find((f) => f.value === fee_unit_price_origin.unit_id)
                  ?.label || '-'}
              </>
            )
          },
        },
        {
          title: t('更新后单价'),
          key: 'fee_unit_price_after',
          // align: 'center',
          width: 350,
          dataIndex: 'fee_unit_price_after',
          render: (_, record) => {
            const {
              fee_unit_price: { val, unit_id },
              id,
              units,
            } = record
            return (
              <Row>
                <Form.Item
                  // id={'fee_unit_price_after' + id}
                  name={id}
                  rules={[
                    { required: true, message: t('请输入更新后单价') },
                    { validator: priceValidator },
                  ]}
                  initialValue={val}
                >
                  <InputNumber
                    min={0}
                    addonBefore='¥'
                    placeholder={t('请输入')}
                    max={9999999999}
                    style={{ width: 150 }}
                    value={Number(val || 0)}
                  />
                </Form.Item>

                <span style={{ margin: 'auto 0' }}>
                  {`/${units.find((f) => f.value === unit_id)?.label || '-'}`}
                </span>
              </Row>
            )
          },
        },
        {
          title: t('操作'),
          dataIndex: 'operation',
          key: 'operation',
          width: 120,
          render: (_, record) => {
            return (
              <a
                onClick={() => {
                  Modal.confirm({
                    title: t('删除'),
                    content: t('确定要删除该定价条目吗？'),
                    okText: t('确认'),
                    cancelText: t('取消'),
                    onOk: (close) => {
                      setDeleteRow(record.id)
                      close()
                    },
                  })
                }}
              >
                {t('删除')}
              </a>
            )
          },
        },
      ]

      return (
        <Table
          rowKey='id'
          rowClassName='table-expandedRow-color'
          columns={columns}
          dataSource={record.items}
          pagination={false}
          showHeader={false}
        />
      )
    }

    /**
     * 页码器相关
     */
    const pagination: PaginationProps = {
      current: paging.current,
      pageSize: paging.pageSize,
      total: realCount,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onChange: (page, pageSize) => {
        setPaging({ current: page, pageSize })
        const isResetCurrent = pageSize !== paging.pageSize

        const pageInfo = formatParamsForPagination(page, pageSize)
        setPagination({
          ...pageInfo,
          offset: isResetCurrent ? 0 : pageInfo.offset,
        })
        store.fetchList(undefined, isResetCurrent)
      },
      showTotal: (total) => `共${total}条记录`,
    }

    return (
      <>
        <PriceFormularFilter />
        <Card bordered={false} bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}>
          <Form
            form={form}
            onFinish={_.noop}
            className='merchandise-ant-form-table'
            onValuesChange={(v) => {
              const key = Object.keys(v)[0]
              const [order_unit_id, sku_id] = key.split('/')
              setModifyList({ sku_id, order_unit_id, price: `${v[key]}` })
            }}
            preserve={false}
          >
            <Table<TableList>
              loading={loading}
              rowKey='id'
              columns={columns}
              expandable={{
                defaultExpandAllRows: true,
                expandedRowRender,
                expandedRowKeys,
                onExpandedRowsChange: setExpandedRowKeys,
              }}
              dataSource={tableList}
              pagination={pagination}
              scroll={{ y: 'calc(100vh - 500px)' }}
              size='small'
            />
          </Form>
        </Card>
      </>
    )
  },
)

export default observer(PriceFormular)
