var buttonState = 0;  //keep track of the current state of the big button
var fs, xmlWriter;    //file system and xml writer objects
var xmlString;        //the generated XML object

$(document).ready(function() {
  "use strict"; //strict mode because it makes sense

  //filesystem node module. used to write the XML file
  fs = require('fs');
  //used to create an XML file in proper format
  xmlWriter = require('xml-writer');  //https://www.npmjs.com/package/xml-writer

  // Get the current window
  //var win = nw.Window.get();
  // Show the dev tools at app startup
  //win.showDevTools();

  //Catch any errors which may not be properly handled and display a generic message.
  window.onerror = function(){
    buttonStateChange("red", 2, "Something went wrong :(");
  }//end onerror

  buttonStateChange("blue", 0, "Open REDcap CSV");

  //
  //Button action. Since it is the same button, only changing content and action, make button perform different
  //acts when state changes. Possible states: 0 = ready to accept CSV file, 1 = ready to save XML file, 2 = error.
  //
  $("#button").click(function(){
    if(buttonState == 0){
      //open openFileDialog
      $('#openFileDialog').change(function(evt) {
        if($(this).val()){  //if there is a file chosen...
          csvToJson(evt.target.files[0]); //convert file from csv to json
          $(this).val("");  //blank value in file dialog so changed event will fire again
        }
      });
      $('#openFileDialog').trigger('click');  //open the dialog

    }else if(buttonState == 1){
      //open saveFileDialog
      $('#saveFileDialog').attr('nwsaveas', moment().format("MM_DD_YYYY__hh_mm_ss") + ".xml" ); //set the file name
      $('#saveFileDialog').change(function(evt) {
        if($(this).val()){  //if a file location is chosen...
          //save the XML content to the selected file location
          fs.writeFile($(this).val(), xmlString, function(err) {
            if(err){
              buttonStateChange("red", 2, "Unable to save XML file :(");
              return console.log(err);
            }else{
              buttonStateChange("blue", 0, "Open REDcap CSV");
            }
          });
          $(this).val("");  //blank value in file dialog so changed event will fire again
        }
      });
      $('#saveFileDialog').trigger('click');  //open the dialog
    }else if(buttonState == 2){
      buttonStateChange("blue", 0, "Open REDcap CSV");
    }
  });//end button click

  $("#back").click(function(){
    buttonStateChange("blue", 0, "Open REDcap CSV");
  });

});//end doc ready


//
//Open the selected CSV file and convert it to JSON.
//
function csvToJson(csvFile){
  //assemble the config object for papaparse
  papa_config = {
    delimiter: ",",
  	header: true,
    skipEmptyLines: true,
  	complete: function(results, file){
      if(checkResultsHeaders(results.data[0]).length > 0){  //check the headers to see if they are correct, error if not
        buttonStateChange("red", 2, "Improper CSV headers :(");
      } else {
        jsonToXml(results);
        buttonStateChange("green", 1, "Save as Avatar XML");
      }
    },
  	error: function(err, file){  //if error while parsing, error.
      buttonStateChange("red", 2, "Something went wrong :(");
    }
  }

  //parse the csv file. It will fire the complete event defined in papa_config when done
  Papa.parse(csvFile, papa_config);
}//end csvToJson


