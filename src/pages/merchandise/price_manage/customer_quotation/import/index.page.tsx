import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import { FolderAddOutlined } from '@ant-design/icons'
import ImportList, {
  ImportListInterface,
} from '@/common/components/import_list'

const PriceImport: FC = observer(() => {
  const location = useGMLocation<{ page: string; quotation_id: string }>()
  const { quotation_id } = location.query
  const ImportConfig: ImportListInterface = {
    list: [
      {
        icon: <FolderAddOutlined />,
        title: '批量导入商品销售信息',
        tips: '适用于在报价单中批量导入商品的销售信息。',
        page: 'price_add',
        quotation_id,
      },
    ],
  }
  return <ImportList {...ImportConfig} />
})

export default PriceImport
