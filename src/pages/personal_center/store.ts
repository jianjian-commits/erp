import { processPassword } from '@/common/service'
import {
  GetGroupUser,
  UpdateGroupUserPassword,
  UpdateGroupUser,
  GroupUser,
  GroupUser_Type,
} from 'gm_api/src/enterprise'
import { makeAutoObservable } from 'mobx'
import {
  InitPassword,
  PersonalCenterGroupUser,
  WechatUserInfo,
} from './interface'
import { t } from 'gm-i18n'
import { gmHistory } from '@gm-common/router'
import { message } from 'antd'
import globalStore from '@/stores/global'
import _, { bind } from 'lodash'
import { GetUserInfo } from 'gm_api/src/oauth'
import {
  Account,
  BindWechatToAccount,
  BindWechatToAccountRequest,
  BindWechatToAccountRequest_Operation,
} from 'gm_api/src/account'
import { handleLogOut } from '@/common/util'

const initPassword: InitPassword = {
  origin_password: '',
  password: '',
  rePassword: '',
}

const initPersonalCenterGroupUse: PersonalCenterGroupUser = {
  name: '',
  phone: '',
  username: '',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  passwordObj: InitPassword = { ...initPassword }

  isModalVisible = false

  loading = false
  personalCenterGroupUser: PersonalCenterGroupUser = {
    ...initPersonalCenterGroupUse,
  }

  groupUser: GroupUser = {
    group_user_id: '',
    name: '',
    type: GroupUser_Type.NORMAL,
  }

  wechatUserInfo: WechatUserInfo = {
    wechat_openid: '', // openId
    wechat_unionid: '', // 如wechat_unionid为空,说明当前账号未绑定微信
    wechat_nickname: '', // 微信昵称
    wechat_avatar: '', // 微信头像链接
    account_id: '',
  }

  initStore() {
    this.passwordObj = { ...initPassword }
    this.isModalVisible = false
  }

  getGroupUser() {
    const group_user_id = _.get(
      globalStore,
      'userInfo.group_user.group_user_id',
      '',
    )
    return GetGroupUser({ group_user_id }).then((res) => {
      const group_user = res.response.group_user
      this.groupUser = group_user
      const { name, phone, username } = group_user
      this.personalCenterGroupUser = { name, phone, username }
      return res.response
    })
  }

  updateFromInfo<T extends keyof PersonalCenterGroupUser>(
    key: T,
    value: PersonalCenterGroupUser[T],
  ) {
    this.personalCenterGroupUser[key] = value
  }

  updateGroupUser() {
    const { name, phone } = this.personalCenterGroupUser
    const group_user = {
      ...this.groupUser,
      name,
      phone,
    }
    return UpdateGroupUser({ group_user }).then((res) => {
      return res.response
    })
  }

  getUserInfo() {
    return GetUserInfo().then((res) => {
      const {
        wechat_openid = '',
        wechat_unionid = '',
        wechat_nickname = '',
        wechat_avatar = '',
      } = res.response.user_info.account as Account
      this.wechatUserInfo = {
        wechat_openid,
        wechat_unionid,
        wechat_nickname,
        wechat_avatar,
        account_id: res.response.user_info.account_id || '',
      }
    })
  }

  setUserInfo(userInfo: WechatUserInfo) {
    this.wechatUserInfo = userInfo
  }

  handleWechatToAccount(
    type: 'bind' | 'unbind',
    appId: string,
    code: string,
    backUp: () => void,
  ) {
    const params: BindWechatToAccountRequest = {
      wechat_app_id: type === 'bind' ? appId : '',
      wechat_code: code,
      account_id: this.wechatUserInfo.account_id,
      operation:
        type === 'bind'
          ? BindWechatToAccountRequest_Operation.OPERATION_BIND
          : BindWechatToAccountRequest_Operation.OPERATION_UNBIND,
    }
    return BindWechatToAccount(params)
      .then((res) => {
        sessionStorage.removeItem('passport__wechatwork_verify_code')
        this.getUserInfo()
      })
      .catch((err) => {
        backUp()
        throw new Error(err)
      })
  }

  setIsModalVisible() {
    this.isModalVisible = !this.isModalVisible
  }

  // 修改密码
  handleSubmit = async (value: InitPassword) => {
    const { password, origin_password } = value
    this.loading = true
    await UpdateGroupUserPassword({
      account: {
        password: processPassword(password),
        origin_password: processPassword(origin_password),
      },
    })
      .then(() => {
        message.success(t('修改成功'))
        setTimeout(() => {
          handleLogOut()
          this.loading = false
        }, 1000)
      })
      .then(() => {
        message.success(t('修改成功'))
        setTimeout(() => {
          gmHistory.push('/login')
          this.loading = false
        }, 1000)
      })
      .finally(() => {
        this.loading = false
      })
  }
}
export default new Store()
