Component({
  relations: {
    "./text": {
      type: "child"
    },
    "./img": {
      type: "child"
    },
    "./list": {
      type: "child"
    }
  },
  properties: {
    data: { type: Array, value: [] }
  },
  methods: {
    textStyle(style) {
      return style;
    }
  }
});
