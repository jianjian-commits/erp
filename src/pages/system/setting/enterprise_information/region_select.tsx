import React, { FC, useEffect, useState } from 'react'
import { Select, Flex, SessionStorage } from '@gm-pc/react'
import { ListCity } from 'gm_api/src/enterprise'

interface RegionSelectType {
  provinceValue?: string
  cityValue?: string
  provinceData: { text: string; value: string }[]
  onProvinceChange: (value: string) => void
  onCityChange: (value: string) => void
}

interface SelectDataType {
  text: string
  value: string
}

const RegionSelect: FC<RegionSelectType> = ({
  provinceValue = '11', // 默认北京市
  cityValue = '',
  provinceData,
  onProvinceChange,
  onCityChange,
}) => {
  const [cityData, setCityData] = useState<SelectDataType[]>([])

  const getCityDataByProvince = (provinceValue: string) => {
    return ListCity({ province_ids: [provinceValue] }).then((res) => {
      const cities = res.response.cities
      const arr: SelectDataType[] = cities.map((city) => {
        return {
          text: city.local_name,
          value: city.city_id,
        }
      })
      return arr
    })
  }

  const getCityDataByStorage = (provinceValue: string): SelectDataType[] => {
    const dict = SessionStorage.get('region_select_dict') || {}
    return dict[provinceValue] || []
  }

  const setCityDataIntoStorage = (
    provinceValue: string,
    data: SelectDataType[],
  ): void => {
    const dict = SessionStorage.get('region_select_dict') || {}
    dict[provinceValue] = data
    SessionStorage.set('region_select_dict', dict)
  }

  useEffect(() => {
    const arr = getCityDataByStorage(provinceValue)
    if (arr.length > 0) {
      setCityData(arr)
    } else {
      getCityDataByProvince(provinceValue).then((value) => {
        setCityData(value)
        return setCityDataIntoStorage(provinceValue, value)
      })
    }
  }, [provinceValue])

  const handleCityChange = (value: string) => {
    onCityChange(value)
  }
  return (
    <Flex>
      <Select
        className='tw-w-40 tw-mr-3'
        value={provinceValue}
        data={provinceData}
        onChange={onProvinceChange}
      />
      <Select
        className='tw-w-40 tw-mr-3'
        value={cityValue}
        data={cityData}
        onChange={handleCityChange}
      />
    </Flex>
  )
}

export default RegionSelect
