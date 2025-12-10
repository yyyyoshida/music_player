import validatePlaylistName from "../validatePlaylistName";
describe("validatePlaylistName", () => {
  const beforeName = "プレイリスト";

  test("文字列以外の場合はエラーを返す", () => {
    expect(validatePlaylistName(123 as any)).toBe("名前は文字列である必要があります");
    expect(validatePlaylistName(null as any)).toBe("名前は文字列である必要があります");
    expect(validatePlaylistName(undefined as any)).toBe("名前は文字列である必要があります");
  });

  test("空文字列の場合はエラーを返す", () => {
    expect(validatePlaylistName("")).toBe("名前を入力してください");
    expect(validatePlaylistName("", beforeName)).toBe("名前を入力してください");
  });

  test("以前と名前が同じ場合はエラーを返す", () => {
    expect(validatePlaylistName(beforeName, beforeName)).toBe("名前が同じです。違う名前にしてください");
  });

  test("文字数が上限を超えた場合はエラーを返す", () => {
    // 上限は10文字（全角なら10文字、半角なら20文字）

    // 半角20文字以内はOK
    expect(validatePlaylistName("abcdefghijklmnopqrst")).toBeNull();

    // 半角21文字はNG
    expect(validatePlaylistName("abcdefghijklmnopqrstu")).toBe("文字数オーバーです");

    // 全角10文字以内はOK
    expect(validatePlaylistName("あいうえおかきくけこ")).toBeNull();

    // 全角11文字はNG
    expect(validatePlaylistName("あいうえおかきくけこさ")).toBe("文字数オーバーです");

    // 半角8(4) + 全角6 = 10文字はOK
    expect(validatePlaylistName("abcdefghあいうえおか")).toBeNull();

    // 半角8(4) + 全角7 = 11文字はNG
    expect(validatePlaylistName("abcdefghあいうえおかき")).toBe("文字数オーバーです");
  });

  test("有効な名前の場合、nullを返す", () => {
    expect(validatePlaylistName("MyPlaylist")).toBeNull();
    expect(validatePlaylistName("プレイリスト１")).toBeNull();
    expect(validatePlaylistName("Hoge123")).toBeNull();
  });
});
