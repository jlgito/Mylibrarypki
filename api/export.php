<?php
require_once __DIR__.'/db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo "Missing id";
    exit;
}

$pdo = get_db();
$stmt = $pdo->prepare("SELECT pem FROM certificates WHERE id = :id");
$stmt->execute([':id'=>$id]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);

header("Content-Type: text/plain; charset=UTF-8");
header("Content-Disposition: attachment; filename=cert.pem");

echo $row['pem'];
