import React, { FC, useState, useEffect, useMemo } from 'react'
import { t } from 'gm-i18n'
import {
  Select,
  Modal,
  Table,
  TableColumnProps,
  Input,
  message,
  Popover,
  Button,
} from 'antd'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import { PlusCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { LabelFilter } from '../interface'
import { getCategoryName } from '@/common/util'
import ProductImage from '@/common/components/product_image'
import store from '../store'
import createStore from './create/store'
import { observer } from 'mobx-react'
import { Sku, Sku_SkuLevel } from 'gm_api/src/merchandise'

interface GradeSelectProps {
  onChange?: (value: string) => void
  style?: {}
  value?: string
  options?: LabelFilter[]
  skuInfo?: Sku
  type?: string
  levelId?: string
}
const initTableItem = {
  label: '',
  value: '',
}
// 根据Type来判断一下这个是从客户新建过来的还是商品新建过来的还是编辑修改的
const GradeSelect: FC<GradeSelectProps> = ({
  onChange,
  style,
  value,
  options,
  skuInfo,
  type,
  levelId,
}) => {
  const [gradeVisible, setGradeVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // const [originalData, setOriginData] = useState<LabelFilter[]>()

  // table的数据源
  const [tableList, setTableList] = useState<LabelFilter[]>([])

  // select的数据源
  const [selectData, setSelectData] = useState<LabelFilter[]>([])

  const { category_map, updateGrade, editSkuMap, setEditSkuMap } = store

  // 创建的store
  const { merchandise_selectedRow, updateSkuLevel } = createStore

  // 商品等级的select值
  const select = useMemo(() => {
    const res = _.some(options, (item) => item.value === value)
    return !res ? undefined : value
  }, [value, options])

  useEffect(() => {
    setSelectData(_.cloneDeep(options!).filter((i) => !i.is_delete))
  }, [options])

  useEffect(() => {
    setTableList(_.cloneDeep(options!).filter((i) => !i.is_delete))
    setSelectData(_.cloneDeep(options!).filter((i) => !i.is_delete))
  }, [gradeVisible])

  const handleActionGrade = () => {
    setGradeVisible(true)
  }

  const handleCancel = () => {
    setGradeVisible(false)
  }

  // 增加某个商品等级
  const handleAdd = () => {
    const tableData = tableList.filter((i) => !i.is_delete)
    if (tableData.length >= 10) {
      return message.error(t('最多只能有十个商品等级!'))
    }
    tableData.push({ ...initTableItem })

    setTableList(tableData.slice())
  }

  // 删除某个level_ids
  const handleDelete = async (level_id: string, spliceIndex: number) => {
    const tableData = _.cloneDeep(tableList.filter((i) => !i.is_delete))
    // const index = _.findIndex(
    //   tableData,
    //   (i: LabelFilter) => i.value === level_id,
    // )
    if (!level_id) {
      tableData.splice(spliceIndex, 1)
      setTableList(tableData)
    } else {
      // tableData[index].is_delete = true
      tableData.splice(spliceIndex, 1)
      setTableList(tableData)

      message.destroy()
      message.success(t('删除成功,点击确认才生效'))
    }
  }

  const handleChangeName = (index: number, value: string) => {
    tableList[index].label = value
    setTableList([...tableList])
  }

  // 处理参数--编辑
  const dealWithParams = (tableList: LabelFilter[]) => {
    // 参数在这里给吧,根据type的不同设置不同的参数
    const sku_level: Sku_SkuLevel[] = _.map(
      tableList.filter((i) => !i.is_delete),
      (item) => {
        return {
          name: _.trim(item.label),
          level_id: item.value || undefined,
          is_delete: item.is_delete || false,
        }
      },
    )

    let sku_id = ''
    if (type === 'client' || type === 'merchandise') {
      sku_id =
        _.filter(
          merchandise_selectedRow,
          (item) => item.sku_id === skuInfo?.sku_id,
        )?.[0]?.sku_id || ''
    }
    if (type === 'edit') {
      sku_id = editSkuMap.sku_id!
    }

    return {
      sku_id,
      sku_level,
    }
  }

  // 触发校验
  const verify = () => {
    const tableData = tableList.filter((i) => !i.is_delete)
    if (tableData.length === 0) {
      return false
    }
    if (_.some(tableData, (item) => item.label.trim() === '')) {
      return false
    }
    return true
  }

  const handleOk = async () => {
    // 商品等级不能为空
    if (!verify()) {
      return message.error(t('商品等级名称不能为空或重复且补全商品等级信息!'))
    }
    setLoading(true)
    // 处理参数
    const { sku_id, sku_level } = dealWithParams(tableList)

    // 操作数据在store里面去操作把 不然这里会写的很长 根据每个type不一样
    await updateGrade(sku_id, sku_level)
      .then((json) => {
        const { sku } = json.response

        if (type === 'client' || type === 'merchandise') {
          // 改变store里面的商品等级的数据源
          updateSkuLevel(skuInfo?.sku_id!, sku!)
          // resetListFn(level_id)
        }
        if (type === 'edit') {
          setEditSkuMap(sku!)
        }

        message.success(t('编辑成功!'))
        handleCancel()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const columns: TableColumnProps<LabelFilter>[] = [
    {
      title: '',
      key: 'index',
      width: 50,
      align: 'center',
      dataIndex: 'index',
      render: (__, ____, index) => <>{index + 1}</>,
    },
    {
      title: t('商品等级'),
      key: 'label',
      dataIndex: 'label',
      render: (__, record, index) => (
        // <Form.Item name={['grade_list', index, 'label']}>
        <Input
          maxLength={15}
          value={record.label}
          onChange={(e) => handleChangeName(index, e.target.value)}
          style={{ width: '320px' }}
          placeholder={t('请输入商品等级')}
        />
        // </Form.Item>
      ),
    },
    {
      title: t('操作'),
      key: 'action',
      width: 120,
      dataIndex: 'action',
      align: 'center',
      render: (__, record, index) => {
        const notDelete = type === 'edit' && record.value === levelId
        return (
          !notDelete && (
            <a type='default' onClick={() => handleDelete(record.value, index)}>
              {t('删除')}
            </a>
          )
        )
      },
    },
  ]

  return (
    <>
      <Select
        value={select || undefined}
        placeholder={t('请输入商品等级')}
        dropdownRender={(menu) => (
          <>
            {menu}
            <div className='tw-mb-1' />
            <Flex
              onClick={handleActionGrade}
              className='tw-h-7 tw-cursor-pointer tw-text-sm'
              justifyCenter
              alignCenter
            >
              <span style={{ color: '#0363FF' }}>{t('管理该商品的等级')}</span>
            </Flex>
          </>
        )}
        onChange={onChange}
        showSearch
        allowClear
        style={style}
        // options={tableList}
        options={selectData.slice()}
        optionFilterProp='label'
      />
      <Modal
        className='grade-components'
        title={t('管理商品等级')}
        onCancel={handleCancel}
        onOk={handleOk}
        confirmLoading={loading}
        width={688}
        visible={gradeVisible}
      >
        <Flex className='grade-header'>
          <Flex className='tw-my-2 tw-box-border'>
            <ProductImage
              url={skuInfo?.repeated_field?.images?.[0]?.path || ''}
              style={{ width: '64px', height: '64px', maxWidth: '64px' }}
            />

            <Flex className='tw-h-full tw-ml-2' column justifyBetween>
              <span
                className='tw-text-base tw-font-bold'
                style={{ color: '#000' }}
              >
                {t(skuInfo?.name! || '-')}
              </span>
              <span className='tw-text-sm tw-font-normal'>
                {t(
                  getCategoryName(category_map, skuInfo?.category_id!) ||
                    '暂无分类',
                )}
              </span>
            </Flex>
          </Flex>
        </Flex>

        <Table
          className='grade-body'
          columns={columns}
          pagination={false}
          dataSource={tableList.filter((i) => !i.is_delete)}
        />

        <Flex
          className='grade-footer tw-h-5 tw-w-full tw-mt-1 tw-cursor-pointer'
          style={{
            color: '#176CFE',
            position: 'sticky',
            bottom: 0,
            background: '#fff',
          }}
          alignCenter
          onClick={handleAdd}
        >
          <PlusCircleOutlined className='tw-mr-1' />
          {t('增加一行')}
        </Flex>
      </Modal>
    </>
  )
}
export default observer(GradeSelect)
