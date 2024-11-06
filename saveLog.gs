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
