function convertJsonToCsv(result) {
  // CSVのヘッダーを取得
  const headers = Object.keys(result[0]);
  let csvContent = headers.join(",") + "\n";

  // データ行を追加
  result.forEach(row => {
    const values = headers.map(header => {
      const cell = row[header];
      return cell === null || cell === undefined ? "" : cell.toString().replace(/"/g, '""'); // ダブルクオートをエスケープ
    });
    csvContent += '"' + values.join('","') + '"\n';
  });
  return csvContent;
}
