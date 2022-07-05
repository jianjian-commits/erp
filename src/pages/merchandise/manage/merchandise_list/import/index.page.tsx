import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { FolderAddOutlined } from '@ant-design/icons'
import ImportList, {
  ImportListInterface,
} from '@/common/components/import_list'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const MerchandiseImport: FC = observer(() => {
  const ImportConfig: ImportListInterface = {
    list: [
      {
        icon: <FolderAddOutlined />,
        title: '批量新增商品',
        tips: '适用于批量新增商品基础信息，导入新增商品数据后可再单个修改、补充具体商品信息。',
        page: 'merchandise_add',
        isHide: !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_CREATE_NOT_PACKAGE_SKU_SSU,
        ),
      },
      {
        icon: (
          <i
            className='iconfont icon-common-import-edit'
            style={{ fontSize: 50 }}
          />
        ),

        title: '批量修改商品',
        tips: '适用于批量修改报价单中现有的商品销售信息，只需填写要更新的字段内容。',
        page: 'merchandise_edit',
        isHide: !globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_UPDATE_NOT_PACKAGE_SKU_SSU,
        ),
      },
    ],
  }
  return <ImportList {...ImportConfig} />
})

export default MerchandiseImport
