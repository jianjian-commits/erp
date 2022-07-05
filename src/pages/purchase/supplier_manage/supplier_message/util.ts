import { getImages } from '@/common/service'
import { isInvalidLocation } from '@/common/util'
import { ListSupplierResponse, Supplier } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { SupplierItem } from './interface'

export const adapterSupplierItem = (supplier: Supplier): SupplierItem => {
  const {
    company_name,
    company_address,
    company_phone,
    invoice_type,
    taxpayer_identity_number,
    bank_name,
    bank_account,
    bank_card_owner_name,
    max_invoice_amount,
    business_license_number,
    financial_contact_name,
    financial_contact_phone,
    taxpayer_type,
    invoice_setting,
  } = supplier.attrs?.china_vat_invoice ?? {}

  const isInValid = isInvalidLocation(
    supplier.address?.geotag?.latitude,
    supplier.address?.geotag?.longitude,
  )

  return {
    ...supplier,
    supplier_id: supplier.supplier_id,
    name: supplier.name,
    phone: supplier.phone,

    company_name,
    company_address,
    company_phone,
    invoice_type,
    taxpayer_identity_number,
    bank_name,
    bank_account,
    bank_card_owner_name,
    max_invoice_amount,
    business_license_number,
    financial_contact_name,
    financial_contact_phone,
    taxpayer_type,
    available_category_ids: supplier.attrs?.available_category_ids!,
    map_address: supplier.address?.address,
    location_latitude: isInValid ? '' : supplier.address?.geotag?.latitude,
    location_longitude: isInValid ? '' : supplier.address?.geotag?.longitude,
    qualification_images: getImages(supplier.attrs?.qualification_images!),
    invoice_setting,
  }
}

export const adapterSuppliers = (
  data: ListSupplierResponse,
): SupplierItem[] => {
  const result: SupplierItem[] = []

  _.each(data.suppliers, (supplier) => {
    result.push(adapterSupplierItem(supplier))
  })

  return result
}
