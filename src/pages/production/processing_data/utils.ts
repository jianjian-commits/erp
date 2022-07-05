import {
  ListProcessType,
  ListProcessTemplate,
  ListProcessTemplateRequest,
} from 'gm_api/src/production'

export const getProcessTypeList = () => {
  return ListProcessType({ paging: { limit: 999 } }).then((json) => {
    return json.response.process_types!.map((v) => ({
      ...v,
      value: v.process_type_id!,
      text: v.name!,
    }))
  })
}

export const getProcesses = (params: ListProcessTemplateRequest) => {
  return ListProcessTemplate({
    ...params,
  }).then((json) => {
    return json.response.process_templates || []
  })
}
