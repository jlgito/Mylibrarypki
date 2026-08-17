<?php
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=UTF-8');

try {
    require_once __DIR__ . '/db.php'; // adapte si besoin
    $pdo = get_db();

    $out = [
        'total' => (int)$pdo->query("SELECT COUNT(*) FROM certificates")->fetchColumn(),
        'pub'   => (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE type='pub'")->fetchColumn(),
        'priv'  => (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE type='priv'")->fetchColumn(),
        'exp30' => (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE validity IS NOT NULL AND date(validity) <= date('now', '+30 days')")->fetchColumn(),
        'exp90' => (int)$pdo->query("SELECT COUNT(*) FROM certificates WHERE validity IS NOT NULL AND date(validity) <= date('now', '+90 days')")->fetchColumn(),
        'recent'=> $pdo->query("SELECT filename, type FROM certificates ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC)
    ];

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
