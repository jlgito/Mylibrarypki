<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=UTF-8');

$pdo = get_db();

$out = [
    'total' => 0,
    'pub' => 0,
    'priv' => 0,
    'exp30' => 0,
    'exp90' => 0,
    'recent' => []
];

// Total certificats
$out['total'] = (int)$pdo->query("SELECT COUNT(*) FROM certificates")->fetchColumn();

// Clés publiques
$out['pub'] = (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE type='pub'")->fetchColumn();

// Clés privées
$out['priv'] = (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE type='priv'")->fetchColumn();

// Expiration dans 30 jours
$out['exp30'] = (int)$pdo->query("
    SELECT COUNT(*) FROM certificates
    WHERE validity IS NOT NULL
    AND date(substr(validity, 12)) <= date('now', '+30 days')
")->fetchColumn();

// Expiration dans 90 jours
$out['exp90'] = (int)$pdo->query("
    SELECT COUNT(*) FROM certificates
    WHERE validity IS NOT NULL
    AND date(substr(validity, 12)) <= date('now', '+90 days')
")->fetchColumn();

// Derniers ajouts
$out['recent'] = $pdo->query("
    SELECT filename, type
    FROM certificates
    ORDER BY id DESC
    LIMIT 5
")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($out);
