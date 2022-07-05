import { t } from 'gm-i18n'

export default {
  productionMergeType: '4',
  name: '',
  templateType: '包装',
  tableRowSpanTdArr: [
    [],
    // 物料
    ['{{列.序号}}', '{{列.物料名称}}', '{{列.物料编码}}'],
    // 生产成品
    [
      '{{列.序号}}',
      '{{列.生产成品}}',
      '{{列.生产成品编码}}',
      '{{列.组合工序}}',
      '{{列.工序参数}}',
      '{{列.商品类型}}',
      '{{列.组合工序_工序参数}}',
      '{{列.需求数_基本单位}}',
      '{{列.计划生产_基本单位}}',
    ],
    // 工序
    [
      '{{列.序号}}',
      '{{列.物料工序}}',
      '{{列.组合工序}}',
      '{{列.组合工序_工序参数}}',
      '{{列.工序参数}}',
      '{{列.物料工序_工序参数}}',
    ],
    // 包装
    [
      '{{列.序号}}',
      '{{列.生产成品编码}}',
      '{{列.生产成品}}',
      '{{列.规格编码}}',
      '{{列.规格}}',
      '{{列.商品类型}}',
      '{{列.理论包装数量_基本单位}}',
      '{{列.理论包装数量_包装单位}}',
      '{{列.指导配料}}',
    ],
  ],
  page: {
    name: 'A4',
    size: {
      width: '210mm',
      height: '297mm',
    },
    printDirection: 'vertical',
    type: 'A4',
    gap: {
      paddingRight: '5mm',
      paddingLeft: '5mm',
      paddingBottom: '5mm',
      paddingTop: '5mm',
    },
  },
  header: {
    style: { height: '100px' },
    blocks: [
      {
        text: t('{{车间or小组}}'),
        style: {
          right: '0px',
          left: '0px',
          position: 'absolute',
          top: '10px',
          fontWeight: 'bold',
          fontSize: '26px',
          textAlign: 'center',
        },
      },
      {
        text: t('打印时间：{{打印时间}}'),
        style: {
          left: '2px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: t('最早任务交期：{{最早任务交期}}'),
        style: {
          left: '240px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: t('最晚任务交期：{{最晚任务交期}}'),
        style: {
          left: '460px',
          position: 'absolute',
          top: '62px',
        },
      },
    ],
  },
  contents: [
    {
      className: '',
      type: 'table',
      dataKey: '4',
      subtotal: {},
      specialConfig: { style: {} },
      columns: [
        {
          head: t('序号'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.序号}}'),
          rowSpan: 'rowSpan',
          noRemove: 'noRemove',
        },
        {
          head: t('生产成品'),
          headStyle: {
            textAlign: 'center',
            width: '100px',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.生产成品}}'),
          noRemove: 'noRemove',
        },
        {
          head: t('理论包装数量（包装单位）'),
          headStyle: {
            textAlign: 'center',
            width: '80px',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.理论包装数量_包装单位}}'),
        },
        {
          head: t('指导配料'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.指导配料}}'),
        },
        {
          head: t('物料名称'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.物料名称}}'),
          noRemove: 'noRemove',
        },
        {
          head: t('理论用料数量（基本单位）'),
          headStyle: {
            textAlign: 'center',
            width: '80px',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.理论用料数量_基本单位}}'),
        },
      ],
    },
  ],
  sign: {
    blocks: [],
    style: {},
  },
  footer: {
    blocks: [
      {
        text: t('页码： {{当前页码}} / {{页码总数}}'),
        style: {
          right: '',
          left: '48%',
          position: 'absolute',
          top: '0px',
        },
      },
    ],
    style: {
      height: '20px',
    },
  },
}
