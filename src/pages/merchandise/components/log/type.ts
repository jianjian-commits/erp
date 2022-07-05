import { LogModelType } from 'gm_api/src/logsystem'

export interface MerchandiseLogItem {
  log_model_type?: LogModelType
  log_model_types?: LogModelType[]
  operationTypeList: { label: string; value: string }[]
}
