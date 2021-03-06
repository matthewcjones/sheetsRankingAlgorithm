//Global Declarations
var ss = SpreadsheetApp.getActiveSpreadsheet();
var userRankingsSheet = ss.getSheetByName("Users Rankings Pull");
var rankingSheet = ss.getSheetByName('rankingTable');

//This functions takes a sheets of votes and matches them to stock performance and returns an attribution figure
function createRanking() {

  var nameOfSheetArray = [];
  getSheets(nameOfSheetArray); //returns array with name of Sheets

  var nameOfIDArray = [];
  getID(nameOfIDArray); //returns array with name of users
  var duplicateNameOfSheetArray = nameOfIDArray.slice();
  //Logger.log(nameOfIDArray);
  var cleanedUsersArray = removesDuplicates(nameOfIDArray); //removes duplicates in our Users Array

  var cleanedUsersArray2 = removeSpecialCases(cleanedUsersArray); //removes special cases in Array, Full Name and ""
  var duplicateUsersArray2 = cleanedUsersArray2.slice();

  var cleanedUsersArray3 = removeOverlap(nameOfSheetArray,cleanedUsersArray2); //removes names from array that already have a sheet

  createNewSheet(cleanedUsersArray3); //create new sheet for users, and adds first row

  copyValues(duplicateNameOfSheetArray); //copy values and rows into there corresponding sheets

  setEngagmentValue(nameOfIDArray); //This is used to for the cohort analysis to determine the frequency of voting

  getScoreLeft(duplicateNameOfSheetArray); //Create scores on Top Left Hand of User Sheet

  storeValues(); //copies current days rankingsTable, and puts them previousRankingTable

  rankUser(duplicateUsersArray2); //updates the ranking table

  updatePreviousRankings(); //creates the previous days rankings

}

function setEngagmentValue(array) {
  Logger.log(array);
  for (name in array) {
    var tempSheet = ss.getSheetByName(array[name]);


    if (tempSheet == null) {
      Logger.log(tempSheet);
      continue;
    } else {
    var lastRow = tempSheet.getLastRow();
    tempSheet.getRange(lastRow, 1).setValue(engagementFunction(lastRow));
    }
  }
}

function engagementFunction(lastRow) {
  var previousRow = lastRow - 1;
  var stringFormatted =  ('=(COUNT(D' + lastRow + ':DU' + lastRow + ')/COUNT(D' + previousRow + ':DU' + previousRow + '))');
  Logger.log(stringFormatted);
  return stringFormatted;
}

//Update PreviousDaysRankings
function updatePreviousRankings() {

  var rankingMovement = []
  compareScores(rankingMovement); //creates of rankingmovement scores

  var binaryTransfo = makeBinary(rankingMovement); //just conform it to -1 and positive 1 so it is intereacts more easily with system
  //This can potential be refactored out if we want the whole number
  var rankingSheet = ss.getSheetByName('rankingTable');
  var rankStatusColumn = 5;

  for (i = 0; i < binaryTransfo.length; i ++) {
    rankingSheet.getRange(i + 3 , rankStatusColumn).setValue(binaryTransfo[i]);
  }
}

//takes a range of numbers and turns them into 1,0,-1
function makeBinary(array) {

  var newArray = [];
  for (i = 0; i < array.length; i ++) {
    if (array[i] >= 1) {
      newArray.push('1');
      continue;
    }
    if (array[i] <= -1){
      newArray.push('-1');
      continue;
    }
    else {
      newArray.push('0');
      continue;
    }
  }
  return newArray;
}

