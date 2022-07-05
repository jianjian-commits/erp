import { makeAutoObservable } from 'mobx'
import {
  PrintingTemplate,
  ListPrintingTemplate,
  DeletePrintingTemplate,
  PrintingTemplate_Type,
  UpdatePrintingTemplate,
} from 'gm_api/src/preference'

class Store {
  printing_templete_list: PrintingTemplate[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getTemplateList() {
    return ListPrintingTemplate({
      type: PrintingTemplate_Type.TYPE_BOX,
      paging: {
        limit: 999,
      },
    }).then(({ response }) => {
      this.printing_templete_list = response.printing_templates
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
