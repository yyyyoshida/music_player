const MAX_NAME_LENGTH = 10;

function countNameLength(string: string) {
  let nameLength = 0;
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    nameLength += code <= 0x007f ? 0.5 : 1;
  }
  return nameLength;
}

function validatePlaylistName(name: string, BeforePlaylistName: string | null = null) {
  if (typeof name !== "string") {
    return "名前は文字列である必要があります";
  }

  const trimmedName = name.trim();
  const nameLength = countNameLength(trimmedName);

  if (!trimmedName) {
    return "名前を入力してください";
  }

  if (nameLength > MAX_NAME_LENGTH) {
    return "文字数オーバーです";
  }

  if (BeforePlaylistName !== null && trimmedName === BeforePlaylistName.trim()) {
    return "名前が同じです。違う名前にしてください";
  }

  return null;
}

module.exports = { MAX_NAME_LENGTH, countNameLength, validatePlaylistName };
