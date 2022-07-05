import { observable, action, makeAutoObservable } from 'mobx';
import _ from 'lodash'
import moment from 'moment'
import { PlanScheduleData } from './interface'
interface FilterParam {
  begin: string
  end: string
}
interface Filter {
  begin: Date
  end: Date
  [key: string]: any
}

interface RankData {
  name: string
  total_count: number
  percentage: number
}

class Store {
  // 非投屏 筛选条件
  filter: Filter = {
    begin: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
  };

  // 投屏 搜素条件存入缓存中
  storageFilter: FilterParam = {
    begin: moment().startOf('day').format('YYYY-MM-DD hh:mm:ss'),
    end: moment().startOf('day').format('YYYY-MM-DD hh:mm:ss'),
  };

  // 计划进度 | 工序进度
  plan_schedule_data: PlanScheduleData = {
    plan_schedule: {
      total_plan_count: 200, // 总计划数
      finished_plan_count: 100, // 已完成计划数
      released_plan_count: 50, // 已下达计划数
      unreleased_plan_count: 50, // 未下达计划数
    },
    process_schedule: {
      total_task_count: 500, // 总任务数
      finished_task_count: 200, // 已完成任务数
      released_task_count: 200, // 已下达任务数
      unreleased_task_count: 100, // 未下达任务数
    },
  };

  // 车间生产进度排行
  rank_data: Array<RankData> = [
    {
      name: '一号车间',
      total_count: 100,
      percentage: 80,
    },
    {
      name: '二号车间',
      total_count: 100,
      percentage: 70,
    },
    {
      name: '三号车间',
      total_count: 100,
      percentage: 60,
    },
    {
      name: '四号车间',
      total_count: 100,
      percentage: 50,
    },
    {
      name: '五号车间',
      total_count: 100,
      percentage: 40,
    },
    {
      name: '六号车间',
      total_count: 100,
      percentage: 30,
    },
    {
      name: '七号车间',
      total_count: 100,
      percentage: 20,
    },
    {
      name: '八号车间',
      total_count: 100,
      percentage: 10,
    },
  ];

  // 商品生产进度
  goodsData: Array<RankData> = [];

  // 是否投屏
  isFullScreen: boolean = false;

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  setFullScreen(value: boolean) {
    this.isFullScreen = value
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }
}

export default new Store()
