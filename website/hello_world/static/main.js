$("#custom").spectrum({
  color: "#f00"
});

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var x, y;
let isDrawing = false
var current_colour = rgb2List($("#selected").css("background-color"));
var colours = setupColours();
var col_to_update = [];

var outdated = false;

refreshGrid();

//assigns colours to grid
function refreshGrid(){
  for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 64; j++) {
      // var randomColor = Math.floor(Math.random() * 16777215).toString(16);
      // ctx.fillStyle = "#" + randomColor;
      //
      let r = colours[i][j][0];
      let g = colours[i][j][1];
      let b = colours[i][j][2];
      r = Math.floor(r/128);
      g = Math.floor(g/128);
      b = Math.floor(b/128);
      r *= 255;
      g *= 255;
      b *= 255;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i * 10, j * 10, 10, 10);

    }
  }
  outdated = false;
}

$('.colour').click(function(e) {
  if(this.id == "pink"){
    $("#selected").css("background-color", "#FF1493");
  }
  else if(this.id == "neon-blue"){
    $("#selected").css("background-color", "#00f3ff");
  }
  else{
    $("#selected").css("background-color", this.id);
  }

});

//converts css string to rgb values
function rgb2List(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
}

c.addEventListener('mousedown', e => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
  getGrid();
  checkTime();
});

c.addEventListener('mousemove', e => {
  if (isDrawing === true) {
    x = e.offsetX;
    y = e.offsetY;
    draw(x, y);
    // sendData();
  }
});

c.addEventListener('mouseup', e => {
  if (isDrawing === true) {
    draw(x, y);
    x = 0;
    y = 0;
    isDrawing = false;
    refreshGrid();
    sendData();
  }
});



function draw(x, y) {
  let row = Math.floor(x / 10);
  let col = Math.floor(y / 10);
  let new_col = rgb2List($("#selected").css("background-color"));
  if(row < 64 && col < 64){
  colours[row][col] = new_col;
  var temp = [row,col,new_col];
  col_to_update.push(temp);
  }
  refreshGrid();
}

function sendData(){
  col_to_update = col_to_update.filter(( ww={}, a=> !(ww[a]=a in ww) ));
  if(!outdated){
    $.ajax({
      url: URL_json,
      type: "post",
      data: {
        'colour': JSON.stringify(col_to_update),
        csrfmiddlewaretoken: window.CSRF_TOKEN
      },
      dataType: 'json',
      success: function (res, status) {
        // console.log(res);
        // console.log(status);
        for (let x = 0 ; x < col_to_update.length; x++){
          let row = col_to_update[x][0];
          let col = col_to_update[x][1];
          let colour = col_to_update[x][2];
          colours[row][col] = colour;
        }
        refreshGrid();
        col_to_update = [];

      },
      error: function (res) {
        console.log(res.status);
      }
    });
  }
}

// function getColoursFromString(result){
//   return JSON.parse(result);
// }

function setupColours(){
  var colours = [];
  for(var i =0; i < 64; i++){
    var row = [];
    for(var j =0; j < 64; j++){
      row[j] = a[i][j];
    }
    colours.push(row);
  }
  return colours;
}
function getGrid(){
  $.ajax({
    url: URL_refresh,
    type: 'GET',
    success: function (result) {
     colours = result.leds;
     col_to_update = col_to_update.filter(( ww={}, a=> !(ww[a]=a in ww) ));
     for (let x = 0 ; x < col_to_update.length; x++){
       let row = col_to_update[x][0];
       let col = col_to_update[x][1];
       let colour = col_to_update[x][2];
       colours[row][col] = colour;
     }
     refreshGrid();

  }});
}

function checkTime(){
  $.ajax({
    url: URL_time,
    type: 'GET',
    success: function (result) {
    // result = JSON.parse(result);
    let dt = result.time;
    if(t.trim() !== dt.trim()){
      outdated = true;
      alert("the matrix has been reset");
      refreshGrid();
      window.location.reload();
    }
  }});
  checkStats();
}
// TODO: fix reset to refresh properly
var total_delta = 120 - delta;

if(delta < 120){
  $("#resetbutton").attr('disabled', true);
  var tid = setTimeout(undisable, total_delta*1000);
}
else{
  $("#resetbutton").attr('disabled', false);
}

// also known as able
function undisable() {
    $("#resetbutton").attr('disabled', false);
}

var ii = 0;

var interval = setInterval(refreshText, 1000);
function refreshText(){
  ii +=1;
  num = Math.ceil(total_delta- ii);
  $("#txt").html("Reset available in " + (num) + " seconds");
  if(num < 0){
    clearInterval(interval);
    $("#txt").html("");
  }
}

var interval2 = setInterval(refreshBoard, 5000);
function refreshBoard(){
  getGrid();


}
