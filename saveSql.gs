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
