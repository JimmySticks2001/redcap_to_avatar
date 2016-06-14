$(document).ready(function() {
  "use strict";

  //filesystem node module
  var fs = require('fs');

  // Get the current window
  var win = nw.Window.get();
  // Show the dev tools at app startup
  win.showDevTools();


  //
  //Open save file dialog when save icon is clicked.
  //
  $("#save_as_csv").click(function(){
    var chooser = $('#saveFileDialog');
    chooser.unbind('change');
    chooser.change(function(evt) {
      fs.writeFile($(this).val(), assembleCsv(), function(err) {
        if(err){
          notification('alert', 'Unable to save CSV');
          return console.log(err);
        }
      });
    });
    chooser.trigger('click');
  });


  //
  //Test notification and spinner
  //
  $("#button_redcap").click(function(){
    notification("alert", "Something borked");
  });
  $("#button_avatar").click(function(){
    $(".spinner_container_container").show();
  });
  $(".spinner_container").click(function(){
    $(".spinner_container_container").hide();
  });

});//end doc ready




//
//Notification toast
//
var notificationTimeoutID;  //Store the notificationTimeoutID globally so we can remove the timer before setting a new one.
function notification(type, message){
  //clear the old timeout
  window.clearTimeout(notificationTimeoutID);
  //make a new one. Pretty much restarting the timer.
  notificationTimeoutID = window.setTimeout(function(){$(".notification").slideUp(250)},5000);

  if(type == "alert"){
    $(".notification").removeClass("info");
    $(".notification").addClass("alert");
  }else if(type == "info"){
    $(".notification").removeClass("alert");
    $(".notification").addClass("info");
  }

  $(".notification").html("<p>" + message + "</p>").slideDown(250);
};//end notification


//
//create csv formatted string from the content of the table.
//borrowed from https://jsfiddle.net/terryyounghk/kpegu/
//
function assembleCsv() {
  // Temporary delimiter characters unlikely to be typed by keyboard
  // This is to avoid accidentally splitting the actual contents
  var tmpColDelim = String.fromCharCode(11), // vertical tab character
      tmpRowDelim = String.fromCharCode(0), // null character

      // actual delimiter characters for CSV format
      colDelim = '","',
      rowDelim = '"\r\n"',

  csv = '"' + $('table').find('tr').map(function (i, row) {
      var $row = $(row),
          $cols = $row.find('td,th');
      return $cols.map(function (j, col) {
          var $col = $(col),
              text = $col.text();
          return text.replace(/"/g, '""'); // escape double quotes
      }).get().join(tmpColDelim);
  }).get().join(tmpRowDelim).split(tmpRowDelim).join(rowDelim).split(tmpColDelim).join(colDelim) + '"'
  return csv;
};//end assembleCsv


//
//Function to convert int to hex string.
//borrowed from http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript from Tod
//
function decimalStringToHexString(number){
  number = parseInt(number);
  if(number < 0){
  	number = 0xFFFFFFFF + number + 1;
  }
  return number.toString(16).toUpperCase();
};//end decimalToHexString
