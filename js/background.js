try {
  importScripts("html2pdf.bundle.min.js");
} catch (e) {
  console.log(e);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let { baseUrl, bearerToken, type, data, doc, id } = request;
  switch (type) {
    case "postData": {
      sendData(baseUrl, bearerToken, data).then((response) => {
        sendResponse(response);
        return true;
      });
      return true;
    }
    case "postDoc": {
      sendDocument(baseUrl, bearerToken, doc, id).then((response) => {
        sendResponse(response);
        return true;
      });
      return true;
    }
  }
});

/**
 * This function posts record to documents end point which is then shown in admin panel
 * documnents tab in candidate's profile
 * @param {string} baseUrl | base url of the api
 * @param {string} bearerToken | token for the authorization of user
 * @param {object} data | data to be posted
 */
async function sendData(baseUrl, bearerToken, data) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${bearerToken}`);
    myHeaders.append("Accept", "application/json");

    var formdata = new FormData();

    formdata.append("first_name", data.fname);
    formdata.append("last_name", data.lname);
    formdata.append("middle_name", data.mname);
    formdata.append("alternate_first_name_1", data.altfname1);
    formdata.append("alternate_last_name_1", data.altlname1);
    formdata.append("alternate_first_name_2", data.altfname2);
    formdata.append("alternate_last_name_2", data.altlname2);
    formdata.append("birthday", data.bday);
    formdata.append("birth_place", data.birthplace);
    formdata.append("ssn", data.ssn);
    formdata.append("last_4_ssn", data.last4ssn);
    formdata.append("street", data.street);
    formdata.append("city", data.city);
    formdata.append("state", data.state);
    formdata.append("zip", data.zip);
    formdata.append("gender", data.gender);
    formdata.append("keyword", data.keyword);
    formdata.append("email", data.email);

    var requestOptions = {
      headers: myHeaders,
      method: "POST",
      body: formdata,
    };

    let response = await fetch(`${baseUrl}/api/v1/usersData`, requestOptions);
    let responseBody = response.json();
    return responseBody;
  } catch (error) {
    console.log(error);
  }
}

/**
 * This function posts record to documents end point which is then shown in admin panel
 * documnents tab in candidate's profile
 * @param {string} baseUrl | base url of the api
 * @param {string} bearerToken | token for the authorization of user
 * @param {string} doc | document to be posted
 * @param {string} id | id to be used to update the respective data
 */
async function sendDocument(baseUrl, bearerToken, doc, id) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${bearerToken}`);
    myHeaders.append("Accept", "application/json");
    var formdata = new FormData();

    formdata.append("_method", "PUT");
    formdata.append(Object.keys(doc)[0], doc[Object.keys(doc)[0]]);

    var requestOptions = {
      headers: myHeaders,
      method: "POST",
      body: formdata,
    };

    let response = await fetch(
      `${baseUrl}/api/v1/usersData/${id}`,
      requestOptions
    );
    let responseBody = response.json();
    return responseBody;
  } catch (error) {
    console.log(error);
  }
}
