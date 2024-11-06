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
