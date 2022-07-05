import type { Quotation_Status } from 'gm_api/src/merchandise'

export interface FilterOptions {
  start_time?: string
  end_time?: string
  quotation_id?: string
  serial_no?: string
  supplier: any
  statuses: Quotation_Status[]
}

// export interface FilterOptions {
//   start_time?: string
//   end_time?: string
//   quotation_q?: string
//   serial_no?: string
//   supplier: any
//   statuses: Quotation_Status[]
// }
