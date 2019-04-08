import { get } from "../../utils/request";
import { uri, getRoute } from "../../utils/util";
import { source } from "../../setting";
import regeneratorRuntime from "../../utils/regenerator-runtime/runtime";

Page({
  data: {
    elements: [],
    code: "",
    count: 0,
    source
  },
})