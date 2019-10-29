wx.miniProgram.getEnv(function(res) {
  console.log(res.miniprogram) // true
})

window.addEventListener('onload', function(e){
  console.log('web load', e.location)
}, false)