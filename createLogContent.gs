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
