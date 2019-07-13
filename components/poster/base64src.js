const fsm = wx.getFileSystemManager();
export function makeRandom() {
  const r = Math.random() * 10000;
  return r.toString(32);
}
export function base64src(base64data) {
  try {
    const [, format, bodyData] =
      /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      return new Error("ERROR_BASE64SRC_PARSE");
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${makeRandom()}.${format}`;

    const buffer = wx.base64ToArrayBuffer(bodyData);
    return new Promise((res, rej) => {
      fsm.writeFile({
        filePath,
        data: buffer,
        encoding: "binary",
        success() {
          res(filePath);
        },
        fail() {
          rej("ERROR_BASE64SRC_WRITE");
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
}
