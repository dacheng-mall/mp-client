const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = "tmp_base64src"; //自定义文件名

export function base64src(base64data) {
  try {
    const [, format, bodyData] =
      /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      return new Error("ERROR_BASE64SRC_PARSE");
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
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
