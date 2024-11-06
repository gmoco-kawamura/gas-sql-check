function saveCsv(csvContent, folderId) {
  // CSV を Blob に変換
  const blob = Utilities.newBlob(csvContent, 'text/csv', 'SQL80.csv');
  
  // フォルダ ID でフォルダを取得
  const folder = DriveApp.getFolderById(folderId);

  // フォルダに CSV ファイルを作成
  const file = folder.createFile(blob);
  // Logger.log('File created with ID: ' + file.getId());

  return file.getId(); // 作成したファイルの ID を返す
}

function saveSql(sqlContent, folderId) {
  // SQL コンテンツを Blob に変換し、ファイル名を指定
  const blob = Utilities.newBlob(sqlContent, 'application/sql', 'SQL80.sql');
  
  // フォルダ ID で対象フォルダを取得
  const folder = DriveApp.getFolderById(folderId);

  // フォルダに SQL ファイルを作成
  const file = folder.createFile(blob);
  // Logger.log('File created with ID: ' + file.getId());

  return file.getId(); // 作成したファイルの ID を返す
}

function saveLog(logContent, folderId, count) {
  // 0→1基準
  const num = count + 1;

  // ログ内容を Blob に変換し、ファイル名を指定
  const blob = Utilities.newBlob(logContent, 'text/plain', 'SQL80-' + num + '.log');
  
  // フォルダ ID で対象フォルダを取得
  const folder = DriveApp.getFolderById(folderId);

  // フォルダにログファイルを作成
  const file = folder.createFile(blob);
  // Logger.log('File created with ID: ' + file.getId());

  return file.getId(); // 作成したファイルの ID を返す
}
