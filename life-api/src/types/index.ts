export type ResponseResult = {
  code: number;
  msg: string;
  data: Record<string, any> | null;
};

export type WinResult = {
  front: string;
  back: string;
  grade: string;
  gradeCn: string;
  amount: number;
};

export type WinLottery = {
  lotteryDrawResult: string;
  lotteryDrawNum: string;
  lotteryDrawTime: string;
  lotterySaleEndtime: string;
  drawPdfUrl: string;
};
