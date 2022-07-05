import React from 'react'
import { DataCategoryTree } from '@gm-pc/business'

const Page = () => {
  return (
    <div>
      <DataCategoryTree
        onReady={(data) => {
          console.log(data)
        }}
        onActiveValue={(value, item) => {
          console.log(value, item)
        }}
      />
    </div>
  )
}

export default Page
