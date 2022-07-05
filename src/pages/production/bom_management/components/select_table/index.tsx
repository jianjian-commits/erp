/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  Key,
} from 'react'
import { message, Table, PaginationProps } from 'antd'
import SelectBox from './select_box'
import { formatParamsForPagination } from './util'
import { PagingParams } from 'gm_api/src/common'
import { SelectTableProps, SelectTableRef } from './interface'
import Filter, { FilterRef } from './filter'
import { TableContext } from './constants'
import { t } from 'gm-i18n'
import _ from 'lodash'

const defaultPagination = { limit: 10, need_count: true, offset: 0 }

// TODO 等商品重构合并的时候在使用公用的组件
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
    ...restProps
  } = props

  let [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    defaultSelectedRowKeys,
  )
  let [selectedRows, setSelectedRows] = useState<T[]>(defaultSelectedRows)
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
    setSelectedRowKeys(defaultSelectedRowKeys)
    setSelectedRows(defaultSelectedRows)
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
        const { list } = res
        setList(list)
        /** 后台只有在请求第一页的时候才会返回count，业务需要 */
        if (paginationRef.current.offset === 0) setCount(Number(res.count))
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
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
    onSelect: (record: T, selected: boolean) => {
      const key = record[rowKey] as any
      if (selected) {
        selectedRows.push(record)
        selectedRowKeys.push(key)
      } else {
        const keyIndex = selectedRowKeys.findIndex((f) => f === key)
        const rowIndex = selectedRows.findIndex((f) => f === key)
        selectedRowKeys.splice(keyIndex, 1)
        selectedRows.splice(rowIndex, 1)
      }
      setSelectedRows([...selectedRows].filter(Boolean))
      setSelectedRowKeys([...selectedRowKeys].filter(Boolean))
    },
    onSelectAll: (selected: boolean, __: T[], changeRows: T[]) => {
      if (selected) {
        const rowKeys = changeRows.map((item) => item[rowKey]) as any
        selectedRows = [...selectedRows, ...changeRows]
        selectedRowKeys = [...selectedRowKeys, ...rowKeys]
      } else {
        const list = _.differenceWith(selectedRows, changeRows, _.isEqual)
        selectedRows = list
        selectedRowKeys = list.map((item) => item[rowKey]) as any
      }

      setSelectedRows([...selectedRows].filter(Boolean))
      setSelectedRowKeys([...selectedRowKeys].filter(Boolean))
    },
    defaultSelectedRowKeys: selectedRowKeys,
    hideSelectAll,
    /** 已经选择的Key */
    selectedRowKeys,
    /** 跨页用 */
    // preserveSelectedRowKeys: true,
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
    pageSizeOptions: ['10', '20', '50'],
    onChange: (page, pageSize) => {
      setPaging({ current: page, pageSize: pageSize! })
      const pageInfo = formatParamsForPagination(page, pageSize)
      const isResetCurrent = pageSize !== paging.pageSize
      paginationRef.current = {
        ...pageInfo,
        // 页码容量改变的时候重置offset
        offset: isResetCurrent ? 0 : pageInfo.offset,
      }
      filterRef.current && filterRef.current.onFinish(isResetCurrent)
    },
    showTotal: (total) => `共${total}条记录`,
  }

  /**
   * 用于 SelectBox 括号 中的内容
   */
  const extraName = columns.find((f) => f.dataIndex === extraKey)?.title

  return (
    <div className='merchandise-select-table' style={style}>
      <TableContext.Provider value={{ fetchList }}>
        <div className='merchandise-search-table '>
          {filter && <Filter ref={filterRef} filter={filter} />}
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
      </TableContext.Provider>
    </div>
  )
}

type Pagination = PagingParams

export type { SelectTableRef, Pagination }
export default SelectTable
