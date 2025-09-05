const urlBase = 'http://cop4331-group5.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let contacts = []; // Keep the last search results so Edit buttons can reference current values

// ============================================================================
// REUSED CODE FROM COLOR LAB
// ============================================================================
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	// Read fields from index.html
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	// Build JSON payload (login + password)
	let tmp = {login: login, password: password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "home.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 ) // If userId is missing/invalid, block access and send them to the login page
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// ============================================================================
// REGISTER (NEW)
// ==============================================================================

function doRegister()
{
	let fName = document.getElementById("firstName").value.trim();
	let lName = document.getElementById("lastName").value.trim();
	let login = document.getElementById("loginName").value.trim();
	let password = document.getElementById("loginPassword").value;

	document.getElementById("loginResult").innerHTML = "";

	if (!fName || !lName || !login || !password) // Small validation (client-side)
	{
		document.getElementById("loginResult").innerHTML = "Please fill out all fields.";
		return;
	}

	// var hashed = md5(password);
	// let payload = { firstName: fName, lastName: lName, login: login, password: hashed };

	let payload = { firstName: fName, lastName: lName, login: login, password: password };
	let jsonPayload = JSON.stringify(payload);

	let url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    // Show the server's message (e.g., "Username already exists", "Validation error", etc.)
                    document.getElementById("loginResult").innerHTML = jsonObject.error;
                    return;
                }

				document.getElementById("loginResult").innerHTML = "Registration successful. Redirecting to login...";
				setTimeout(function(){ window.location.href = "index.html"; }, 800);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

// ============================================================================
// CONTACTS: SEARCH / ADD / EDIT / DELETE
// ============================================================================

// Helper to safely show text inside HTML
function escapeHtml(s)
{
	if (s === null || s === undefined) return "";
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function searchContacts()
{
    let srch = document.getElementById("searchText").value.trim();
    document.getElementById("contactSearchResult").innerHTML = "";

    let payload = { search: srch, userId: userId };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    document.getElementById("contactSearchResult").innerHTML = jsonObject.error;
                    document.getElementById("results").innerHTML = "";
                    contacts = [];
                    return;
                }

                // Expect: { results: [ {id, firstName, lastName, phone, email}, ... ] }
                contacts = Array.isArray(jsonObject.results) ? jsonObject.results : [];

                document.getElementById("contactSearchResult").innerHTML =
                    contacts.length ? "Contact(s) retrieved" : "No contacts found";

                renderContacts(contacts);
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("contactSearchResult").innerHTML = err.message;
    }
}

function renderContacts(list)
{
	let bucket = document.getElementById("results");
	if (!bucket) return;

	if (!list || !list.length)
	{
		bucket.innerHTML = "";
		return;
	}

	let html = "";
	html += "<table style='width:100%; border-collapse: collapse;'>";
	html += "<thead>";
	html += "<tr>";
	html += "<th style='text-align:left; padding: 6px 4px;'>Name</th>";
	html += "<th style='text-align:left; padding: 6px 4px;'>Phone</th>";
	html += "<th style='text-align:left; padding: 6px 4px;'>Email</th>";
	html += "<th style='text-align:left; padding: 6px 4px;'>Actions</th>";
	html += "</tr>";
	html += "</thead>";
	html += "<tbody>";

	for (let i = 0; i < list.length; i++)
	{
		let c = list[i] || {};
		let id = c.id;

		let name  = escapeHtml((c.firstName || "") + " " + (c.lastName || ""));
		let phone = escapeHtml(c.phone || "");
		let email = escapeHtml(c.email || "");

		html += "<tr>";
		html += "<td style='padding: 6px 4px;'>" + name  + "</td>";
		html += "<td style='padding: 6px 4px;'>" + phone + "</td>";
		html += "<td style='padding: 6px 4px;'>" + email + "</td>";
		html += "<td style='padding: 6px 4px;'>";
		html += "<button class='buttons' style='width:auto;' onclick='editContact(" + i + ");'>Edit</button> ";
		html += "<button class='buttons' style='width:auto;' onclick='deleteContact(" + id + ");'>Delete</button>";
		html += "</td>";
		html += "</tr>";
	}

	html += "</tbody>";
	html += "</table>";

	bucket.innerHTML = html;
}

function addContact()
{
    let msg = document.getElementById("contactAddResult");
    if (msg) msg.innerHTML = "";

    let f = document.getElementById("addFirstName").value.trim();
    let l = document.getElementById("addLastName").value.trim();
    let p = document.getElementById("addPhone").value.trim();
    let e = document.getElementById("addEmail").value.trim();

    if (!f || !l)
    {
        if (msg) msg.innerHTML = "First and Last Name are required.";
        return;
    }

    let payload = { firstName: f, lastName: l, phone: p, email: e, userId: userId };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/AddContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    if (msg) msg.innerHTML = jsonObject.error;
                    return;
                }

                if (msg) msg.innerHTML = "Contact has been added";

                // Clear form
                document.getElementById("addFirstName").value = "";
                document.getElementById("addLastName").value  = "";
                document.getElementById("addPhone").value     = "";
                document.getElementById("addEmail").value     = "";

                // Refresh list
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        if (msg) msg.innerHTML = err.message;
    }
}

function editContact(index)
{
    let c = contacts[index];
    if (!c || !c.id) return;

    // Prompt for updated values (simple, demo-friendly)
    let newFirst = prompt("Edit First Name:", c.firstName || "");
    let newLast  = prompt("Edit Last Name:",  c.lastName  || "");
    let newPhone = prompt("Edit Phone:",      c.phone     || "");
    let newEmail = prompt("Edit Email:",      c.email     || "");

    let updated = {
        id: c.id,
        firstName: (newFirst || "").trim(),
        lastName:  (newLast  || "").trim(),
        phone:     (newPhone || "").trim(),
        email:     (newEmail || "").trim()
    };

    updateContact(updated);
}

function updateContact(updated)
{
    if (!updated || !updated.id) return;

    let payload = {
        id: updated.id,
        firstName: updated.firstName,
        lastName:  updated.lastName,
        phone:     updated.phone,
        email:     updated.email,
        userId:    userId
    };

    let jsonPayload = JSON.stringify(payload);
    let url = urlBase + '/UpdateContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    alert("Update failed: " + jsonObject.error);
                    return;
                }

                // Refresh the list after a successful update
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        alert(err.message);
    }
}


function deleteContact(contactId)
{
    if (!contactId) return;
    if (!confirm("Delete this contact?")) return;

    let payload = { id: contactId, userId: userId };
    let jsonPayload = JSON.stringify(payload);

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error)
                {
                    alert("Delete failed: " + jsonObject.error);
                    return;
                }

                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        alert(err.message);
    }

}
