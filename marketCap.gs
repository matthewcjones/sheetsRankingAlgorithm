//Global Declations
var ss = SpreadsheetApp.getActiveSpreadsheet();
var companySheet = ss.getSheetByName('CompanySheet');
var tickerRow = 5; //This correponds to the string "Ticker" in companySheet, if this changes we will need to update

function getMarketCap() {

  var companyTickers = getTickers(); //gets an object of compawny Tickers
  //Logger.log(companyTickers);

  var marketCapValues = getMarketCapValues(companyTickers); //External API with IEX
  //Logger.log(marketCapValues);

  setMarketCapValuesInSheet(marketCapValues); //writes Market Cap Values into sheets
}

function setMarketCapValuesInSheet(marketCapValues) {

  for (i = 0; i < marketCapValues.length; i++) {
    var columnPosition = i + 2;
    companySheet.getRange(tickerRow + 1, columnPosition).setValue(marketCapValues[i])
  }
}

function getMarketCapValues(companyTickers) {

  // base format "https://api.iextrading.com/1.0/stock/aapl/stats"
  var marketCapValues = [];

  for (var i = 0; i < companyTickers[0].length; i++) {
    var baseURL = "https://api.iextrading.com/1.0/stock/" + companyTickers[0][i] + "/stats"
    var response = JSON.parse(UrlFetchApp.fetch(baseURL));
    marketCapValues.push(response.marketcap);
  }
  return marketCapValues;
}


function getTickers() {
  var lastColumn = companySheet.getLastColumn();

  var companyTickers = companySheet.getRange(tickerRow,2, 1, lastColumn - 1).getValues();
  return companyTickers;
}
