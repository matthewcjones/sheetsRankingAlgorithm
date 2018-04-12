//Global Declarations
var ss = SpreadsheetApp.getActiveSpreadsheet();
var userRankingsSheet = ss.getSheetByName("Users Rankings Pull");
var maxColumns = userRankingsSheet.getMaxColumns();

function createRanking() {

  var nameOfSheetArray = [];
  getSheets(nameOfSheetArray); //returns array with name of Sheets

  var nameOfUsersArray = [];
  getUsers(nameOfUsersArray); //returns array with name of users
  var duplicateNameOfSheetArray = nameOfUsersArray.slice();

  var cleanedUsersArray = removesDuplicates(nameOfUsersArray); //removes duplicates in our Users Array

  var cleanedUsersArray2 = removeSpecialCases(cleanedUsersArray); //removes special cases in Array, Full Name and ""

  var cleanedUsersArray3 = removeOverlap(nameOfSheetArray,cleanedUsersArray2); //removes names from array that already have a sheet

  createNewSheet(cleanedUsersArray3); //create new sheet for users, and adds first row

  copyValues(duplicateNameOfSheetArray); //copy values and rows into there corresponding sheets
}

//Grabs the appropriate columns and copys them into their correct sheet (by Name)
function copyValues(array) {
  var count = 1;

  for (name in array) {
    var tempSheet = ss.getSheetByName(array[name]);

    if (tempSheet == null) {
      count ++;
      continue;
    }
    else {
      var voteValues = userRankingsSheet.getRange(count, 1, 1, maxColumns).getValues();
      voteValues[0].unshift(new Date());
      Logger.log(voteValues);

      var lastRow = tempSheet.getLastRow() + 2;
      tempSheet.getRange(lastRow, 1, 1, voteValues[0].length).setValues(voteValues);
      count ++;

      createRankingsColumn(lastRow, tempSheet, voteValues); //fills the rankings column witht the appropriate measure
    }
  }
}

//Grabs the Cell and writes the betaValue
function createRankingsColumn(row, tempSheet, voteValues) {
  var betaRow = row + 1;

  for (var i = 0; i < voteValues[0].length; i++) {
    if (voteValues[0][i] == "0") {
      continue;
    }
    else if (voteValues[0][i] == "1" || voteValues[0][i] == "-1") {
      var targetCell = tempSheet.getRange(betaRow,(i + 1));
      targetCell.setValue('hello'); //this function brings in the BetaValue
    }
    else {
      continue;
    }
  }
}


//create new sheets and adds columns into the array
function createNewSheet(array) {
  var maxColumns = userRankingsSheet.getMaxColumns();
  var stockNames = userRankingsSheet.getRange(1,1,1, maxColumns).getValues();

  for (element in array) {
    var testSheet = ss.getSheetByName(array[element]);
    if (testSheet != null) {
      continue;
    }
    else {
      ss.insertSheet().setName(array[element]);
      var sheet = ss.getSheetByName(array[element]);
      sheet.getRange(1, 2, 1, stockNames[0].length).setValues(stockNames);
    }
  }
}
//remove Overlaps in two Ararys
function removeOverlap(array1, arrayToBeCleaned) {
  for (var element in array1) {
    for (var i = 0; i < arrayToBeCleaned.length; i++) {
      if (arrayToBeCleaned[i] === array1[element]) {
        arrayToBeCleaned.splice(i, 1);
        break;
      }
      else {
        continue;
      }
    }
  }
  return arrayToBeCleaned;
}


function removeSpecialCases(array) {
  for (var i = 0; i < array.length; i++) {

    if (array[i] === "Full name") {
      array.splice(i, 1);
      continue;
    }
    else if (array[i] == "") {
      array.splice(i, 1);
      continue;
    }
    else if (array[i] == null) {
      array.splice(i , 1);
      continue;
    }
    else {
      break;
    }
  }
  return array;
}

//removesDuplicates in an array
function removesDuplicates(duplicateArray) {

  for (var i = 0; i < duplicateArray.length; i ++) {
    var count = 0;
    for (var t = 0; t < duplicateArray.length; t ++) {

      if (duplicateArray[i] === duplicateArray[t]) {
        //Logger.log(userNameValues[i] + '' + userNameValues[t] + ' special case');
        count ++;

        if (count >= 2) {
          duplicateArray.splice(t,1);
        }
      } else {
        continue;
      }
    }
  }
  return duplicateArray;
}

//get the userNames and structures them in Array - targets the second column
function getUsers(nameOfUsersArray) {

  var sheet = ss.getSheetByName("Users Rankings Pull");
  var lastRow = sheet.getLastRow();
  var userNames = sheet.getRange(1,2,lastRow,1).getValues();

  for (var i = 0; i < userNames.length; i ++) {
    nameOfUsersArray.push(userNames[i][0]);
  }

  return nameOfUsersArray;
}

//Gets the name sheets and puts them into an Array (rather then an object)
function getSheets(nameOfSheetArray) {

  var nameOfSheets = ss.getSheets()
  //var nameOfSheetArray = [];

  for (var i = 0; i < nameOfSheets.length; i++) {
    nameOfSheetArray.push(ss.getSheets()[i].getName());
  }
  return nameOfSheetArray;
}
