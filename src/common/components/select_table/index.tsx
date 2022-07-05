/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  Key,
} from 'react'
import { message, Table, PaginationProps, Row, Col } from 'antd'
import SelectBox from './select_box'
import { formatParamsForPagination } from '@/common/util'
import { PagingParams } from 'gm_api/src/common'
import { SelectTableProps, SelectTableRef } from './interface'
import Filter, { FilterRef } from './filter'
import { TableContext } from './constants'
import { t } from 'gm-i18n'
import { PAGE_SIZE_OPTIONS } from '@/common/constants'
import _ from 'lodash'
const defaultPagination = { limit: 10, need_count: true, offset: 0 }

/**
 * 选择Table组件，默认支持跨页
 */
const SelectTable = <T extends object, R = any>(
  props: SelectTableProps<T, R>,
) => {
  const {
    rowKey,
    onSearch,
    onSelect,
    columns,
    extraKey,
    defaultSelectedRows = [],
    defaultSelectedRowKeys = [],
    disabledList = [],
    tableRef,
    filter,
    style,
    hideSelectAll,
    selectedKey,
    limitCount,
    selectCountWarning,
    type = 'Checkbox',
    FilterComponent,
    ...restProps
  } = props

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    defaultSelectedRowKeys,
  )
  const [selectedRows, setSelectedRows] = useState<T[]>(defaultSelectedRows)
  const [list, setList] = useState<T[]>([])

  const [count, setCount] = useState(0)

  const [paging, setPaging] = useState({ current: 1, pageSize: 10 })

  const [loading, setLoading] = useState(false)

  const paginationRef = useRef<PagingParams>(defaultPagination)
  const filterRef = useRef<FilterRef>(null)

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    if (defaultSelectedRowKeys.length || defaultSelectedRows.length) {
      setSelectedRowKeys(defaultSelectedRowKeys)
      setSelectedRows(defaultSelectedRows)
    }
  }, [defaultSelectedRowKeys, defaultSelectedRows])

  useImperativeHandle(tableRef, () => ({
    selectedRowKeys,
    selectedRows,
  }))

  /**
   *
   * @param params filter 参数
   * @param isResetCurrent 重置为第一页 写的时候不了解table 分页的业务，这里埋坑
   * @returns
   */
  const fetchList = (params?: R, isResetCurrent?: boolean) => {
    if (typeof onSearch !== 'function') return
    if (isResetCurrent) {
      setPaging({ pageSize: paginationRef.current.limit, current: 1 })
      paginationRef.current.offset = 0
    }
    setLoading(true)
    onSearch(paginationRef.current, params)
      .then((res) => {
        setList(res.list)
        /** 后台只有在请求第一页的时候才会返回count，业务需要 */
        if (paginationRef.current.offset === 0) setCount(Number(res.count))
      })
      .finally(() => setLoading(false))
  }

  /**
   * 清空已选择
   */
  const handleClear = () => {
    setSelectedRowKeys([])
    setSelectedRows([])
    handleSelect([], [])
  }

  const handleSelect = (rowKeys: Key[], rows: T[]) => {
    if (typeof onSelect === 'function') {
      onSelect(rowKeys, rows)
    }
  }

  const handleClose = (id: T[keyof T]) => {
    if (!id) return
    setSelectedRows(selectedRows.filter((f) => f[rowKey] !== id))
    setSelectedRowKeys(selectedRowKeys.filter((f: any) => f !== id))
    handleSelect(
      selectedRowKeys.filter((f: any) => f !== id),
      selectedRows.filter((f) => f[rowKey] !== id),
    )
  }

  /**
   * 行内的配置项
   */
  const rowSelection = {
    onChange: (rowKeys: Key[], rows: T[]) => {
      handleLimitCount(rowKeys, rows.filter(Boolean))
    },
    type,
    hideSelectAll,
    /** 已经选择的Key */
    selectedRowKeys,
    /** 跨页用 */
    preserveSelectedRowKeys: true,
    /** 勾选框逻辑 */
    getCheckboxProps: (record: any) => ({
      disabled: !!disabledList.find((f) => f === record[rowKey]),
    }),
  }

  /**
   * 页码器相关
   */
  const pagination: PaginationProps = {
    current: paging.current,
    pageSize: paging.pageSize,
    total: count,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onChange: (page, pageSize) => {
      setPaging({ current: page, pageSize })
      const pageInfo = formatParamsForPagination(page, pageSize)
      const isResetCurrent = pageSize !== paging.pageSize
      paginationRef.current = {
        ...pageInfo,
        // 页码容量改变的时候重置offset
        offset: isResetCurrent ? 0 : pageInfo.offset,
      }
      filterRef.current && filterRef.current?.onFinish(isResetCurrent)
    },
    showTotal: (total) => `共${total}条记录`,
  }

  /**
   * 限制选择条数逻辑
   */
  const handleLimitCount = (rowKeys: Key[], rows: T[]) => {
    if (typeof limitCount === 'number' && limitCount >= 0) {
      const diffCount = rowKeys.length - limitCount
      if (diffCount > 0) {
        const tips = selectCountWarning || `单次仅支持添加${limitCount}条数据`
        message.warning(t(tips))
        setSelectedRowKeys(rowKeys.slice(0, limitCount))
        setSelectedRows(rows.slice(0, limitCount))

        handleSelect(rowKeys.slice(0, limitCount), rows.slice(0, limitCount))
        return
      }
    }
    setSelectedRowKeys(rowKeys)
    setSelectedRows(rows)
    handleSelect(rowKeys, rows)
  }

  /**
   * 用于 SelectBox 括号 中的内容
   */
  const extraName = columns.find((f) => f.dataIndex === extraKey)?.title
  return (
    <div className='merchandise-select-table antd-popup-parent' style={style}>
      <TableContext.Provider value={{ fetchList }}>
        <Row>
          <Col span={18}>
            <div className='merchandise-search-table '>
              {FilterComponent && (
                <FilterComponent ref={filterRef} fetchList={fetchList} />
              )}
              {filter && <Filter ref={filterRef} filter={filter!} />}
              <Table<T>
                {...restProps}
                loading={loading}
                rowKey={rowKey}
                bordered
                columns={columns}
                dataSource={list}
                size='small'
                scroll={{ y: 400 }}
                rowSelection={rowSelection}
                pagination={pagination}
              />
            </div>
          </Col>
          <Col span={6}>
            <SelectBox<T>
              rowKey={rowKey}
              selectedKey={selectedKey || rowKey}
              extraKey={extraKey}
              extraName={extraName}
              selectedRows={selectedRows}
              disabledList={disabledList}
              handleClear={handleClear}
              handleClose={handleClose}
            />
          </Col>
        </Row>
      </TableContext.Provider>
    </div>
  )
}

type Pagination = PagingParams

export type { SelectTableRef, Pagination }
export default SelectTable
