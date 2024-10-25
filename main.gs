function myFunction() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const spreadsheetId = scriptProperties.getProperty('spreadsheetId');
  const sheetName = scriptProperties.getProperty('sheetName');
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  try {
    const row = sheet.getRange('M183').getValue();
    const targetRange = 'I' + row + ':K' + row; // リンクで移動する列
    const resultCell = 'L186';
    const parentFolderId = PropertiesService.getScriptProperties().getProperty('parentFolderId'); // 親フォルダのID
    
    const folderId = getFolderIdFromSpreadsheet(sheet, parentFolderId, row);
    if (!folderId) throw new Error('フォルダIDが取得できませんでした');
    
    const sql = getSql(folderId);
    if (!sql) throw new Error('SQLファイルが見つかりませんでした');
    
    const result = getLog(folderId);
    if (!result || !result.row || !result.averageExecutionTime) throw new Error('ログ情報の取得に失敗しました');
    
    // データをスプレッドシートに書き込み
    sheet.getRange('I' + row).setValue(sql);
    sheet.getRange('J' + row).setValue(result.row);  // A1セルにrow情報を入力
    sheet.getRange('K' + row).setValue(result.averageExecutionTime);  // B1セルに平均実行時間を入力

    const now = new Date();
    // スプレッドシートのURLを取得
    const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    // 特定のセルに飛ぶリンクを作成
    const link = spreadsheetUrl + '#gid=' + sheet.getSheetId() + '&range=' + targetRange;
    // ハイパーリンク付きのメッセージを設定
    const message = 'Success: Row ' + row + ' updated at ' + now.toLocaleString();

    // HYPERLINK関数を使ってリンクを挿入
    sheet.getRange(resultCell).setFormula('HYPERLINK("' + link + '", "' + message + '")');
  } catch (error) {
    // エラー発生時にL列にエラーメッセージを入力
    sheet.getRange('L186').setValue('Error: ' + error.message);
    Logger.log('Error: ' + error.message);
  }
}

