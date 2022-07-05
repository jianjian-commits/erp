import { ListRelationCustomer } from 'gm_api/src/production'
import _ from 'lodash'

/**
 * 关联商户标签页的Store
 */
class RelatedMerchantStore {
  /**
   * 获取关联商户
   * @param  {string}              bomId BOM的ID
   * @return {Promise<Customer[]>}       包含商户的请求
   */
  getRelatedCustomers(bomId: string) {
    const response = ListRelationCustomer({
      bom_id: bomId,
      paging: {
        limit: 999,
      },
    }).then((response) => {
      return (
        _.filter(response.response.relation_customers, (v) => v.level === 1) ||
        []
      )
    })

    return response
  }
}

export default new RelatedMerchantStore()
