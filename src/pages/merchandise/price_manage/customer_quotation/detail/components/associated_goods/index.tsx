import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  ReactNode,
} from 'react'
import _ from 'lodash'
import { Button, Modal, Steps } from 'antd'
import SelectTable, { SelectTableRef } from '@/common/components/select_table'
import { ListQuotation } from 'gm_api/src/merchandise'
import { t } from 'gm-i18n'
import { fetchTreeData } from '@/common/service'
import { DataOption } from '@/common/interface'
import { formatCascaderData } from '@/common/util'
import InfoTable from './info_table'

const { Step } = Steps

export interface AssociatedGoodsRef {
  handleOpen: () => void
  handleClose: () => void
}

interface AssociatedGoodsProps {
  title: ReactNode
}

/** 关联商品 */
const AssociatedGoods = forwardRef<AssociatedGoodsRef, AssociatedGoodsProps>(
  (props, ref) => {
    const { title } = props
    const [visible, setVisible] = useState(false)
    const [current, setCurrent] = useState(0)
    const selectTableRef = useRef<SelectTableRef>(null)
    const [option, setOption] = useState<DataOption[]>([])

    useEffect(() => {
      fetchData()
    }, [])

    const handleOpen = () => {
      setVisible(true)
    }

    const handleClose = () => {
      setVisible(false)
    }

    useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
    }))

    const fetchData = async () => {
      const { treeData } = await fetchTreeData()
      setOption(formatCascaderData(treeData))
    }

    const fetchList = (page, values) => {
      const params = {
        inner_name: values?.inner_name || '',
        is_active: 0,
        need_ssu_on_sale_num: true,
        paging: { limit: 999 },
        type: 1,
      }
      return ListQuotation({ ...params }).then((json) => {
        const { quotations, ssu_on_sale_num_map } = json.response
        const list = _.map(quotations || [], (qu) => {
          return {
            ...qu,
            ssu_num: ssu_on_sale_num_map
              ? ssu_on_sale_num_map[qu.quotation_id]
              : '',
          }
        })
        return {
          list: list,
          count: 10,
        }
      })
    }

    const columns = [
      { title: t('商品图片'), id: 'inner_name', dataIndex: 'inner_name' },
      { title: t('商品名称'), id: 'serial_no', dataIndex: 'serial_no' },
      { title: t('商户编码'), id: 'outer_name', dataIndex: 'outer_name' },
      { title: t('商品分类'), id: 'outer_name', dataIndex: 'outer_name' },
      { title: t('基本单位'), id: 'outer_name', dataIndex: 'outer_name' },
    ]

    const steps = [
      {
        title: t('添加报价单'),
        content: 'First-content',
      },
      {
        title: t('填写报价信息'),
        content: 'Second-content',
      },
    ]

    const next = () => {
      setCurrent(current + 1)
    }

    const prev = () => {
      setCurrent(current - 1)
    }

    const onSubmit = () => {
      console.log('onSubmit')
    }

    return (
      <Modal
        title={title}
        destroyOnClose
        style={{ top: 20 }}
        visible={visible}
        bodyStyle={{ margin: '0px 16px 0px 16px' }}
        width={1200}
      >
        <div style={{ width: '360px' }}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </div>

        {current === 0 && (
          <SelectTable
            filter={[
              {
                name: 'inner_name',
                placeholder: t('请输入报价单名称'),
                type: 'input',
              },
            ]}
            tableRef={selectTableRef} // 拿数据用
            disabledList={['379686976246251541']} // 禁用选择的list
            rowKey='quotation_id' // id 唯一项
            onSearch={fetchList}
            columns={columns}
          />
        )}
        {current === 1 && <InfoTable />}

        <div className='gm-modal-footer'>
          <Button onClick={handleClose}>{t('取消')}</Button>
          {current === 0 && (
            <Button type='primary' onClick={next}>
              {t('下一步')}
            </Button>
          )}
          {current === 1 && (
            <>
              <Button onClick={prev}>{t('上一步')}</Button>
              <Button onClick={onSubmit} type='primary'>
                {t('提交')}
              </Button>
            </>
          )}
        </div>
      </Modal>
    )
  },
)

export default AssociatedGoods
