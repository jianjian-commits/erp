// import React, { FC } from 'react'

// import store from '../stores/receipt_store'

// import { TurnoverTable } from '@/pages/sales_invoicing/components'
// import { BoxPanel } from '@gm-pc/react'
// import { t } from 'gm-i18n'
// import { observer } from 'mobx-react'

// interface Props {
//   type: 'add' | 'detail'
// }

// const TurnOver: FC<Props> = observer((props) => {
//   const { turnoverList } = store
//   const handleChange = (index: number, changeData: any) => {
//     store.changeTurnoverItem(index, changeData)
//   }

//   return (
//     <BoxPanel title={t('周转物')} collapse>
//       <TurnoverTable
//         type={props.type}
//         data={turnoverList.slice()}
//         onChange={handleChange}
//         onAdd={() => {
//           store.addTurnoverListItem()
//         }}
//         onDel={(index) => {
//           store.delTurnoverListItem(index)
//         }}
//       />
//     </BoxPanel>
//   )
// })

// export default TurnOver
