const scriptProperties = PropertiesService.getScriptProperties();
const spreadsheetId = scriptProperties.getProperty('spreadsheetId');
const sheetName = 'test' //scriptProperties.getProperty('sheetName');
const settingSheetName = scriptProperties.getProperty('settingSheetName');
const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
const settingSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(settingSheetName);
const parentFolderId = PropertiesService.getScriptProperties().getProperty('parentFolderId'); // 親フォルダのID
const url = 'http://34.84.94.96:8080/execute-sql'; // ComputeEngineのAPIサーバーのURL

// // すべてのSQLを実行する関数
// function executeSqlQueries() {
//   const lastRow = sheet.getRange("A2:A").getValues().filter(String).length + 1;
//   for (let row = 2; row <= lastRow; row++) {
//     executeSqlQuery(row, false);
//   }
// }

// 単一行のSQLを実行する関数
function executeSqlQuery(row = null, isStandalone = true) {
  // rowの初期設定
  if(isStandalone) {
    row = settingSheet.getRange('C2').getValue();
    if (row === '') {
      Logger.log('"C2" is empty');
      settingSheet.getRange('C3').setValue('Error: C2セルに数値を入力してください。');
      return;
    }
  }

  // SQLクエリを取得
  const sqlQuery = sheet.getRange('I' + row).getValue();
  if (sqlQuery === '') {
    Logger.log(`SQL query at I${row} is empty`);
    return;
  }
  Logger.log('sql: ' + sqlQuery);

  // hostの選定
  const host = sqlQuery.trim().toLowerCase().startsWith('select') ? 'reader' : 'writer';
  Logger.log('Host: ' + host); 

  // リクエストオプションの設定
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      query: sqlQuery,
      host: host,
    }),
    muteHttpExceptions: true
  };

  try {
    const folderId = getFolderIdFromSheet(sheet, parentFolderId, row);
    let totalExecutionTime = 0;

    for (let count = 0; count < 3; count++) {
      // APIサーバーにリクエストを送信
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
      if (result.error) {
        sheet.getRange('N' + row).setValue(result.error);
        return;
      }
      totalExecutionTime += result.executionTime; // 合計実行時間

      // 取得結果をログ出力
      Logger.log('result: '+ JSON.stringify(result.data));
      Logger.log('rowCount: ' + result.rowCount);
      Logger.log('executionTime: '+ result.executionTime);
      Logger.log('startTime: ' + result.startTime);

      if (count === 0) {
        // csv保存
        const csvContent = convertJsonToCsv(result.data);
        const csvFileId = saveCsv(csvContent, folderId);
        Logger.log('Saved CSV File Id: ' + csvFileId);

        // sql保存
        const sqlFileId = saveSql(sqlQuery, folderId);
        Logger.log('Saved Sql File Id: ' + sqlFileId);

        // データをスプレッドシートに書き込み
        // sheet.getRange('J' + row).setValue(result.rowCount);  // 対象レコード数
      }

      // log保存
      const logContent = createLogContent(result.startTime, sqlQuery, result.rowCount, result.executionTime);
      const logFileId = saveLog(logContent, folderId, count);
      Logger.log('Saved Log File Id: ' + logFileId);
    }
    // 平均処理時間
    const averageExecutionTimeSec = ((totalExecutionTime / 3) / 1000).toFixed(3);
    // データをスプレッドシートに書き込み
    sheet.getRange('L' + row).setValue(averageExecutionTimeSec);  // 実行時間3回平均

  } catch (error) {
    // エラー発生時にL列にエラーメッセージを入力
    settingSheet.getRange('C3').setValue(error.message);
    Logger.log(error.toString());
  }
  return;
}

// // エビデンスを元にスプレッドシートにデータを入力する関数
// function inputSheetFromEvidence() {
//   const scriptProperties = PropertiesService.getScriptProperties();
//   const spreadsheetId = scriptProperties.getProperty('spreadsheetId');
//   const sheetName = scriptProperties.getProperty('sheetName');
//   const settingSheetName = scriptProperties.getProperty('settingSheetName');
//   const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
//   const settingSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(settingSheetName);

//   try {
//     const row = settingSheet.getRange('C2').getValue();
//     const resultCell = 'C3';
//     const parentFolderId = PropertiesService.getScriptProperties().getProperty('parentFolderId'); // 親フォルダのID
    
//     const folderId = getFolderIdFromSheet(sheet, parentFolderId, row);
//     if (!folderId) throw new Error('フォルダIDが取得できませんでした');
    
//     const sql = getSql(folderId);
//     if (!sql) throw new Error('SQLファイルが見つかりませんでした');
    
//     const result = getLog(folderId);
//     if (!result || !result.row || !result.averageExecutionTime) throw new Error('ログ情報の取得に失敗しました');
    
//     // データをスプレッドシートに書き込み
//     sheet.getRange('I' + row).setValue(sql);
//     sheet.getRange('J' + row).setValue(result.row); 
//     sheet.getRange('K' + row).setValue(result.averageExecutionTime); 

//     // 結果の入力
//     const now = new Date();
//     const message = 'Success: Row ' + row + ' updated at ' + now.toLocaleString();
//     settingSheet.getRange(resultCell).setValue(message);
//   } catch (error) {
//     // エラー発生時にL列にエラーメッセージを入力
//     settingSheet.getRange('C3').setValue('Error: ' + error.message);
//     Logger.log('Error: ' + error.message);
//   }
// }