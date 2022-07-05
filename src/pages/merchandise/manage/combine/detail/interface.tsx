import { BulkUpdateBasicPriceV2Request } from 'gm_api/src/merchandise'

interface Query {
  sku_id: string
  unit_id: string
  ssu_id?: string
  name: string
}
interface DetailModalRef {
  openModal: (params: boolean) => void
}
interface DataType {
  key: React.Key
  id: string
  quotation: string
  name: string
  value: number
  count: number
  status: number
}
interface QuotaionProps {
  handleVerify: () => Promise<any>
}

interface BatchParmas extends BulkUpdateBasicPriceV2Request {
  isAll: boolean
}

export type { Query, DetailModalRef, DataType, QuotaionProps, BatchParmas }
