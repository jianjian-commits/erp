import React from 'react'
import globalStore from '@/stores/global'
import ErpLogin from './erp_login'
import LiteLogin from './lite_login'

const Login = () => {
  return globalStore.isLite ? <LiteLogin /> : <ErpLogin />
}

export default Login
