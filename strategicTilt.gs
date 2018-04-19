//creates the number of votes per user depending on number of users, and performance

//Global Declarations
var ss = SpreadsheetApp.getActiveSpreadsheet();
var rankingTable = ss.getSheetByName("rankingTable");


function createStrategicTile() {

  var getScoreArray = [];
  getScore(getScoreArray);
  var duplicateGetScoreArray = getScoreArray.slice()

  var mean = getAverage(getScoreArray); //get the mean of the data

  var standardDeviation = getStandardDeviation(duplicateGetScoreArray); //get the standard deviation of the data

  var normalDistribution = standardise(duplicateGetScoreArray, mean, standardDeviation); //standardised the distribution to standardised normal

  var positiveBounds = getPositiveBounds(normalDistribution); //increase the values in the array to be bounded by negative 0 - this is mathmatically unsound but quick for MVP

  var votingPower = getVotingPower(positiveBounds); //determins the number of votes each user should have

  writeValues(votingPower); //write the values into column next to user
}

//push an array into last empty column
function writeValues(array) {
  var lastColumn = rankingTable.getLastColumn() + 1;

  for (i = 0 ; i < array.length; i++ ) {
    rankingTable.getRange(i + 1 , lastColumn).setValue(array[i]);
  }
}

//applies the normal distribution to the total amount of values in the array.
function getVotingPower(array) {

  var voting = [];
  var lastRow = rankingTable.getLastRow();
  var sum = 0

  for (var i = 0; i < array.length; i++) {
    sum += array[i];
  }

  for (var i = 0; i < array.length; i++) {
    var temp = (lastRow / sum) * array[i];
    voting.push(temp);
  }
  return voting;
}

//appreciates the values to makes the samllest number a zero.
function getPositiveBounds(array) {

  var positiveBounds = [];

 Array.min = function( array ){
    return Math.min.apply( Math, array );
}; //don't really understand this but look to https://stackoverflow.com/questions/8934877/obtain-smallest-value-from-array-in-javascript

  var minimum = Array.min(array);

  for (var i = 0; i < array.length; i ++) {
    var temp = array[i] - minimum;
    positiveBounds.push(temp);
  }
  return positiveBounds;
}

function standardise(array, mean, stDEV) {

  var standardiseFigures = [];
  for (var i = 0; i < array.length; i ++) {
    var temp = (array[i] - mean)/stDEV;
    standardiseFigures.push(temp);
  }
  return standardiseFigures;
}

//get average of an array, need to deal with boolean here as not processing currently
function getStandardDeviation(values){
  var avg = getAverage(values);

  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = getAverage(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function getAverage(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

//get all the values in column 3, and puts them into an array
function getScore(array) {

  var lastRow = rankingTable.getLastRow();
  var values = rankingTable.getRange(1,2,lastRow,1).getValues();

  for (var i = 0; i < values.length; i++) {
    array.push(values[i][0]);
  }
  return array;
}



//var numberOfUSer = count number of users
//find means of the data
//find standard devation of the data

//standardise the data - (value - mean)/ standard deviation

//increase the values of the figure by the value of the lowest figure.
//Sum that figure = aAUC


//voting power = numberOfUers/aAUC * individual standardised data