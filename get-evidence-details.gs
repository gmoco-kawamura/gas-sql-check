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

function getLog(folderId) {
  const fileName1 = 'SQL80-1.log';  // 取得したいファイル名
  const fileName2 = 'SQL80-2.log';
  const fileName3 = 'SQL80-3.log';

  // フォルダ内の指定されたファイルを取得
  const folder = DriveApp.getFolderById(folderId);
  
  const fileNames = [fileName1, fileName2, fileName3];
  let totalExecutionTime = 0;
  let row = null;
  
  // 各ファイルから実行時間を取得し、平均値を計算
  fileNames.forEach(function(fileName, index) {
    const files = folder.getFilesByName(fileName);
    
    if (files.hasNext()) {
      const file = files.next();
      const fileContent = file.getBlob().getDataAsString();  // ファイルの内容を文字列として取得
      Logger.log('ファイル内容 (' + fileName + '): ' + fileContent);  // ログに出力

      // 最初のファイルで row の値を取得
      if (index === 0) {
        row = extractRowsInfo(fileContent);
      }
      
      // 実行時間を抽出して合計に追加
      const executionTime = extractExecutionTime(fileContent);
      if (executionTime !== null) {
        totalExecutionTime += executionTime;
      } else {
        Logger.log('ファイル "' + fileName + '" から実行時間が見つかりませんでした');
      }
    } else {
      Logger.log('ファイル "' + fileName + '" が見つかりませんでした');
    }
  });

  // 実行時間の平均値を計算
  const averageExecutionTime = (totalExecutionTime / fileNames.length).toFixed(3);

  // row と 平均実行時間 を返す
  return {
    row: row,
    averageExecutionTime: averageExecutionTime
  };
}

// row情報を抽出
function extractRowsInfo(logString) {
  const match = logString.match(/\d+ row\(s\)/);
  return match ? match[0] : null;
}

// 実行時間を抽出
function extractExecutionTime(logString) {
  const match = logString.match(/\d+\.\d+\ssec/);
  return match ? parseFloat(match[0]) : null;
}
