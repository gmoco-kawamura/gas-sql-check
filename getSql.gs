function getSql(folderId) {
  const fileName = 'SQL80.sql';  // 取得したいファイル名

  // フォルダ内の指定されたファイルを取得
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(fileName);
  
  // ファイルが見つかればその内容を文字列として取得
  if (files.hasNext()) {
    const file = files.next();
    const fileContent = file.getBlob().getDataAsString();  // ファイルの内容を文字列として取得
    Logger.log('ファイル内容: ' + fileContent);  // ログに出力
    return fileContent;  // 取得した文字列を返す
  } else {
    Logger.log('ファイル "' + fileName + '" が見つかりませんでした');
    return null;  // ファイルが見つからなかった場合は null を返す
  }
}
