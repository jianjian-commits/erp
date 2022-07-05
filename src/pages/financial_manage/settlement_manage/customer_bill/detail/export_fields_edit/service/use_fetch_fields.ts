import { useCallback, useRef } from 'react'
import _ from 'lodash'
import {
  GetOrderExportSettings,
  OrderExportSettings,
  OrderExportSettings_Field,
  OrderExportSettings_Fields,
  OrderExportSettings_Type,
} from 'gm_api/src/preference'
import { FetcherParams, DataShape } from '@/common/components/field_selector'

import { Fields } from '@/common/components/field_selector/field_selector/interface'

type RawDataOfField = Partial<
  Record<OrderExportSettings_Type, OrderExportSettings | undefined>
>

type GetFieldsFn = (
  params: FetcherParams<OrderExportSettings_Type>,
) => Promise<DataShape<OrderExportSettings_Field>>

export default function useFetchFields() {
  const rawData = useRef<RawDataOfField>({})

  const fetchFields: GetFieldsFn = useCallback(async (params) => {
    try {
      const { response } = await GetOrderExportSettings({
        type: params.id,
      })
      rawData.current = {
        ...rawData.current,
        [params.id]: response.order_export_settings,
      }
      const prefix: Fields<OrderExportSettings_Field>[] = []
      const suffix: Fields<OrderExportSettings_Field>[] = []
      _.forOwn(
        response.special_fields,
        (item: OrderExportSettings_Fields, label) => {
          // 若有“套账关键字”，则把数据放在最后
          if (label.indexOf('套账') > -1) {
            suffix.push({ label, children: item.fields || [] })
          } else {
            prefix.push({ label, children: item.fields || [] })
          }
        },
      )
      return {
        list: [...prefix, ...suffix],
        selected: response.order_export_settings.fields?.fields || [],
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }, [])

  const getRawData = useCallback((id: OrderExportSettings_Type) => {
    return rawData.current![id]
  }, [])

  return { fetchFields, getRawData }
}