//Compares two columns in two different Javasciript Object, then subtract the second third columns from each other
function compareScores(array) {

  //Necessary declaration to target the Current Rankings
  var lastRow1 = rankingSheet.getLastRow() - 2;
  var currentRankingValues = rankingSheet.getRange(3,1,lastRow1,3).getValues();

  //Necessary delclaration to target Previous Rankings
  var previousRankingSheet = ss.getSheetByName('previousRankingTable');
  var lastRow2 = previousRankingSheet.getLastRow() - 2;
  var previousRankingValues = previousRankingSheet.getRange(3,1,lastRow2,3).getValues();

  for (i = 0; i < lastRow1; i++) {
   for (j = 0; j < lastRow2; j ++) {
     if (currentRankingValues[i][0] == previousRankingValues[j][0]) {
       var temp = parseInt(previousRankingValues[j][2]) - parseInt(currentRankingValues[i][2]);
       array.push(temp);
       break;
     }
     if (j == lastRow2 - 1) {
       array.push('0'); //push 0 into correct place,
     }
   }
 }
 return array;
}

//Grabs number in top left corner and sheet and then puts that in sheet called rankingTable
function rankUser(array) {

  if (rankingSheet == null) {
    rankingSheet = ss.insertSheet().setName('rankingTable')
  }
  else {
    rankingSheet.getDataRange().clear();
  }

  for (name in array) {
   var tempSheet = ss.getSheetByName(array[name]);

   if (tempSheet == null) {
     continue;
   }

   createBaseFormat();

   var userId = tempSheet.getRange(2,2).getValue();
   var userScore = tempSheet.getRange(1,1).getValue();
   var userName = tempSheet.getRange(2,3).getValue()
   var lastRow = rankingSheet.getLastRow() + 1;

   rankingSheet.getRange(lastRow,1).setValue(userId);
   rankingSheet.getRange(lastRow,2).setValue(userName);

   if (userScore == '#NUM!') {
     rankingSheet.getRange(lastRow,4).setValue('0');
    } else {
      rankingSheet.getRange(lastRow,4).setValue(userScore);
    }

  }
  rankString(); //ranks current days peformance
}

//General Formating of Spreadsheet
function createBaseFormat() {

  rankingSheet.getRange(1,1).setValue(new Date());
  var secondRowValues = [];
  secondRowValues[0] = 'user_id';
  secondRowValues[1] = 'full_name';
  secondRowValues[2] = 'rank';
  secondRowValues[3] = 'power_vote';
  secondRowValues[4] = 'rank_Status';
  secondRowValues[5] = 'fund_value';

  for (i = 0; i < secondRowValues.length; i++) {
    rankingSheet.getRange(2, i + 1).setValue(secondRowValues[i]);
  }
}

//creates a the Google Function Rank in column three of the sheet Ranking Table
function rankString() {

 var lastRowNumer = rankingSheet.getLastRow();

 for (var i = 2; i < lastRowNumer; i ++) {
   var sheetPosition = i + 1;
   var name = ('=RANK(D'+ sheetPosition + ', D1:D' + lastRowNumer + ')');
   rankingSheet.getRange(sheetPosition, 3).setValue(name);
 }

}

//replicates data and chucks it into a spreadsheet in new colum
function storeValues() {

  var dataRange = rankingSheet.getDataRange();
  var lastColumn = rankingSheet.getLastColumn();

  var previousRankingTable = ss.getSheetByName('previousRankingTable');

  if (rankingSheet == 'null') {
    return;
  }

  previousRankingTable.insertColumns(1,lastColumn + 2);
  dataRange.copyTo(previousRankingTable.getRange("A1"), SpreadsheetApp.CopyPasteType.PASTE_VALUES);
}

