<?php

    $inData = getRequestInfo();

    $userId = isset($inData["userId"]) ? intval($inData["userId"]) : 0;
    $search = isset($inData["search"]) ? $inData["search"] : "";

    $searchResults = "";
    $searchCount = 0;

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $like = "%" . $search . "%";

        $stmt = $conn->prepare(
            "SELECT ID, FirstName, LastName, Phone, Email
             FROM Contacts
             WHERE UserID = ? AND (
                   FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?
             )"
        );
        $stmt->bind_param("issss", $userId, $like, $like, $like, $like);
        $stmt->execute();
        $result = $stmt->get_result();

        while( $row = $result->fetch_assoc() )
        {
            if( $searchCount > 0 )
            {
                $searchResults .= ",";
            }

            $searchResults .=
                '{"ID":'        . $row["ID"] .
                ',"FirstName":"' . $row["FirstName"] .
                '","LastName":"'  . $row["LastName"] .
                '","Phone":"'     . $row["Phone"] .
                '","Email":"'     . $row["Email"] . '"}';

            $searchCount++;
        }

        $stmt->close();
        $conn->close();

        if( $searchCount == 0 )
        {
            returnWithError("No Records Found");
        }
        else
        {
            returnWithInfo( $searchResults );
        }
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithInfo( $searchResults )
    {
        $retValue = '{"results":[' . $searchResults . '],"error":""}';
        sendResultInfoAsJson( $retValue );
    }

?>
