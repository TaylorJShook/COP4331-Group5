<?php
// CORS for local dev
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
//

header('Content-Type: application/json; charset=utf-8');

function json_out($arr, $code=200){ http_response_code($code); echo json_encode($arr); exit; }

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) json_out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Invalid JSON"], 400);

$firstName = trim($in['firstName'] ?? '');
$lastName  = trim($in['lastName']  ?? '');
$phone     = trim($in['phone']     ?? '');
$email     = trim($in['email']     ?? '');
$userId    = intval($in['userId']  ?? 0);

if ($firstName === '' || $lastName === '' || $phone === '' || $email === '' || $userId <= 0) {
  json_out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"All fields are required"], 400);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
  $conn->set_charset('utf8mb4');

  $chk = $conn->prepare("SELECT ID FROM Users WHERE ID=?");
  $chk->bind_param("i", $userId);
  $chk->execute(); $chk->store_result();
  if ($chk->num_rows === 0) json_out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"User not found"], 400);
  $chk->close();

  $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?,?,?,?,?)");
  $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
  $stmt->execute();
  $newId = $stmt->insert_id;
  $stmt->close();
  $conn->close();

  json_out(["id"=>$newId,"firstName"=>$firstName,"lastName"=>$lastName,"error"=>""]);
} catch (mysqli_sql_exception $e) {
  json_out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"DB error: ".$e->getMessage()], 500);
}
