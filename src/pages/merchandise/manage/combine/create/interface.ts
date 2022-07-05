import { CombineFormInterface } from '@/pages/merchandise/manage/combine/create/store'
import { UnitGlobal } from '@/stores/global'
import { Ingredient, Sku } from 'gm_api/src/merchandise'
interface FormType {
  name: string
  merchandise_code: string
  unit: string
  status: string
  images: any[]
  desc: string
}
interface ListType extends Ingredient {
  key: string
  unitList: UnitGlobal[]
  skuOptions: Sku[]
  unitName: string | undefined
}
interface BatchRefProps {
  setIsModalVisible: (params: boolean) => void
}
interface FormRefProps {
  submit: () => Promise<boolean>
  setFieldsValue: (values: CombineFormInterface) => void
}
interface TableRefProps {
  setFieldsValue: (value: Ingredient[]) => void
  handleFinish: () => Promise<Record<string, any>>
}

interface QuotaionProps {
  handleVerify: () => Promise<any>
}
export type {
  FormType,
  ListType,
  BatchRefProps,
  FormRefProps,
  TableRefProps,
  QuotaionProps,
}
