import { Table } from '@gm-pc/table-x'
import { Form, Input, Modal, Space } from 'antd'
import { t } from 'gm-i18n'
import _, { isEmpty, keys } from 'lodash'
import CategoryCascader from '@/pages/merchandise/manage/merchandise_list/create/base_info/category_cascader'
import React, { useEffect, useState } from 'react'
import { TableData } from './types'
import tableColumns from './table_columns'
import { ListFormulaFromSkuBindingQuotations } from 'gm_api/src/merchandise'
import { FilterType } from '@/pages/merchandise/price_manage/customer_quotation/detail/product/store'

export interface HistoryFormulaModalProps {
  /**
   * 控制弹窗显示
   */
  visible?: boolean
  /**
   * 关闭弹窗
   */
  onClose?: () => void
  /**
   * 点击确定按钮时触发，参数为已选择的数据的 id
   */
  onChange?: (data: TableData) => void
}

type FormFilterType = Omit<FilterType, 'on_shelf'>

/**
 * 已有公式弹窗
 */
const HistoryFormulaModal: React.VFC<HistoryFormulaModalProps> = (props) => {
  const [form] = Form.useForm<FormFilterType>()
  const { visible, onClose, onChange } = props

  const [data, setData] = useState<TableData[]>([])
  const [selectedId, setSelectedId] = useState<string[]>()

  useEffect(() => {
    visible && fetchExistFormula()
  }, [visible])

  /**
   * @description: 查询已有公式
   * @param {string} category_id 分类最后一级id
   * @param {string} q 商品名称模糊搜索
   * @return {*}
   */
  const fetchExistFormula = (category_id?: string, q?: string): void => {
    ListFormulaFromSkuBindingQuotations({
      list_sku_v2_request: {
        filter_params: {
          category_id,
          q,
        },
        paging: { all: true },
      },
    }).then((json) => {
      setData(
        json.response.formula_infos?.map((item) => ({
          id: item.unit_name! + item.sku_id!,
          name: item.sku_name!,
          formula: item.formula!,
        })) || [],
      )
    })
  }

  const handleChange = () => {
    if (
      _.isFunction(onChange) &&
      Array.isArray(selectedId) &&
      !isEmpty(selectedId)
    ) {
      const [id] = selectedId as string[]
      const index = data.findIndex((item) => item.id === id)
      onChange(data[index])
      // eslint-disable-next-line no-unused-expressions
      onClose?.()
    }
  }

  return (
    <Modal
      visible={visible}
      title={t('已有公式')}
      width={670}
      bodyStyle={{ paddingBottom: 0 }}
      onOk={handleChange}
      onCancel={onClose}
      destroyOnClose
    >
      <Space className='gm-padding-bottom-15'>
        <Form<FormFilterType>
          form={form}
          name='merchandise-manage-sale'
          layout='inline'
          onValuesChange={(whichField, values) => {
            if (Object.keys(whichField)[0] === 'q') return
            fetchExistFormula(
              values.category_id
                ? values.category_id[values.category_id.length - 1]
                : undefined,
              form.getFieldValue('q'),
            )
          }}
          preserve={false}
        >
          <Form.Item name='category_id'>
            <CategoryCascader showAdd={false} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name='q'>
            <Input.Search
              placeholder={t('请输入商品名称')}
              enterButton={t('搜索')}
              onSearch={() => {
                const { category_id, q } = form.getFieldsValue()
                fetchExistFormula(
                  category_id ? category_id[category_id.length - 1] : undefined,
                  q,
                )
              }}
            />
          </Form.Item>
        </Form>
      </Space>
      <Table<TableData>
        isSelect
        selectType='radio'
        isVirtualized
        virtualizedHeight={480}
        virtualizedItemSize={62}
        selected={selectedId}
        onSelect={setSelectedId}
        keyField='id'
        data={data}
        columns={tableColumns}
      />
    </Modal>
  )
}

export default HistoryFormulaModal
