function getFolderIdFromSpreadsheet(sheet, parentFolderId, row) {
  try {
    const cellB = getNonEmptyCell(sheet, 'B', row);  // 空白であれば上のセルを参照
    const cellC = getNonEmptyCell(sheet, 'C', row);  // 空白であれば上のセルを参照
    const cellH = 'H' + row;
    
    // フォルダ名を取得(コントロール名)
    const folderNameB = getFolderName(true, sheet, cellB);
    const folderNameC = getFolderName(false, sheet, cellC);
    let folderNameH = getFolderName(false, sheet, cellH);
    folderNameH = padNumberInString(folderNameH);
    const folderSuccessName = 'success';
  
    // フォルダIDを取得
    const folderBId = getFolderId(parentFolderId, folderNameB);
    if (!folderBId) throw new Error('フォルダ "' + folderNameB + '" が見つかりませんでした');
    
    const folderCId = getFolderId(folderBId, folderNameC);
    if (!folderCId) throw new Error('フォルダ "' + folderNameC + '" が見つかりませんでした');
    
    const folderHId = getFolderId(folderCId, folderNameH);
    if (!folderHId) throw new Error('フォルダ "' + folderNameH + '" が見つかりませんでした');
    
    const folderSuccessId = getFolderId(folderHId, folderSuccessName);
    if (!folderSuccessId) throw new Error('フォルダ "success" が見つかりませんでした');
    
    return folderSuccessId;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return null;
  }
}


function getNonEmptyCell(sheet, column, row) {
  let currentRow = row;
  let cellValue = sheet.getRange(column + currentRow).getValue();
  
  // セルが空白の場合は上のセルを取得（空白でないセルが見つかるまで）
  while (cellValue === '' && currentRow > 1) {
    currentRow--;  // 上のセルに移動
    cellValue = sheet.getRange(column + currentRow).getValue();
  }
  
  // 最終的に空白でないセルの位置を返す
  return column + currentRow;
}

function getFolderName(insertSpaceBeforeUpperCase = false, sheet, cell) {
  let folderName = sheet.getRange(cell).getValue();
  
  // 改行がある場合、最初の改行より前の部分を取得
  folderName = folderName.split('\n')[0];  // 改行で分割して最初の部分を取得

  // 拡張子を削除
  folderName = folderName.replace(/\.[^/.]+$/, "");  

  // 大文字の前にスペースを挿入し、前後の余計なスペースを削除
  if (insertSpaceBeforeUpperCase){
    folderName = folderName.replace(/([A-Z])/g, ' $1').trim();
  }
  return folderName;
}

function padNumberInString(inputString) {
  // 正規表現で文字列中の数字部分を特定し、2桁になるようにゼロパディング
  return inputString.replace(/\d+/, function(match) {
    return match.padStart(2, '0');  // 数字部分を2桁にゼロパディング
  });
}

function getFolderId(parentFolderId, folderName) {
  // 親フォルダ「SQL_エビデンス」を取得
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  
  // 親フォルダ内で指定されたフォルダ名のフォルダを探す
  const folders = parentFolder.getFoldersByName(folderName);
  
  // フォルダが見つかればフォルダIDを取得
  if (folders.hasNext()) {
    const folder = folders.next();
    const folderId = folder.getId();
    Logger.log('フォルダ "' + folderName + '" のID: ' + folderId);  // フォルダIDをログに出力
    return folderId;
  } else {
    Logger.log('フォルダ "' + folderName + '" は見つかりませんでした');
    return null;
  }
}
