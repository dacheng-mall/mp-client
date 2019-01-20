Component({
  relations: {
    "./index": {
      type: "parent"
    }
  },
  properties: {
    data: {
      type: Object
    },
    index: {
      type: Number
    }
  },
});
