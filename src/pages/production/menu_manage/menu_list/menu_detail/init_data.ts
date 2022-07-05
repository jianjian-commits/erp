export const initBomItem = (ssuIndex: number) => {
  return {
    prev_process_id: '0',
    material: {
      sku_id: '',
      unit_id: '',
      name: '',
      quantity: '',
      ssuIndex,
    },
  }
}

export const initBom = {
  bom_id: '',
  sku_id: '',
  unit_id: '',
  quantity: '1',
  processes: {
    processes: [
      {
        inputs: [],
        outputs: [
          {
            material: {
              sku_id: '',
              unit_id: '',
              name: '',
              quantity: '1',
            },
          },
        ],
      },
    ],
    latest_process_id: 1,
  },
}

export const initSsu = {
  sku_id: '',
  name: '',
  unit_id: '',
  bom_id: '',
  base_price: {},
  bom: { ...initBom },
}
