// 工序详情相关
interface ProcessBaseData {
  name: string
  customized_code?: string
  process_type_id: string
  description?: string
  create_time?: string
  delete_time?: string
  group_id?: string
  process_template_id?: string
  station_id?: string
  status?: string
  update_time?: string
  latest_attr_id: string
}

interface ProcessGuideTypeValues {
  desc: string
}

export type { ProcessBaseData, ProcessGuideTypeValues }
