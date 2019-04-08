Component({
  properties: {
    data: {
      type: Array,
      value: []
    },
    userType: {
      type: Number,
      value: 0
    }
  },
  relations: {
    './item': {
      type: 'child'
    }
  },
  methods: {}
})