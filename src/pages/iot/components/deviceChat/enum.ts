import { DeviceData_DataType } from 'gm_api/src/device'

const dataTypeEnum: { [key: string]: DeviceData_DataType } = {
  temperature: DeviceData_DataType.DATATYPE_TEMPERATURE,
  humidity: DeviceData_DataType.DATATYPE_HUMIDITY,
}

export { dataTypeEnum }
