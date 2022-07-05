import { observable, action, makeAutoObservable } from 'mobx'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
  PrintingTemplate,
  DeletePrintingTemplate,
  UpdatePrintingTemplate,
} from 'gm_api/src/preference'

class Store {
  list: PrintingTemplate[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getTemplateList() {
    return ListPrintingTemplate({
      type: PrintingTemplate_Type.TYPE_INNER_LABEL,
      paging: {
        limit: 999,
      },
    }).then(({ response }) => {
      this.list = response.printing_templates
      return response
    })
  }

  deleteTemplate(printing_template_id: string) {
    return DeletePrintingTemplate({
      printing_template_id,
    })
  }

  updateTemplate(printing_template: PrintingTemplate) {
    return UpdatePrintingTemplate({
      printing_template,
    })
  }
}

export default new Store()
