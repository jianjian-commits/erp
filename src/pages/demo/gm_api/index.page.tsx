import React, { useState } from 'react'
import {
  list_Status_Code,
  map_Status_Code,
  Status_Code,
} from 'gm_api/src/common'
import { Select_Status_Code, Map_Status_Code } from 'gm_api/src/common/pc'
import {
  MoreSelect_Quotation,
  MoreSelect_Sku,
  Select_Quotation,
} from 'gm_api/src/merchandise/pc'
import {
  MapId_ServicePeriod,
  Select_ServicePeriod,
} from 'gm_api/src/enterprise/pc'
import _ from 'lodash'

const Demo = () => {
  const [value, setValue] = useState<any>(undefined)
  const [selected, setSelected] = useState<any>(undefined)
  const [oSelected, setOSelected] = useState([])
  const [skuSelected, setSkuSelected] = useState<any>(undefined)
  return (
    <div>
      <h1>枚举</h1>
      <h2>Select_XXX 只需关心 value 和 onChange，不同提供 data</h2>
      <span>
        StatusCode
        <Select_Status_Code
          value={value}
          onChange={(value: number) => {
            setValue(value)
          }}
        />
      </span>
      <span>
        enumFilter arr
        <Select_Status_Code
          value={value}
          onChange={(value: number) => {
            setValue(value)
          }}
          enumFilter={[Status_Code.ABORTED]}
        />
      </span>
      <span>
        enumFilter func
        <Select_Status_Code
          value={value}
          onChange={(value: number) => {
            setValue(value)
          }}
          enumFilter={(data) =>
            _.filter(data, ({ value }) =>
              [Status_Code.ABORTED, Status_Code.CANCELED].includes(value),
            )
          }
        />
      </span>
      <h2>Map_XXX 提供 value 即可</h2>
      <Map_Status_Code value={Status_Code.ABORTED} />
      <hr />
      <h1>列表</h1>
      <h2>Select_XXX</h2>
      <span>运营时间</span>
      <Select_ServicePeriod
        value={value}
        onChange={(value) => {
          setValue(value)
        }}
      />
      <span>报价单</span>
      <Select_Quotation
        value={value}
        onChange={(value) => {
          setValue(value)
        }}
        renderItem={(item) => item.inner_name}
        getName={(item) => item.inner_name || ''}
      />
      <h2>MoreSelect_XXX</h2>
      <span style={{ width: '200px', display: 'inline-block' }}>
        单选 报价单
        <MoreSelect_Quotation
          selected={selected}
          onSelect={(selected) => setSelected(selected)}
          getName={(item) => item.inner_name || ''}
        />
      </span>
      <span style={{ width: '200px', display: 'inline-block' }}>
        多选 报价单
        <MoreSelect_Quotation
          multiple
          selected={oSelected}
          onSelect={(selected) => {
            setOSelected(selected)
          }}
          getName={(item) => item.inner_name || ''}
        />
      </span>
      <span style={{ width: '200px', display: 'inline-block' }}>
        单选搜索 报价单
        <MoreSelect_Quotation
          isSearch
          selected={selected}
          onSelect={(selected) => setSelected(selected)}
          getName={(item) => item.inner_name || ''}
        />
      </span>
      <div>
        单选搜索 Sku
        <span style={{ width: '200px', display: 'inline-block' }}>
          <MoreSelect_Sku
            isSearch
            selected={skuSelected}
            onSelect={(selected) => setSkuSelected(selected)}
            getResponseData={(res) => _.map(res.sku_infos, (v) => v.sku)}
            renderListFilter={(data) => data}
          />
        </span>
      </div>
      <hr />
      <h1>映射</h1>
      <h2>MapId_XXX</h2>
      <span>运营时间</span>
      <MapId_ServicePeriod id='325443626282778653' />
      <hr />
      <h1>枚举数据</h1>
      <h2>list_XXX map_XXX 怎么用，还没接触业务接触，场景还没清晰</h2>
      <pre>{JSON.stringify(list_Status_Code, null, 2)}</pre>
      <pre>{JSON.stringify(map_Status_Code, null, 2)}</pre>
    </div>
  )
}

export default Demo
