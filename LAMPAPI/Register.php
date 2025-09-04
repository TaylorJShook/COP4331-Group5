<?php
// ---------- CORS for local dev ----------
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
// 

header('Content-Type: application/json; charset=utf-8');
// error_reporting(E_ALL); ini_set('display_errors', 1); // uncomment while debugging

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    returnError('Invalid JSON');
    exit;
}

$first = trim($in['firstName'] ?? '');
$last  = trim($in['lastName'] ?? '');
$login = trim($in['login'] ?? '');
$pass  = trim($in['password'] ?? '');

if ($first === '' || $last === '' || $login === '' || $pass === '') {
    returnError('Missing required fields');
    exit;
}

// DB connect (use your creds)
$conn = new mysqli('localhost', 'xxx', 'xxx', 'COP4331');
if ($conn->connect_error) {
    returnError('DB connection failed');
    exit;
}

// Optional: check duplicate login
$chk = $conn->prepare('SELECT ID FROM Users WHERE Login = ?');
$chk->bind_param('s', $login);
$chk->execute();
$chk->store_result();

if ($chk->num_rows > 0) {
    $chk->close();
    $conn->close();
    returnError('Login already exists');
    exit;
}
$chk->close();

// INSERT (prepared)
$ins = $conn->prepare(
    'INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?,?,?,?)'
);
$ins->bind_param('ssss', $first, $last, $login, $pass); // pass can be plain or md5-hash (match Login.php)

if (!$ins->execute()) {
    $ins->close();
    $conn->close();
    returnError('Insert failed');
    exit;
}

$id = $ins->insert_id;
$ins->close();
$conn->close();

echo json_encode([
    'id'        => $id,
    'firstName' => $first,
    'lastName'  => $last,
    'login'     => $login,
    'error'     => ''
]);
exit;

// ---- helpers ----
function returnError($msg) {
    echo json_encode([
        'id'        => 0,
        'firstName' => '',
        'lastName'  => '',
        'login'     => '',
        'error'     => $msg
    ]);
}
?>
