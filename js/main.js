var spinnerTimeoutID;
var state = 0;

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
  $("#button").click(function(){
    if(state == 0){
      //open openFileDialog
      var chooser = $('#openFileDialog');
      chooser.unbind('change');
      chooser.trigger('click');
      chooser.change(function(evt) {
        if($(this).val()){
          //do the thing to the file
          csvToXml($(this).val());

          //show the spinner while working with the file.
          $(".spinner_container_container").show();
          window.clearTimeout(spinnerTimeoutID);
          spinnerTimeoutID = window.setTimeout(function(){
            $(".spinner_container_container").hide();
            $("#button").text("Save as Avatar XML");
            state = 1;
          }, 5000);
        }else{
          //if the cancel button was selected instead of opening a file, do nothing.
        }
      });

    }else if(state == 1){
      //open saveFileDialog
      var chooser = $('#saveFileDialog');
      chooser.unbind('change');
      chooser.attr('nwsaveas', moment().format("MM_DD_YYYY__hh_mm_ss") + ".xml" );
      chooser.trigger('click');
      chooser.change(function(evt) {
        if($(this).val()){
          //save the XML content to the selected file location
          fs.writeFile($(this).val(), assembleCsv(), function(err) {
            if(err){
              notification('alert', 'Unable to save XML');
              return console.log(err);
            }else{
              $("#button").text("Open REDcap CSV");
              state = 0;
            }
          });
        }else{
          //if the cancel button was selected instead of saving a file, do nothing.
        }
      });


    }
  });//end button click


  //If spinner is clicked, test alert notification for funsies.
  $(".spinner_container").click(function(){
    notification("alert", "Something bad happened");
    window.clearTimeout(spinnerTimeoutID);
    $(".spinner_container_container").hide();
    $("#button").text("Open REDcap CSV");
    state = 0;
  });


});//end doc ready


//
//Display a notification in the window with type {string} "alert" or "info", and {string} message to display.
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
//Open the selected CSV file and convert it to the proper XML format which Avatar will accept.
//
function csvToXml(csvFile){
  console.log(csvFile);
}//end csvToXml


































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
