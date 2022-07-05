import { makeAutoObservable, runInAction } from 'mobx'
import { Request } from '@gm-common/x-request'
import { MP, MPTYPES, HOST } from './constants'
import _ from 'lodash'
import axios from 'axios'

const initPayInfo = {
  type: 2,
  mpType: 1,
  appid: '',
  appsecret: '',
  merchant_id: '',
  pay_key: '',
  api_cert_name: '',
  api_key_name: '',
  checked: false,
}

class Store {
  payInfo = initPayInfo
  mpType = MPTYPES.bshop
  bshop: any = null

  audit = {
    auditid: '',
    status: -1, // 0:审核成功 1审核被拒绝 2审核中 3已撤回
    reason: '',
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setPayInfo<T extends keyof typeof initPayInfo>(
    key: T,
    value: typeof initPayInfo[T],
  ) {
    runInAction(() => {
      this.payInfo[key] = value
    })
  }

  updatePayInfo() {
    const {
      mpType,
      appid,
      appsecret,
      merchant_id,
      pay_key,
      api_cert_name,
      api_key_name,
    } = this.payInfo
    const params = {
      mp_type: _.findKey(MP, (v) => v === mpType),
      appid,
      appsecret,
      merchant_id,
      pay_key,
      api_cert_name,
      api_key_name,
    }
    return Request('/station/pay_info/update').data(params).run()
  }

  async getInfo() {
    const url = `${HOST}/mp_third_party/authorizer/info?origin=erp`
    const res = await axios({
      method: 'get',
      url,
      params: {
        type: MPTYPES.bshop,
      },
    })
    const {
      data: { data },
    } = res
    const { cshop: bshop } = data
    this.bshop = bshop
    return bshop
  }

  async getLatestAuditStatus(authorizer_app_id: string) {
    const url = `${HOST}/mp_third_party/code/latest_audit_status?origin=erp`
    const res = await axios({
      method: 'get',
      url,
      params: {
        authorizer_app_id,
      },
    })
    const {
      data: { data },
    } = res
    this.audit = data
  }

  async codeUpload() {
    const url = `${HOST}/mp_third_party/code/upload?origin=erp`
    const res = await axios({
      method: 'post',
      url,
      data: {
        authorizer_app_id: this.bshop?.authorizer_app_id,
      },
    })
    return res
  }

  async submitAudit() {
    const url = `${HOST}/mp_third_party/code/submit_audit?origin=erp`
    const res = await axios({
      method: 'post',
      url,
      data: {
        type: this.mpType,
        authorizer_app_id: this.bshop?.authorizer_app_id,
      },
    })
    return res
  }

  uploadCertificateFile(type: number, file: File) {
    return Request('/station/certificate_file/upload')
      .data({
        cart_type: type,
        certificate_file: file,
      })
      .run()
  }
}

export default new Store()
