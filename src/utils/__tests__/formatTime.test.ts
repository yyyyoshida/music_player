import { formatTimeHours, formatTime } from "../formatTime";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

describe("formatTimeHours（プレイリストの合計再生時間）", () => {
  test("0のときは 0分 を返す", () => {
    expect(formatTimeHours(0)).toBe("0分");
  });

  test("1時間未満は x分 を返す", () => {
    expect(formatTimeHours(20 * ONE_MINUTE)).toBe("20分");
  });

  test("1時間以上なら x時間 x分 を返す", () => {
    expect(formatTimeHours(1 * ONE_HOUR + 30 * ONE_MINUTE)).toBe("1時間 30分");
  });
});

describe("formatTime （再生バー 分:秒）", () => {
  test("0のときは 0:00 を返す", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  test("60秒未満でも正しく返す", () => {
    expect(formatTime(45 * ONE_SECOND)).toBe("0:45");
  });

  test("1分以上でも正しく返す", () => {
    expect(formatTime(4 * ONE_MINUTE + 30 * ONE_SECOND)).toBe("4:30");
  });
});
