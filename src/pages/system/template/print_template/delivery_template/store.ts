import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { ListCustomer } from 'gm_api/src/enterprise'
import {
  UpdatePrintingTemplateRelation,
  GetPrintingTemplateRelation,
  Status_Code,
} from 'gm_api/src/preference'
import { Tip, TreeListItem } from '@gm-pc/react'

class Store {
  customer_ids: string[] | undefined = []
  sku_ids_relation: string[] | undefined = []
  allCustomerLists: TreeListItem[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getCustomerList(level: number) {
    const params = {
      paging: { limit: 999 },
      level: 1, // 1公司 2商户
      need_quotations: false,
      need_group_users: false,
      need_service_periods: false,
      need_deleted: false,
      need_customer_label: false,
      need_child_customers: level !== 1,
      need_parent_customers: true,
      need_customer_relation_group: true,
      need_menus: false,
    }
    ListCustomer(params).then((json) => {
      const { customers, child_customer_relation, child_customers } =
        json.response
      runInAction(() => {
        this.allCustomerLists = _.map(customers, (customer) => {
          const relation_children =
            child_customer_relation?.[customer?.customer_id]?.values
          const _temp_customer_child = _.map(
            relation_children,
            (customer_id) => {
              const _customer = child_customers?.[customer_id]
              return {
                ..._customer,
                value: _customer?.customer_id,
                text: _customer?.name,
              }
            },
          )
          const customer_child =
            _temp_customer_child?.length === 0 ? null : _temp_customer_child
          return {
            ...customer,
            text: customer?.name,
            value: customer?.customer_id,
            children: level === 2 ? customer_child : null,
          }
        })
      })
      return json.response
    })
  }

  async getPrintingRelation(templateId: string) {
    GetPrintingTemplateRelation({
      printing_template_id: templateId,
    }).then(({ response }) => {
      runInAction(() => {
        this.customer_ids = response?.customer_ids
        this.sku_ids_relation = response?.sku_ids
      })
      return response
    })
  }

  updatePrintingRelation(templateId: string) {
    const { customer_ids } = this
    const params = {
      printing_template_id: templateId,
      customer_ids: customer_ids,
      // sku_ids: [],  // 账户配置
    }
    UpdatePrintingTemplateRelation(params, [
      Status_Code.PRINTING_TEMPLATE_RELATION_DUPLICATE,
    ]).then((res) => {
      if (res.code === Status_Code.PRINTING_TEMPLATE_RELATION_DUPLICATE) {
        Tip.danger(t('打印模板绑定关系重复'))
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(res)
      }
      return res
    })
  }

  setSelectValues = (selectedValues: string[]) => {
    runInAction(() => {
      this.customer_ids = selectedValues
    })
  }
}

export default new Store()
