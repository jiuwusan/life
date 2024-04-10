export type ResponseResult = {
  code: number;
  msg: string;
  data: Record<string, any> | null;
};

export type WinResult = {
  front: Array<string>;
  back: Array<string>;
  prize: string;
  amount: number;
};

export type WinLottery = {
  lotteryDrawResult: string;
  lotteryDrawNum: string;
  lotteryDrawTime: string;
  lotterySaleEndtime: string;
};
