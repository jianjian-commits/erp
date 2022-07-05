import { ListBomOperationLog } from 'gm_api/src/production'

/**
 * 操作记录标签页的Store
 */
class OperationRecordStore {
  /**
   * 获取操作记录
   * @param  {string}                     bomId BOM的ID
   * @return {Promise<BomOperationLog[]>}       包含操作记录的请求
   */
  getOperationRecords(bomId: string) {
    const response = ListBomOperationLog({
      bom_id: bomId,
      paging: {
        limit: 999,
      },
    }).then((response) => {
      return response.response.bom_operation_logs
    })

    return response
  }
}

export default new OperationRecordStore()