//
//Takes in papaparse results object and assembles an XML doc.
//
function jsonToXml(results){
  var record_id;  //store the record_id so we can tell when we have to close the SYSTEM.redcap_data tag

  xml = new xmlWriter(true);  //true includes indentation in the XML file
  xml.startDocument();
    xml.startElement("option");
      xml.writeElement("optionidentifier", "USER32")
      xml.startElement("optiondata");

        //iterate through the papaparse JSON data one object at a time
        results.data.forEach(function(element, index){
          //Assemble multiselects into an array to stick into arrayToAmpString
          var lang_array = [
            (element.init_languages___1 == "1" ? "1" : ""),
            (element.init_languages___2 == "1" ? "2" : ""),
            (element.init_languages___3 == "1" ? "3" : ""),
            (element.init_languages___4 == "1" ? "4" : ""),
            (element.init_languages___5 == "1" ? "5" : ""),
            (element.init_languages___6 == "1" ? "6" : ""),
            (element.init_languages___7 == "1" ? "7" : ""),
            (element.init_languages___8 == "1" ? "8" : ""),
            (element.init_languages___9 == "1" ? "9" : "")
          ]
          var marital_array = [
            (element.init_marital___1 == "1" ? "1" : ""),
            (element.init_marital___2 == "1" ? "2" : ""),
            (element.init_marital___3 == "1" ? "3" : ""),
            (element.init_marital___4 == "1" ? "4" : ""),
            (element.init_marital___5 == "1" ? "5" : "")
          ]
          var enrollmentno_array = [
            (element.agen_enrollmentno___1 == "1" ? "1" : ""),
            (element.agen_enrollmentno___2 == "1" ? "2" : ""),
            (element.agen_enrollmentno___3 == "1" ? "3" : ""),
            (element.agen_enrollmentno___4 == "1" ? "4" : ""),
            (element.agen_enrollmentno___5 == "1" ? "5" : ""),
            (element.agen_enrollmentno___6 == "1" ? "6" : "")
          ]
          var ca_cpsagency_array = [
            (element.ca_cpsagency___1 == "1" ? "1" : ""),
            (element.ca_cpsagency___2 == "1" ? "2" : ""),
            (element.ca_cpsagency___3 == "1" ? "3" : ""),
            (element.ca_cpsagency___4 == "1" ? "4" : ""),
            (element.ca_cpsagency___5 == "1" ? "5" : ""),
            (element.ca_cpsagency___6 == "1" ? "6" : ""),
            (element.ca_cpsagency___7 == "1" ? "7" : ""),
            (element.ca_cpsagency___8 == "1" ? "8" : "")
          ]

          //convert arrays into & delimited strings
          var languages = arrayToAmpString(lang_array);
          var maritals = arrayToAmpString(marital_array);
          var enrollmentnos = arrayToAmpString(enrollmentno_array);
          var cpsagencies = arrayToAmpString(ca_cpsagency_array);

          if(element.record_id != record_id){ //if it's a new record_id fill out the primary info
            xml.writeElement("PATID", element.record_id);
            xml.startElement("SYSTEM.redcap_data")
              xml.writeElement("import_date", moment().format("YYYY-MM-DD"));

              //check each element item to see if it is not blank. Only print an XML tag if it contains data.
              if(element.parent_name != "") xml.writeElement("parent_name", element.parent_name);
              if(element.init_administered != "") xml.writeElement("init_administered", moment(element.init_administered, "M/DD/YYYY").format("YYYY-MM-DD"));
              if(element.init_agemother != "") xml.writeElement("init_agemother", element.init_agemother);
              if(element.record_id != "") xml.writeElement("record_id", element.record_id);
              if(element.currently_pregnant != "") xml.writeElement("currently_pregnant", element.currently_pregnant);
              if(element.init_pcp != "") xml.writeElement("init_pcp", element.init_pcp);
              if(element.init_primipara != "") xml.writeElement("init_primipara", element.init_primipara);
              if(element.init_grossincome != "") xml.writeElement("init_grossincome", element.init_grossincome);
              if(element.init_immifam != "") xml.writeElement("init_immifam", element.init_immifam);
              if(element.init_uscitizen != "") xml.writeElement("init_uscitizen", element.init_uscitizen);
              if(languages != "") xml.writeElement("init_languages", languages);
              if(maritals != "") xml.writeElement("init_marital", maritals);
              if(element.init_smoking != "") xml.writeElement("init_smoking", element.init_smoking);
              if(element.family_enrolled != "") xml.writeElement("family_enrolled", element.family_enrolled);
              if(element.enrollment_date != "") xml.writeElement("enrollment_date", moment(element.enrollment_date, "M/DD/YYYY").format("YYYY-MM-DD"));
              if(element.reason_not_entrolled != "") xml.writeElement("reason_not_enrolled", element.reason_not_entrolled); //typo
              if(enrollmentnos != "") xml.writeElement("agen_enrollmentno", enrollmentnos);
              if(element.date_kempe != "") xml.writeElement("date_kempe", moment(element.date_kempe, "M/DD/YYYY").format("YYYY-MM-DD"));
              if(element.kempe_chexp_mobscore != "") xml.writeElement("kempe_chexp_mobscore", element.kempe_chexp_mobscore);
              if(element.kempe_chexp_fobscore != "") xml.writeElement("kempe_chexp_fobscore", element.kempe_chexp_fobscore);
              if(element.kempe_lifescore_mob != "") xml.writeElement("kempe_lifescore_mob", element.kempe_lifescore_mob);
              if(element.kempe_lifescore_fob != "") xml.writeElement("kempe_lifescore_fob", element.kempe_lifescore_fob);
              if(element.kempe_parenting_mobscore != "") xml.writeElement("kempe_parenting_mobscore", element.kempe_parenting_mobscore);
              if(element.kempe_parenting_fobscore != "") xml.writeElement("kempe_parenting_fobscore", element.kempe_parenting_fobscore);
              if(element.kempe_coping_mobscore != "") xml.writeElement("kempe_coping_mobscore", element.kempe_coping_mobscore);
              if(element.kempe_coping_fobscore != "") xml.writeElement("kempe_coping_fobscore", element.kempe_coping_fobscore);
              if(element.mob_stressors_score != "") xml.writeElement("mob_stressors_score", element.mob_stressors_score);
              if(element.fob_stressors_score != "") xml.writeElement("fob_stressors_score", element.fob_stressors_score);
              if(element.kempe_anger_mobscore != "") xml.writeElement("kempe_anger_mobscore", element.kempe_anger_mobscore);
              if(element.kempe_anger_fobscore != "") xml.writeElement("kempe_anger_fobscore", element.kempe_anger_fobscore);
              if(element.kempe_exp_mobscore != "") xml.writeElement("kempe_exp_mobscore", element.kempe_exp_mobscore);
              if(element.kempe_exp_fobscore != "") xml.writeElement("kempe_exp_fobscore", element.kempe_exp_fobscore);
              if(element.kempe_disc_mobscore != "") xml.writeElement("kempe_disc_mobscore", element.kempe_disc_mobscore);
              if(element.kempe_disc_fobscore != "") xml.writeElement("kempe_disc_fobscore", element.kempe_disc_fobscore);
              if(element.kempe_percept_mobscore != "") xml.writeElement("kempe_percept_mobscore", element.kempe_percept_mobscore);
              if(element.kempe_percept_fobscore != "") xml.writeElement("kempe_percept_fobscore", element.kempe_percept_fobscore);
              if(element.kempe_attach_mobscore != "") xml.writeElement("kempe_attach_mobscore", element.kempe_attach_mobscore);
              if(element.kempe_attach_fobscore != "") xml.writeElement("kempe_attach_fobscore", element.kempe_attach_fobscore);
              if(element.mob_total_score != "") xml.writeElement("mob_total_score", element.mob_total_score);
              if(element.fob_total_score != "") xml.writeElement("fob_total_score", element.fob_total_score);
              if(element.kempe_ace_mob != "") xml.writeElement("kempe_ace_mob", element.kempe_ace_mob);
              if(element.kempe_ace_fob != "") xml.writeElement("kempe_ace_fob", element.kempe_ace_fob);
              if(element.init_personfill_other != "") xml.writeElement("init_personfill_other", element.init_personfill_other);
              if(element.init_personfill != "") xml.writeElement("init_personfill", element.init_personfill);
              if(element.init_age != "") xml.writeElement("age_init", element.init_age);
              if(element.init_housing != "") xml.writeElement("init_housing", element.init_housing);
              if(element.init_race != "") xml.writeElement("init_race", element.init_race);
              if(element.intake_professional != "") xml.writeElement("intake_professional", element.intake_professional);
              if(element.cc_close_date != "") xml.writeElement("cc_close_date", moment(element.cc_close_date, "M/DD/YYYY").format("YYYY-MM-DD"));
              if(element.cc_reason_term != "") xml.writeElement("cc_reason_term", element.cc_reason_term);
              record_id = element.record_id;
          }else{//if there is another row with the same record_id, we have MIT rows to create
            //only print the SYSTEM.redcap_data_mit1 tags if there is content for at least one of the inner elements
            if(!(element.firstsurv_1sthvdate == "" &&
                 element.frstvisit_hv_name == "" &&
                 element.first_pregnow == "" &&
                 element.first_baby_gender == "" &&
                 element.first_prenatalcare == "" &&
                 element.first_dob == "" &&
                 element.first_babyfirst == "" &&
                 element.first_babylast == "" &&
                 element.first_dobest == "" )){
              xml.startElement("SYSTEM.redcap_data_mit1");
                if(element.firstsurv_1sthvdate != "") xml.writeElement("firstsurv_1sthvdate", moment(element.firstsurv_1sthvdate, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.frstvisit_hv_name != "") xml.writeElement("frstvisit_hv_name", element.frstvisit_hv_name);
                if(element.first_pregnow != "") xml.writeElement("first_pregnow", element.first_pregnow);
                if(element.first_baby_gender != "") xml.writeElement("first_baby_gender", element.first_baby_gender);
                if(element.first_prenatalcare != "") xml.writeElement("first_prenatalcare", moment(element.first_prenatalcare, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.first_dob != "") xml.writeElement("first_dob", moment(element.first_dob, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.first_babyfirst != "") xml.writeElement("first_babyfirst", element.first_babyfirst);
                if(element.first_babylast != "") xml.writeElement("first_babylast", element.first_babylast);
                if(element.first_dobest != "") xml.writeElement("first_dobest", moment(element.first_dobest, "M/DD/YYYY").format("YYYY-MM-DD"));
              xml.endElement()//SYSTEM.redcap_data_mit1
            }

            if(!(element.prenatal_hv_name == "" &&
                 element.prenatal_gest == "" )){
              xml.startElement("SYSTEM.redcap_data_mit2");
                if(element.prenatal_hv_name != "") xml.writeElement("prenatal_hv_name", element.prenatal_hv_name);
                if(element.prenatal_gest != "") xml.writeElement("prenatal_gest", element.prenatal_gest);
              xml.endElement();//SYSTEM.redcap_data_mit2
            }

            if(!(element.surv_currdate == "" &&
                 element.surv_surveyname == "" &&
                 element.surv_administered == "" &&
                 element.surv_dob == "" )){
              xml.startElement("SYSTEM.redcap_data_mit3");
                if(element.surv_currdate != "") xml.writeElement("surv_currentdate", moment(element.surv_currdate, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.surv_surveyname != "") xml.writeElement("surv_surveyname", element.surv_surveyname);
                if(element.surv_administered != "") xml.writeElement("surv_administered", moment(element.surv_administered, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.surv_dob != "") xml.writeElement("surv_dob", moment(element.surv_dob, "M/DD/YYYY").format("YYYY-MM-DD"));
              xml.endElement();//SYSTEM.redcap_data_mit3
            }

            if(!(element.visitnote_date == "" &&
                 element.hfa_level == "" &&
                 element.curr_refermade == "" &&
                 element.curr_ref_num == "" &&
                 element.curr_addref == "" )){
              xml.startElement("SYSTEM.redcap_data_mit4");
                if(element.visitnote_date != "") xml.writeElement("visitnote_date", moment(element.visitnote_date, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(element.hfa_level != "") xml.writeElement("hfa_level", element.hfa_level);
                if(element.curr_refermade != "") xml.writeElement("curr_refermade", element.curr_refermade);
                if(element.curr_ref_num != "") xml.writeElement("curr_ref_num", element.curr_ref_num);
                if(element.curr_addref != "") xml.writeElement("curr_addref", element.curr_addref);
              xml.endElement();//SYSTEM.redcap_data_mit4
            }

            if(!(element.ca_date == "" &&
                 cpsagencies == "" )){
              xml.startElement("SYSTEM.redcap_data_mit5");
                if(element.ca_date != "") xml.writeElement("ca_date", moment(element.ca_date, "M/DD/YYYY").format("YYYY-MM-DD"));
                if(cpsagencies != "") xml.writeElement("ca_cpsagency", cpsagencies);
              xml.endElement();//SYSTEM.redcap_data_mit5
            }

          }//end element.record_id != record_id else

          //look ahead to see what the next record_id is. If it is not the same as the current record_id, close
          //the SYSTEM.redcap_data XML tag.
          if(results.data[(index+1 > results.data.length-1 ? 0 : index+1)].record_id != record_id){
            xml.endElement();//SYSTEM.redcap_data
          }

        })//end forEach row

      xml.endElement();//optiondata
    xml.endElement();//option
  xml.endDocument();

  xmlString = xml.toString();
}//end jsonToXml


//
//Takes in a papaparse json object and makes sure all of the headers are there.
//Returns an array of missing headers if any.
//
function checkResultsHeaders(result){
  var missingHeaders = [];
  var requiredHeaders = [
    "init_languages___1",
    "init_languages___2",
    "init_languages___3",
    "init_languages___4",
    "init_languages___5",
    "init_languages___6",
    "init_languages___7",
    "init_languages___8",
    "init_languages___9",
    "init_marital___1",
    "init_marital___2",
    "init_marital___3",
    "init_marital___4",
    "init_marital___5",
    "agen_enrollmentno___1",
    "agen_enrollmentno___2",
    "agen_enrollmentno___3",
    "agen_enrollmentno___4",
    "agen_enrollmentno___5",
    "agen_enrollmentno___6",
    "ca_cpsagency___1",
    "ca_cpsagency___2",
    "ca_cpsagency___3",
    "ca_cpsagency___4",
    "ca_cpsagency___5",
    "ca_cpsagency___6",
    "ca_cpsagency___7",
    "ca_cpsagency___8",
    "parent_name",
    "init_administered",
    "init_agemother",
    "record_id",
    "currently_pregnant",
    "init_pcp",
    "init_primipara",
    "init_grossincome",
    "init_immifam",
    "init_uscitizen",
    "init_smoking",
    "family_enrolled",
    "enrollment_date",
    "reason_not_entrolled",
    "date_kempe",
    "kempe_chexp_mobscore",
    "kempe_chexp_fobscore",
    "kempe_lifescore_mob",
    "kempe_lifescore_fob",
    "kempe_parenting_mobscore",
    "kempe_parenting_fobscore",
    "kempe_coping_mobscore",
    "kempe_coping_fobscore",
    "mob_stressors_score",
    "fob_stressors_score",
    "kempe_anger_mobscore",
    "kempe_anger_fobscore",
    "kempe_exp_mobscore",
    "kempe_exp_fobscore",
    "kempe_disc_mobscore",
    "kempe_disc_fobscore",
    "kempe_percept_mobscore",
    "kempe_percept_fobscore",
    "kempe_attach_mobscore",
    "kempe_attach_fobscore",
    "mob_total_score",
    "fob_total_score",
    "kempe_ace_mob",
    "kempe_ace_fob",
    "init_personfill_other",
    "init_personfill",
    "init_age",
    "init_housing",
    "init_race",
    "intake_professional",
    "cc_close_date",
    "cc_reason_term",
    "firstsurv_1sthvdate",
    "frstvisit_hv_name",
    "first_pregnow",
    "first_baby_gender",
    "first_prenatalcare",
    "first_dob",
    "first_babyfirst",
    "first_babylast",
    "first_dobest",
    "prenatal_hv_name",
    "prenatal_gest",
    "surv_currdate",
    "surv_surveyname",
    "surv_administered",
    "surv_dob",
    "visitnote_date",
    "hfa_level",
    "curr_refermade",
    "curr_ref_num",
    "curr_addref",
    "ca_date"
  ];

  requiredHeaders.forEach(function(header, index){
    if(typeof result[header] === 'undefined'){
      missingHeaders.push(header);
    }
  });

  return missingHeaders;
}//end checkResultsHeaders


//
//Takes in an array of strings, outputs a string made from the joined array minus the blank strings.
//Used to convert REDcap multiselects into Avatar & separated numbers.
//
function arrayToAmpString(array){
  var ampString = "";

  //reverse order array traversal so splicing works correctly, else splicing in a loop would alter the length
  //of the array it is currently iterating through.
  for(i = array.length-1; i >= 0 ; i--){
    if(array[i] == "" || array[i] == "0"){
      array.splice(i, 1);
    }
  }
  if(array.length > 1){ //if the array still contains items, they are legit selections. Build & delimited string
    ampString = array.join("&")
  } else if(array.length == 1){ //if it's just a single item, no & needed
    ampString = array[0];
  }

  return ampString
}//end arrayToAmpString


//
//Controls the button text, color, and state variable.
//
function buttonStateChange(color, state, text){
  var hex = "#333333";  //default to grey just beacuse

  if(color == "red"){
    hex = "#F44336";
  } else if(color == "green"){
    hex = "#4CAF50";
    $("#back").css("background-color", "#319634") //slightly darker green
    $("#back").fadeIn(400);
  } else if(color == "blue"){
    hex = "#03A9F4";
    $("#back").css("background-color", hex)
    $("#back").fadeOut(400);
  }

  $("#button").css("background-color", hex);
  $("#button").text(text);
  buttonState = state;
}//end buttonState
