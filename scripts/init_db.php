<?php
$dbFile = __DIR__ . '/../data/db.sqlite';
@mkdir(dirname($dbFile), 0750, true);
if (file_exists($dbFile)) {
  echo "DB exists: $dbFile\n";
  exit(0);
}
$pdo = new PDO('sqlite:' . $dbFile);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$sql = file_get_contents(__DIR__ . '/../schema.sql');
$pdo->exec($sql);
echo "DB created at $dbFile\n";
