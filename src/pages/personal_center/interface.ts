export interface InitPassword {
  /** 旧密码 */
  origin_password: string
  /** 新密码 */
  password: string
  /** 再一次输入新密码 */
  rePassword: string
}

export interface PersonalCenterGroupUser {
  /** 姓名 */
  name: string
  /** 手机 */
  phone: string | undefined
  /** 登录账号 */
  username: string | undefined
}

export interface WechatUserInfo {
  wechat_openid: string // openId
  wechat_unionid: string // 如wechat_unionid为空,说明当前账号未绑定微信
  wechat_nickname: string // 微信昵称
  wechat_avatar: string // 微信头像链接
  account_id: string
}
