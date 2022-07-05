import _ from 'lodash'
import { useState } from 'react'
import { AnyObject, ValueInObject } from '../interface'
import { FieldStateInstance } from '../field-store/interface'
import FieldStore from '../field-store'

function useFieldState<
  RawData extends AnyObject = any,
  TabId = any,
  RawDataKey extends ValueInObject<RawData> = any,
>(initial?: FieldStateInstance<RawData, TabId, RawDataKey>) {
  const [instance] = useState(() => {
    if (_.isNil(initial)) {
      return new FieldStore<
        RawData,
        TabId,
        RawDataKey
      >().getInstance() as FieldStateInstance<RawData, TabId, RawDataKey>
    }
    return initial as FieldStateInstance<RawData, TabId, RawDataKey>
  })
  return [instance] as const
}

export default useFieldState
