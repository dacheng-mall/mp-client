import {source} from '../../../../../setting';
Component({
  relations: {
    "./index": {
      type: "parent"
    },
  },
  properties: {
    data: {
      type: Object,
      value: {}
    }
  },
  data: {
    source
  }
});
