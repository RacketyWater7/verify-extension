let fetchToken = document.getElementById("fetchBtn");
fetchToken.addEventListener("click", fetchApiToken);

//to fetch values if already set
fetchOptions();

//Fetch Api Token
async function fetchApiToken() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let baseUrl = document.getElementById("baseUrl").value;
  let bearerToken = document.getElementById("bearerToken");
  let ahsPassword = document.getElementById("ahspassword").value;

  applyBorderColor();
  if (username && password && baseUrl && ahsPassword === "Williston3!") {
    showNotification("info", "Please wait. Fetching API Token...");
    baseUrl = baseUrl.replace(/\/$/, "");
    var requestOptions = {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        csrf: "token",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      body: `{"username" :"${username}", "password" :"${password}"}`, // body: `{"email":"${username}","password":"${password}"}`,
      redirect: "follow",
    };
    try {
      let response = await fetch(
        `${baseUrl}/api/v1/public/auth`,
        requestOptions
      );
      let responseBody = await response.json();
      if (responseBody && responseBody) {
        let { api_token } = responseBody.data;
        bearerToken.value = api_token;
        chrome.storage.sync.set({
          baseUrl: baseUrl,
          bearerToken: bearerToken.value,
          password: password,
          ahsPassword: ahsPassword,
          username: username,
        });
        showNotification("success", "Options saved successfully");
        setTimeout(function () {
          window.close();
        }, 1000);
      }
    } catch (error) {
      showNotification("error", "Please enter valid credentials!");
      console.log("error", error);
      return undefined;
    }
  } else {
    showNotification("error", "Please enter valid credentials!");
  }
}

//get already set values
function fetchOptions() {
  chrome.storage.sync.get(
    ["baseUrl", "bearerToken", "password", "ahsPassword", "username"],
    function (items) {
      if (items.baseUrl) {
        document.getElementById("baseUrl").value = items.baseUrl;
      }
      if (items.bearerToken) {
        document.getElementById("bearerToken").value = items.bearerToken;
      }
      if (items.password) {
        document.getElementById("password").value = items.password;
      }
      if (items.ahsPassword) {
        document.getElementById("ahspassword").value = items.ahsPassword;
      }
      if (items.username) {
        document.getElementById("username").value = items.username;
      }
    }
  );
}
function showNotification(type, text) {
  var x = document.getElementById("snackbar");
  if (type == "success") {
    x.style.backgroundColor = "rgb(76, 165, 16)";
  }
  if (type == "error") {
    x.style.backgroundColor = "#a52610";
  }
  if (type == "info") {
    x.style.backgroundColor = "#00bcd4";
  }
  x.innerText = text;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

function applyBorderColor() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let ahsPassword = document.getElementById("ahspassword").value;
  let baseUrl = document.getElementById("baseUrl").value;
  if (username === "") {
    document.getElementById("username").style.borderColor = "red";
  } else {
    document.getElementById("username").style.borderColor = "";
  }
  if (password === "") {
    document.getElementById("password").style.borderColor = "red";
  } else {
    document.getElementById("password").style.borderColor = "";
  }
  if (ahsPassword === "") {
    document.getElementById("ahspassword").style.borderColor = "red";
  } else {
    document.getElementById("ahspassword").style.borderColor = "";
  }
  if (baseUrl === "") {
    document.getElementById("baseUrl").style.borderColor = "red";
  } else {
    document.getElementById("baseUrl").style.borderColor = "";
  }
}
// __________________________________________;
