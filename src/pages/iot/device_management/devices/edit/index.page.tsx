import React from 'react'
import { useGMLocation } from '@gm-common/router'
import Detail from '../components/detail'

const DeviceEditPage = () => {
  const { device_id } = useGMLocation<{
    device_id: string
  }>().query
  return <Detail isEdit deviceId={device_id} />
}

export default DeviceEditPage
