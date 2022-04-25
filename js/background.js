try {
  importScripts("html2pdf.bundle.min.js", "canvg.min.js");
} catch (e) {
  console.log(e);
}

// window.onerror = function (error, url, line) {
//   if (url.includes("content-script.js") || url.includes("background.js")) {
//     let log = {
//       description: `Line: ${line} Error:${error} URL: ${url}`,
//       result: "failure",
//       level: "error",
//     };

//     chrome.storage.sync.get(["baseUrl", "bearerToken"], function (result) {
//       console.log("result", result);
//       if (result.baseUrl) {
//         baseUrl = result.baseUrl.replace(/\/$/, "");
//         bearerToken = result.bearerToken;
//         insertLog(log, baseUrl, bearerToken);
//         //insertLog(log, 'https://jazzhr.gotomy.dev', '379|qmf7erBlPpZYH7oasaotCZb8oAXo1dgoCUcWTeia')
//       }
//     });
//   }
// };

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let {
    prospectEmail,
    baseUrl,
    bearerToken,
    type,
    record,
    firstName,
    lastName,
    siteName,
    currentDate,
    data,
    doc,
    id,
  } = request;
  switch (type) {
    case "fetchCandidateDetails": {
      fetchCandidateDetails(baseUrl, bearerToken, prospectEmail).then(
        (response) => {
          if (response) {
            let { fail, data } = response;
            if (data) {
              let responseArr = data;
              let fieldsArr = [];
              responseArr.forEach((field) => {
                let data = {};
                data[field.name] = field.value;
                fieldsArr.push(data);
              });
              sendResponse({
                fields: fieldsArr,
              });
            } else if (fail) {
              sendResponse(response);
            }
          } else sendResponse();
        }
      );
      return true;
    }
    case "postRecord": {
      postRecord(
        baseUrl,
        bearerToken,
        record,
        prospectEmail,
        firstName,
        lastName,
        siteName,
        currentDate
      ).then((response) => {
        if (response.fail) {
          sendResponse(response);
        } else {
          let log = {
            description: `${siteName} verification done on ${
              prospectEmail.split("@")[0]
            }`,
          };

          insertLog(log, baseUrl, bearerToken);
          sendResponse({
            sent: true,
          });
        }
      });
      return true;
    }
    case "postData": {
      sendData(baseUrl, bearerToken, data).then((response) => {
        sendResponse(response);
      });
      return true;
    }
    case "postDoc": {
      sendDocument(baseUrl, bearerToken, doc, id).then((response) => {
        sendResponse(response);
      });
      return true;
    }
    case "fetchAhsRecord": {
      fetchAhsRecord(baseUrl, bearerToken, prospectEmail).then((response) => {
        sendResponse(response);
      });
      return true;
    }
    case "fetchAhsStatus": {
      fetchVerficationStatus(baseUrl, bearerToken, prospectEmail).then(
        (response) => {
          sendResponse(response);
        }
      );
      return true;
    }
    case "insertLog": {
      let log = {
        ...request.payload,
      };
      chrome.storage.sync.get(["baseUrl", "bearerToken"], function (result) {
        if (result.baseUrl) {
          baseUrl = result.baseUrl.replace(/\/$/, "");
          bearerToken = result.bearerToken;
          insertLog(log, baseUrl, bearerToken);
          // insertLog(log, 'https://jazzhr.gotomy.dev', '379|qmf7erBlPpZYH7oasaotCZb8oAXo1dgoCUcWTeia')
        }
      });

      return true;
    }
  }
});

/**
 * This function fetches the candidates details
 * the details are form fields that are to be populated in the verification websites
 * @param {string} baseUrl | base url of the api
 * @param {string} bearerToken | token for the authorization of user
 * @param {string} prospectEmail | the applicant id
 */

async function fetchCandidateDetails(baseUrl, bearerToken, prospectEmail) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${bearerToken}`);
    myHeaders.append("Accept", "application/json");
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: myHeaders,
    };

    let response = await fetch(
      `${baseUrl}/api/v1/documents/${prospectEmail}`,
      requestOptions
    );
    let responseBody = await response.json();
    return responseBody;
  } catch (error) {
    return undefined;
  }
}

/**
 * This function posts record to documents end point which is then shown in jazz hr
 * documnents tab in candidate's profile
 * @param {string} baseUrl | base url of the api
 * @param {string} bearerToken | token for the authorization of user
 * @param {string} record | record to be posted
 * @param {string} prospectEmail | the applicant id
 * @param {string} firstName | first name of candidate
 * @param {string} lastName | last name of candidate
 * @param {string} siteName | the name of the site where record was verified
 */

async function postRecord(
  baseUrl,
  bearerToken,
  record,
  prospectEmail,
  firstName,
  lastName,
  siteName,
  currentDate
) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${bearerToken}`);
    myHeaders.append("Accept", "application/json");

    var formdata = new FormData();

    formdata.append("applicant_id", prospectEmail);
    formdata.append(
      "doc_name",
      `${firstName}${lastName}${siteName}-${currentDate}.pdf`
    );
    formdata.append("doc_data", record);
    formdata.append("site_name", siteName.toLowerCase());

    var requestOptions = {
      headers: myHeaders,
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    let response = await fetch(
      `${baseUrl}/api/v1/save-applicant-doc`,
      requestOptions
    );
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

/**
 * this function fetches the ahs record of the candidate
 * return object having the from and to date range and name of candidate
 * @param {string} baseUrl
 * @param {string} bearerToken
 * @param {string} prospectEmail
 */

async function fetchAhsRecord(baseUrl, bearerToken, prospectEmail) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${bearerToken}`);
    myHeaders.append("Accept", "application/json");
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: myHeaders,
    };

    let response = await fetch(
      `${baseUrl}/api/v1/site-validation-check/${prospectEmail}/ahs_child`,
      requestOptions
    );
    let responseBody = await response.json();
    return responseBody;
  } catch (error) {
    return undefined;
  }
}

/**
 * this function fetches the verification status of websites for the candidate
 * @param {string} baseUrl
 * @param {string} bearerToken
 * @param {string} prospectEmail
 */

async function fetchVerficationStatus(baseUrl, bearerToken, prospectEmail) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${bearerToken}`);
  myHeaders.append("Accept", "application/json");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
    headers: myHeaders,
  };
  try {
    let response = await fetch(
      `${baseUrl}/api/v1/site-validation-check/${prospectEmail}`,
      requestOptions
    );
    let responseBody = await response.json();
    return responseBody;
  } catch (error) {
    return undefined;
  }
}

async function insertLog(data, endpoint, bearerToken) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${bearerToken}`);
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  let formData = new URLSearchParams();

  formData.append("origin", "Verification Extension");

  if (data.description) {
    formData.append("description", data.description);
  }
  if (data.type) {
    formData.append("type", data.type);
  }

  if (data.level) {
    formData.append("level", data.level);
  }

  if (data.result) {
    formData.append("result", data.result);
  }

  var requestOptions = {
    method: "POST",
    body: formData,
    headers: myHeaders,
  };

  fetch(`${endpoint}/api/v1/log`, requestOptions)
    .then((res) => {
      res.json();
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}
