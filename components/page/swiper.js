const common = require("./common");
Component({
  behaviors: [common],
  methods: {
    click: function(e){
      this.triggerEvent("click", e.currentTarget.dataset);
    }
  }
});
