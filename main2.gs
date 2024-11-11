// 田中さん用
// SQLを実行する関数
function executeSqlQuery2() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('spreadsheetId');
  const sheetName = scriptProperties.getProperty('sheetName');
  const settingSheetName = 'setting2'; //scriptProperties.getProperty('settingSheetName');
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  const settingSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(settingSheetName);
  const parentFolderId = PropertiesService.getScriptProperties().getProperty('parentFolderId'); // 親フォルダのID
  const url = 'http://34.84.94.96:8080/execute-sql'; // ComputeEngineのAPIサーバーのURL

  // rowの初期化
  rawValue = settingSheet.getRange('C2').getValue();
  if (rawValue === '') {
    Logger.log('ERROR: "C2" is empty');
    return;
  }
  let uniqueValues = rawValue.toString().includes("_") ? rawValue.split("_") : [rawValue.toString()];
  uniqueValues.sort((a, b) => parseInt(a) - parseInt(b));

  // 取得した値を `for` 文で使用
  for (let i = 0; i < uniqueValues.length; i++) {
    const row = parseInt(uniqueValues[i]); // 数値に変換
    Logger.log(`========== START PROCESSING: Row ${row} ==========`);

    // SQLクエリを取得
    const sqlQuery = sheet.getRange('I' + row).getValue();
    if (sqlQuery === '') {
      Logger.log(`ERROR: SQL query at I${row} is empty`);
      Logger.log(`========== END PROCESSING: Row ${row} ==========`);
      continue;
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
      if (!folderId) {
        Logger.log(`========== END PROCESSING: Row ${row} ==========`);
        continue;
      }      
      let totalExecutionTime = 0;

      for (let count = 0; count < 3; count++) {
        let rowCount = 0;
        // APIサーバーにリクエストを送信
        const response = UrlFetchApp.fetch(url, options);
        const result = JSON.parse(response.getContentText());
        if (result.error) {
          // エラー発生時にN列にエラーメッセージを入力
          sheet.getRange('N' + row).setValue(result.error);
          return;
        }
        totalExecutionTime += result.executionTime; // 合計実行時間

        // 取得結果をログ出力
        Logger.log('result.data: '+ JSON.stringify(result.data));
        Logger.log('rowCount: ' + result.rowCount); 
        Logger.log('executionTime: '+ result.executionTime);
        Logger.log('startTime: ' + result.startTime);

        if (result.rowCount) {
          rowCount = result.rowCount - 1; // indexの1行をCountから引く
        }
        else {
          rowCount = result.rowCount;
        }

        if (count === 0) {
          if (result.data.length) {
            // csv保存
            const csvContent = convertJsonToCsv(result.data);
            const csvFileId = saveCsv(csvContent, folderId);
            Logger.log('Saved Csv File Id: ' + csvFileId);
          }

          // sql保存
          const sqlFileId = saveSql(sqlQuery, folderId);
          Logger.log('Saved Sql File Id: ' + sqlFileId);

          // データをスプレッドシートに書き込み
          sheet.getRange('J' + row).setValue(rowCount);  // 対象レコード数
        }

        // log保存
        const logContent = createLogContent(result.startTime, sqlQuery, rowCount, result.executionTime);
        const logFileId = saveLog(logContent, folderId, count);
        Logger.log('Saved Log File Id: ' + logFileId);
      }
      // 平均処理時間
      const averageExecutionTimeSec = ((totalExecutionTime / 3) / 1000).toFixed(3);
      // データをスプレッドシートに書き込み
      sheet.getRange('L' + row).setValue(averageExecutionTimeSec);  // 実行時間3回平均
      Logger.log(`Row ${row} processed successfully.`);
    } catch (error) {
      Logger.log(error.toString());
    }
    Logger.log(`========== END PROCESSING: Row ${row} ==========`);
  }
}
