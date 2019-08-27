import moment from "moment";
import { source } from "../../../../setting";

Component({
  properties: {
    beginTime: {
      type: String,
      value: {},
      observer: function(newVal) {
        const date = moment(newVal).format("YYYY-MM-DD");
        const time = moment(newVal).format("HH:mm:ss");
        this.setData({
          date,
          time
        });
      }
    },
    activity: {
      type: Boolean,
      value: false,
      observer: function(newVal) {
        this.setData({
          activiy: newVal,
        });
      }
    }
  }
});
