import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import { Route } from 'gm_api/src/delivery'
import { DistributionContractor } from 'gm_api/src/enterprise'
import { ReactNode } from 'react'

interface PagingRequest {
  offset?: number
  limit?: number
  need_count?: boolean
}
export interface DriverListRequestParams {
  paging: PagingRequest
}

export interface RouteInfo extends Route {
  isEditing: boolean
}

export interface DistributionContractorInfo extends DistributionContractor {
  isEditing: boolean
}

export type ContentItem = {
  value: string
  label: string | ReactNode
  disabled?: boolean
  childRadios?: { value: childType; label: string | ReactNode }[]
  sameLevel?: ReactNode
}
