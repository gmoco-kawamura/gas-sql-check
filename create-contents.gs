function createLogContent(startTime, sqlQuery, rowCount, executionTime) {
  // Unixタイムスタンプ（ミリ秒）を hh:mm:ss の形式に変換
  const date = new Date(startTime);
  const formattedTime = date.toTimeString().split(' ')[0]; // 時間部分のみを取得（hh:mm:ss）

  // SQL クエリ内の改行や余分な空白を削除
  const cleanedSql = sqlQuery.replace(/\s+/g, ' ').trim();

  // 実行時間を秒単位に変換（ms → sec）
  const executionTimeSec = (executionTime / 1000).toFixed(3);

  // ログフォーマットに整形
  const logContent = `${formattedTime}\t${cleanedSql}\t${rowCount} row(s) returned\t${executionTimeSec} sec`;
  
  return logContent;
}


function convertJsonToCsv(result) {
  // CSVのヘッダーを取得
  const headers = Object.keys(result[0]);
  let csvContent = headers.join(",") + "\n";

  // ISO 8601 日付の正規表現パターン
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

  // データ行を追加
  result.forEach(row => {
    const values = headers.map(header => {
      const cell = row[header];
      if (cell === undefined) {
        return ""; // 空セルの処理
      }
      else if (cell === null) {
        return "NULL"; // NULLの処理
      }
      const cellString = cell.toString();
      // ISO 8601 形式の場合はフォーマットを変更
      if (isoDatePattern.test(cellString)) {
        const formattedDate = cellString.replace('T', ' ').split('.')[0]; // "T"を" "に置き換え、ミリ秒を削除
        return `"${formattedDate}"`; // ダブルクォーテーションで囲む
      }
      return cellString.replace(/"/g, '""'); // ダブルクォーテーションのエスケープ
    });
    csvContent += values.join(",") + "\n";
  });
  return csvContent;
}