//adds a number of columns together and adds the total to the top left hand corner
function getScoreLeft(array) {

    for (name in array) {
    var tempSheet = ss.getSheetByName(array[name]);

    if (tempSheet == null) {
      continue;
    }

      var lastRow = tempSheet.getLastRow();
      var lastColumn = tempSheet.getLastColumn();
      var rankingScore = 0;
      var numberOfVotes = 0;
      var scaledRankingScore;

    for (var i = lastRow; i > 2; i -= 2) {
      var sumRange = tempSheet.getRange(i, 1, 1, lastColumn).getValues();

      for (var t = 0; t < sumRange[0].length; t++) {
        if (sumRange[0][t] == "") {
          continue;
        }
        else if (sumRange[0][t] == "#ERROR!") {
          continue;
        }
        else if (sumRange[0][t] == "#N/A") {
          continue;
        }
        else {
          var vote = tempSheet.getRange(i - 1 , t + 1).getValue(); //to get the vote we need the row above and then the account for the difference in counting
          numberOfVotes += 1;

          if (vote == "1" && sumRange[0][t] > 0) {
            rankingScore += parseFloat(sumRange[0][t]);
            //'positive vote, positive movement
            continue;
          }
          else if (vote == '1' && sumRange[0][t] < 0) {
            rankingScore += parseFloat(sumRange[0][t]);
            //positive vote, negative movement
            continue;
          }
          else if (vote == "-1" && sumRange[0][t] > 0) {
            rankingScore += (parseFloat(sumRange[0][t]) * -1);
            continue;
            //negative vote, positive movement
          }
          else if (vote == '-1' && sumRange[0][t] < 0) {
            rankingScore += (parseFloat(sumRange[0][t]) * -1);
            continue;
            //negative vote, negative movenment
          }
          else {
            continue;
          }
        }
      }
    }
      scaledRankingScore = powerFunction(numberOfVotes) * rankingScore; //scales the rank depenent on the number of votes
      tempSheet.getRange(1,1).setValue(scaledRankingScore);
  }
}

//fits a number to a simple logorithmic distribution
function powerFunction(number) {
  return Math.log(number);
}

//Grabs the appropriate columns and copys them into their correct sheet (by Name)
function copyValues(array) {
  var count = 1;
  var maxColumns = userRankingsSheet.getMaxColumns();

  for (name in array) {
    var tempSheet = ss.getSheetByName(array[name]);

    if (tempSheet == null) {
      count ++;
      continue;
    }
    else {
      var voteValues = userRankingsSheet.getRange(count, 1, 1, maxColumns).getValues();
      voteValues[0].unshift(new Date());
      var lastRow = tempSheet.getLastRow() + 1;
      tempSheet.getRange(lastRow, 1, 1, voteValues[0].length).setValues(voteValues);
      tempSheet.getRange(lastRow + 1, 3).setValue(array[name]); // lets refactor this to 2
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
      var betaCol = i + 1;
      var targetCell = tempSheet.getRange(betaRow, betaCol);
      targetCell.setValue(hLookupString(betaCol, tempSheet)); //this function brings in the BetaValue
    }
    else {
      continue;
    }
  }
}

//fomats the BetaRow
function hLookupString(col, tempSheet) {
  var colAsLetter = columnToLetter(col,tempSheet); //converts column number to letter
  var lastColAsLetter = columnToLetter(userRankingsSheet.getLastColumn());
  var lastRow = ss.getSheetByName('CompanySheet').getLastRow();
  var maxRow = userRankingsSheet.getMaxRows();
  var hLookup = ('=HLOOKUP(' + colAsLetter + '1 , CompanySheet!A1:' + lastColAsLetter + maxRow + ',' + lastRow + ', FALSE)');
  return hLookup;
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
      sheet.deleteRows(100, 900); //delete rows to save space
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

    if (array[i] === "User_ID") {
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
function getID(nameOfIDArray) {

  var sheet = ss.getSheetByName("Users Rankings Pull");
  var lastRow = sheet.getLastRow();
  var userID = sheet.getRange(1,1,lastRow,1).getValues();

  for (var i = 0; i < userID.length; i ++) {
    nameOfIDArray.push(userID[i][0]);
  }

  return nameOfIDArray;
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

//Converts a columnNumber to its corresponding Letter
function columnToLetter(column) {
 var temp, letter = '';
 while (column > 0)
 {
   temp = (column - 1) % 26;
   letter = String.fromCharCode(temp + 65) + letter;
   column = (column - temp - 1) / 26;
 }
 return letter;
}
