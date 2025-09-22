const validatePlaylistName = (newName, beforeName = null) => {
  const MAX_NAME_LENGTH = 10;

  function countNameLength(string) {
    let nameLength = 0;
    for (let i = 0; i < string.length; i++) {
      const code = string.charCodeAt(i);
      nameLength += code <= 0x007f ? 0.5 : 1;
    }
    return nameLength;
  }

  if (typeof newName !== "string") {
    return "名前は文字列である必要があります";
  }

  if (!newName) {
    return "名前を入力してください";
  }

  if (newName === beforeName) {
    return "名前が同じです。違う名前にしてください";
  }

  if (countNameLength(newName) > MAX_NAME_LENGTH) {
    return "文字数オーバーです";
  }

  return null;
};

export default validatePlaylistName;
