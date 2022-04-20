let baseUrl = "";
let bearerToken = "";

window.onload = function () {
  fetchApiKey();
};

function insertFailLog(description) {
  chrome.runtime.sendMessage(
    {
      type: "insertLog",
      payload: {
        description: description,
        result: "failure",
        level: "error",
      },
    },
    function (response) {}
  );
}

window.onerror = function (error, url, line) {
  if (url.includes("content-script.js") || url.includes("background.js")) {
    let logDes = `Line: ${line} Error:${error} URL: ${url}`;
    insertFailLog(logDes);
  }
};

/**
 * Fetch API Key from chrome storage
 */
function fetchApiKey() {
  chrome.storage.sync.get(["baseUrl", "bearerToken"], function (result) {
    console.log("result: ", result);
    try {
      console.log(result);
      if (result.baseUrl) {
        baseUrl = result.baseUrl.replace(/\/$/, "");
        bearerToken = result.bearerToken;
        init();
        // window.addEventListener("load", init(), false);
      } else {
        vNotify.error({ text: "Set API Url" });
        console.log("came in negative");
        // window.addEventListener("load", init(), false);
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in fetchApiKey() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * check for the pathname and follow up functions execution
 */
// https://secure.vermont.gov/DPS/criminalrecords/subscriber/request.php
function init() {
  window.addEventListener(
    "hashchange",
    function () {
      console.log("hash");
      let url = window.location.href;
      url = url.split("/");
      if (
        url[url.length - 1] === "add" &&
        url[url.length - 2] === "verification_form"
      ) {
        let btnV = document.getElementById("verifybtn");
        if (btnV) {
        } else {
          submitVerificationForm();
        }
      }
    },
    false
  );
  try {
    let { pathname, search } = window.location;
    console.log(`pathname`, pathname);
    switch (pathname) {
      case "/DPS/criminalrecords/subscriber/": {
        console.log("inside /DPS/criminalrecords/subscriber/");
        if (search.includes("email")) {
          // const urlParams = new URLSearchParams(search);
          // let prospectEmail = urlParams.get("email");
          // chrome.storage.sync.set({
          //   baseUrl,
          //   bearerToken,
          //   prospectEmail: prospectEmail,
          //   source: "jazzhr",
          // });
          email = "m@tlcnursing.com";
          password = "1550Williston!";
          // chrome.storage.sync.set({
          //   baseUrl,
          //   bearerToken,
          //   prospectEmail: prospectEmail,
          //   source: "jazzhr",
          // });
          populateLoginFields(email, password);
        }
        break;
      }
      case "/DPS/criminalrecords/subscriber/agreement.php": {
        chrome.storage.sync.get(["source"], function (result) {
          console.log(result);
          if (result && result.source) {
            populateArgreementFields();
          }
        });

        break;
      }
      case "/DPS/criminalrecords/subscriber/request.php": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fetchCandidateData();
          }
        });

        break;
      }
      case "/DPS/criminalrecords/subscriber/done.php": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            getConvictionRecord();
          }
        });
        break;
      }
      case "/ABC/sign_on.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            populateAhsLoginFields();
          }
        });
        break;
      }
      case "/ABC/Authorize_SU.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let submitBtn = document.querySelector("form input");
            submitBtn.click();
          }
        });

        break;
      }
      case "/ABC/SubscriberHome.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            window.location.pathname = "/ABC/background_check.cfm";
          }
        });
        break;
      }
      case "/ABC/background_check.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fetchAhsFields();
          }
        });
        break;
      }
      case "/ABC/background_checkreview.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let submitBtn = document.getElementById("subbut");
            submitBtn.click();
          }
        });

        break;
      }
      case "/ABC/search_registry.cfm": {
        chrome.storage.sync.get(["source"], async function (result) {
          if (result && result.source) {
            // let captureElement = document.getElementsByTagName("body")[0];
            // const opt = {
            //   margin: 0,
            //   filename: "ahs.pdf",
            //   image: { type: "jpeg", quality: 1 },
            //   html2canvas: { scale: 2 },
            //   enableLinks: false,
            //   jsPDF: {
            //     orientation: "p",
            //     unit: "mm",
            //     format: "tabloid",
            //     putOnlyUsedFonts: true,
            //     floatPrecision: 16, // or "smart", default is 16
            //   },
            //   html2canvas: {
            //     // dpi: 300,
            //     // letterRendering: true,
            //     useCORS: true,
            //   },
            // };
            // await html2pdf().from(captureElement).set(opt).save();
            try {
              // await html2pdf()
              //   .set(opt)
              //   .from(captureElement)
              //   .toPdf()
              //   .get("pdf")
              //   .then(function (pdfObj) {
              //     const perBlob = pdfObj.output("blob");
              //     const blob = new Blob([perBlob], {
              //       type: "application/pdf",
              //     });
              //     const file_child = new File([blob], "ahs_child.pdf", {
              //       type: "application/pdf",
              //     });
              //     const file_adult = new File([blob], "ahs_adult.pdf", {
              //       type: "application/pdf",
              //     });
              //     chrome.storage.local.get(["source"], function (result) {
              //       let { source } = result;
              //       source["ahs_child"] = file_child;
              //       source["ahs_adult"] = file_adult;
              //       chrome.storage.local.set({
              //         source: source,
              //       });
              //     });
              // setTimeout(() => {
              //   var obj = {};
              //   var key = "ahs_child";
              //   obj[key] += file_child;
              //   chrome.storage.sync.set(obj);
              //   // chrome.storage.sync.set({ ahs_child: file_child });
              // }, 1000);
              window.location =
                "https://sam.gov/search/?index=ex&page=1&sort=-relevance&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BclassificationWrapper%5D%5Bclassification%5D=Individual";
              // });
            } catch (err) {
              console.log("err:", err);
            }
          }
        });
        break;
      }
      case "/ABC/org_status.cfm": {
        if (search.includes("email")) {
          const urlParams = new URLSearchParams(search);
          let prospectEmail = urlParams.get("email");
          let name = urlParams.get("name");
          chrome.storage.sync.set({
            source: "jazzhr",
          });
          fetchAhsRequestDetails(prospectEmail, name);
        }

        break;
      }
      case "/ABC/show_list.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            searchAhsRecord();
          }
        });

        break;
      }
      case "/ABC/show_clears.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            const urlParams = new URLSearchParams(search);
            let recordType = urlParams.get("RegistryRecordTypeID");
            if (recordType === "6") {
              postAhsAdultRecord();
            } else if (recordType === "7") {
              postAhsChildRecord();
            }
          }
        });

        break;
      }
      case "/": {
        let url = window.location.href;
        url = url.split("/");
        if (
          url[url.length - 1] === "add" &&
          url[url.length - 2] === "verification_form"
        ) {
          submitVerificationForm();
        }
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            if (window.location.hostname === "exclusions.oig.hhs.gov") {
              searchExclusion();
            }
            if (window.location.hostname === "www.google.com") {
              let fields = result.source;
              searchGoogle(fields);
            }
            if (window.location.hostname === "otes.okta.com") {
              let input = document.getElementById("idp-discovery-username");
              input.value = "m@tlcnursing.com";
              let subbut = document.getElementById("idp-discovery-submit");
              subbut.click();
              setTimeout(() => {
                console.log("clicked");
                input.value = "";
                input.value = "m@tlcnursing.com";
                subbut.click();
              }, 3000);
            }
            if (window.location.hostname === "clientconnect.otes.com") {
              let a = document.querySelector("a[href='/order/applicant']");
              a.click();
            }
          }
        });

        break;
      }
      case "/SearchResults.aspx": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            // window.location.href = 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm'
            sendExclusionRecord();
          }
        });

        break;
      }

      //sam search

      case "/search/": {
        // get button with class name "close-btn ng-tns-c66-1 ng-star-inserted" and click it
        let closeBtn = document.querySelector(
          "button.close-btn.ng-tns-c66-1.ng-star-inserted"
        );
        if (closeBtn) {
          closeBtn.click();
        }

        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            console.log(`result`, result);
            chrome.storage.sync.get(["fields"], function (result) {
              let { fields } = result;

              populateNewSamFormFields(fields);
            });
            //searchSam();
          } else {
            console.log(`result`, result);
          }
        });

        break;
      }
      //sam individual
      case "/exclusions-new": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let interval = setInterval(() => {
              if (document.getElementById("primary-content")) {
                let record =
                  document.getElementById("primary-content").innerText;
                // postRecord(record, 'SAM', 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm');
                postRecord(record, "SAM", false);
                clearInterval(interval);
              }
            }, 1000);
          }
        });
        break;
      }
      case "/search": {
        chrome.storage.sync.get(["source"], async function (result) {
          if (result && result.source) {
            if (window.location.hostname === "www.google.com") {
              let captureElement = document.getElementsByTagName("body")[0];
              const opt = {
                margin: 0,
                filename: "google.pdf",
                image: { type: "jpeg", quality: 1 },
                html2canvas: { scale: 2 },
                enableLinks: false,
                jsPDF: {
                  orientation: "p",
                  unit: "mm",
                  format: "tabloid",
                  putOnlyUsedFonts: true,
                  floatPrecision: 16, // or "smart", default is 16
                },
                html2canvas: {
                  // dpi: 300,
                  // letterRendering: true,
                  useCORS: true,
                },
              };
              await html2pdf().from(captureElement).set(opt).save();

              try {
                await html2pdf()
                  .from(captureElement)
                  .outputPdf()
                  .then(function (pdf) {
                    let doc = { google: btoa(pdf) };
                    postDocument(doc);
                    postRecord(
                      "",
                      "clientconnect",
                      "https://clientconnect.otes.com/login"
                    );
                  });
                // await html2pdf()
                //   .set(opt)
                //   .from(captureElement)
                //   .toPdf()
                //   .get("pdf")
                //   .then(function (pdfObj) {
                //     const perBlob = pdfObj.output("blob");
                //     const blob = new Blob([perBlob], {
                //       type: "application/pdf",
                //     });
                //     const google = new File([blob], "google.pdf", {
                //       type: "application/pdf",
                //     });

                //     chrome.storage.local.get(["source"], function (result) {
                //       let { source } = result;
                //       source["google"] = google;
                //       chrome.storage.local.set(
                //         {
                //           source: source,
                //         },
                //         function () {
                //           if (chrome.runtime.lastError) {
                //             /* error */
                //             console.log(chrome.runtime.lastError.message);
                //             return;
                //           }
                //           /* success */
                //           console.log("success");
                //         }
                //       );
                //       console.log("source inside: ", source);
                //     });

                //     postRecord(
                //       "",
                //       "clientconnect",
                //       "https://clientconnect.otes.com/login"
                //     );
                //   });
              } catch (err) {
                console.log("err:", err);
              }
            }
          }
        });

        break;
      }
      case "/login": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let input = document.getElementById("input-username");
            input.value = "m@tlcnursing.com";
            let button = document.getElementsByClassName("btn-lg")[0];
            button.click();
          }
        });
        break;
      }
      case "/signin" ||
        "/signin/refresh-auth-state/00N0Mg0TFvHYdHibetbEW4A77XpXMwMF_OOU6gm705": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let inputUsername = document.getElementById("okta-signin-username");
            if (inputUsername) {
              inputUsername.value = "m@tlcnursing.com";
            }
            let inputPassword = document.getElementById("okta-signin-password");
            inputPassword.value = "Williston1550!";
            let btnSignIn = document.getElementById("okta-signin-submit");
            btnSignIn.click();
          }
        });
        break;
      }
      case "/order/applicant": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fillApplicantForm();
          }
        });
        break;
      }
      // case '/SAM/pages/public/searchRecords/advancedPIRSearch.jsf': {
      // 	chrome.storage.sync.get(['source'], function (result) {
      // 		if (result && result.source) {
      // 			searchSam();
      // 		}
      // 	});
      // 	break;
      // }
      // case '/SAM/pages/public/searchRecords/advancedPIRSearchResults.jsf': {
      // 	chrome.storage.sync.get(['source'], function (result) {
      // 		if (result && result.source) {
      // 			postSamRecord();
      // 		}
      // 	});
      // 	break;
      // }
      default:
        return false;
    }
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in init() in Content Script`;
    insertFailLog(desc);
  }
  // }
}

/**
 * populate the login fields and bypass the login page
 * @param {string} email
 * @param {string} password
 */

function populateLoginFields(email, password) {
  try {
    let usernameInp = document.getElementsByName("uname")[0];
    let passwordInp = document.getElementsByName("pass")[0];
    let submitBtn = document.getElementsByName("Submit")[0];
    usernameInp.value = email;
    passwordInp.value = password;
    submitBtn.click();
  } catch (err) {
    console.log("errrr: ", err.toString());
    let desc = `${err.toString()} in populateLoginFields() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * check all checkboxes on the agreements page
 */
function populateArgreementFields() {
  try {
    console.log(document.getElementsByName("modification"));
    let modification = document.getElementsByName("modification")[0];
    let disclosure = document.getElementsByName("disclosure")[0];
    let pay = document.getElementsByName("pay")[0];
    let vpa = document.getElementsByName("vpa")[0];
    let submitBtn = document.getElementsByName("Submit")[0];
    modification.checked = true;
    disclosure.checked = true;
    pay.checked = true;
    vpa.checked = true;
    submitBtn.click();
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in populateArgreementFields() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * send request to background page and fetch candidate details
 */

function fetchCandidateData() {
  chrome.storage.sync.get(["source"], function (result) {
    try {
      if (result) {
        let { source } = result;
        console.log("source: ", source);

        // chrome.runtime.sendMessage(
        //   {
        //     baseUrl,
        //     bearerToken,
        //     prospectEmail,
        //     type: "fetchCandidateDetails",
        //   },
        //   function (response) {
        //     if (response) {
        //       let { fields } = response;
        if (source) {
          populateCandidateData(source);
          let submitBtn = document.getElementsByName("Submit")[0];
          submitBtn.click();
        } else {
          // vNotify.error({ text: "Applicant not found" });
        }
        //     }
        //   }
        // );
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in fetchCandidateData() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * populate candidate details into the form
 * @param {array} fields | collection of field name and value
 */

function populateCandidateData(fields) {
  try {
    chrome.storage.sync.set({
      fields: fields,
    });
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        let fieldValue = fields[key];
        if (key === "fname") {
          document.getElementsByName("first_name")[0].value = fieldValue;
          chrome.storage.sync.set({
            firstName: fieldValue,
          });
        }
        if (key === "lname") {
          document.getElementsByName("last_name")[0].value = fieldValue;
          chrome.storage.sync.set({
            lastName: fieldValue,
          });
        }
        if (key === "altfname1") {
          document.getElementsByName("alias_1_first_name")[0].value =
            fieldValue;
        }
        if (key === "altlname1") {
          document.getElementsByName("alias_1_last_name")[0].value = fieldValue;
        }
        if (key === "altfname2") {
          document.getElementsByName("alias_2_first_name")[0].value =
            fieldValue;
        }
        if (key === "altlname2") {
          document.getElementsByName("alias_2_first_name")[0].value =
            fieldValue;
        }
        if (key === "bday") {
          let dateField = document.getElementsByName("dob_day")[0],
            monthField = document.getElementsByName("dob_month")[0],
            yearField = document.getElementsByName("dob_year")[0];
          fieldValue = new Date(fieldValue).toISOString();
          let field = fieldValue.split("T")[0];
          field = field.split("-");
          let year = field[0],
            month = field[1],
            day = field[2];
          if (
            dateField.value === "" ||
            monthField.value === "" ||
            yearField.value === ""
          ) {
            dateField.value = day;
            monthField.value = month;
            yearField.value = year;
          }
        }
      }
    }

    document.getElementsByName("purpose")[0].value = "E";
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in populateCandidateData() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * get conviction record on candidate data submit
 * send request to background page to request the data obtained to api
 */

async function getConvictionRecord() {
  try {
    let record = document.getElementsByTagName("pre")[0].innerHTML;
    let captureElement = document.getElementsByTagName("body")[0];
    const opt = {
      margin: 0,
      filename: "vcic.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      enableLinks: false,
      jsPDF: {
        orientation: "p",
        unit: "mm",
        format: "tabloid",
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or "smart", default is 16
      },
      html2canvas: {
        // dpi: 300,
        // letterRendering: true,
        useCORS: true,
      },
    };
    await html2pdf().from(captureElement).set(opt).save();
    try {
      await html2pdf()
        .from(captureElement)
        .outputPdf()
        .then(function (pdf) {
          let doc = { vcic: btoa(pdf) };

          postDocument(doc);
          postRecord(record, "VCIC", "https://exclusions.oig.hhs.gov/");
        });
      // await html2pdf()
      //   .set(opt)
      //   .from(captureElement)
      //   .toPdf()
      //   .get("pdf")
      //   .then(function (pdfObj) {
      //     const perBlob = pdfObj.output("blob");
      //     const blob = new Blob([perBlob], {
      //       type: "application/pdf",
      //     });
      //     const vcic = new File([blob], "vcic.pdf", {
      //       type: "application/pdf",
      //     });
      //     chrome.storage.sync.get(["source"], function (result) {
      //       let { source } = result;
      //       source["vcic"] = vcic;
      //       chrome.storage.local.set({
      //         source: source,
      //       });
      //     });
      //   });
      // postRecord(record, "VCIC", "https://exclusions.oig.hhs.gov/");
    } catch (err) {
      console.log("error: ", err);
      let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
      insertFailLog(desc);
    }
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * populate the login form on ahs website
 */
function populateAhsLoginFields() {
  chrome.storage.sync.get(["ahsPassword"], function (result) {
    try {
      console.log(result);
      if (result.ahsPassword != undefined) {
        let firstName = "Moe";
        let lastName = "B";
        let orgId = "CMO023";
        document.getElementsByName("fname")[0].value = firstName;
        document.getElementsByName("lname")[0].value = lastName;
        document.getElementsByName("ID")[0].value = orgId;
        // document.getElementsByName('personalPassword')[0].value = '1550Williston!';
        document.getElementsByName("personalPassword")[0].value =
          result.ahsPassword;
        document.getElementsByName("login")[0].click();
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * fetch the form fields for ahs website
 */

function fetchAhsFields() {
  chrome.storage.sync.get(["fields"], function (result) {
    let { fields } = result;
    populateAhsFormFields(fields);
  });
}

function getStateAbriviaiton(state) {
  let statesArr = [
    {
      name: "Alabama",
      abbreviation: "AL",
    },
    {
      name: "Alaska",
      abbreviation: "AK",
    },
    {
      name: "American Samoa",
      abbreviation: "AS",
    },
    {
      name: "Arizona",
      abbreviation: "AZ",
    },
    {
      name: "Arkansas",
      abbreviation: "AR",
    },
    {
      name: "California",
      abbreviation: "CA",
    },
    {
      name: "Colorado",
      abbreviation: "CO",
    },
    {
      name: "Connecticut",
      abbreviation: "CT",
    },
    {
      name: "Delaware",
      abbreviation: "DE",
    },
    {
      name: "District Of Columbia",
      abbreviation: "DC",
    },
    {
      name: "Federated States Of Micronesia",
      abbreviation: "FM",
    },
    {
      name: "Florida",
      abbreviation: "FL",
    },
    {
      name: "Georgia",
      abbreviation: "GA",
    },
    {
      name: "Guam",
      abbreviation: "GU",
    },
    {
      name: "Hawaii",
      abbreviation: "HI",
    },
    {
      name: "Idaho",
      abbreviation: "ID",
    },
    {
      name: "Illinois",
      abbreviation: "IL",
    },
    {
      name: "Indiana",
      abbreviation: "IN",
    },
    {
      name: "Iowa",
      abbreviation: "IA",
    },
    {
      name: "Kansas",
      abbreviation: "KS",
    },
    {
      name: "Kentucky",
      abbreviation: "KY",
    },
    {
      name: "Louisiana",
      abbreviation: "LA",
    },
    {
      name: "Maine",
      abbreviation: "ME",
    },
    {
      name: "Marshall Islands",
      abbreviation: "MH",
    },
    {
      name: "Maryland",
      abbreviation: "MD",
    },
    {
      name: "Massachusetts",
      abbreviation: "MA",
    },
    {
      name: "Michigan",
      abbreviation: "MI",
    },
    {
      name: "Minnesota",
      abbreviation: "MN",
    },
    {
      name: "Mississippi",
      abbreviation: "MS",
    },
    {
      name: "Missouri",
      abbreviation: "MO",
    },
    {
      name: "Montana",
      abbreviation: "MT",
    },
    {
      name: "Nebraska",
      abbreviation: "NE",
    },
    {
      name: "Nevada",
      abbreviation: "NV",
    },
    {
      name: "New Hampshire",
      abbreviation: "NH",
    },
    {
      name: "New Jersey",
      abbreviation: "NJ",
    },
    {
      name: "New Mexico",
      abbreviation: "NM",
    },
    {
      name: "New York",
      abbreviation: "NY",
    },
    {
      name: "North Carolina",
      abbreviation: "NC",
    },
    {
      name: "North Dakota",
      abbreviation: "ND",
    },
    {
      name: "Northern Mariana Islands",
      abbreviation: "MP",
    },
    {
      name: "Ohio",
      abbreviation: "OH",
    },
    {
      name: "Oklahoma",
      abbreviation: "OK",
    },
    {
      name: "Oregon",
      abbreviation: "OR",
    },
    {
      name: "Palau",
      abbreviation: "PW",
    },
    {
      name: "Pennsylvania",
      abbreviation: "PA",
    },
    {
      name: "Puerto Rico",
      abbreviation: "PR",
    },
    {
      name: "Rhode Island",
      abbreviation: "RI",
    },
    {
      name: "South Carolina",
      abbreviation: "SC",
    },
    {
      name: "South Dakota",
      abbreviation: "SD",
    },
    {
      name: "Tennessee",
      abbreviation: "TN",
    },
    {
      name: "Texas",
      abbreviation: "TX",
    },
    {
      name: "Utah",
      abbreviation: "UT",
    },
    {
      name: "Vermont",
      abbreviation: "VT",
    },
    {
      name: "Virgin Islands",
      abbreviation: "VI",
    },
    {
      name: "Virginia",
      abbreviation: "VA",
    },
    {
      name: "Washington",
      abbreviation: "WA",
    },
    {
      name: "West Virginia",
      abbreviation: "WV",
    },
    {
      name: "Wisconsin",
      abbreviation: "WI",
    },
    {
      name: "Wyoming",
      abbreviation: "WY",
    },
  ];
  statesArr.forEach((obj) => {
    if (obj.name === state) {
      return obj.abbreviation;
    }
  });
  return state;
}

/**
 * populate the ahs website form
 * @param {array} fieldsArr | form fields array
 */

function populateAhsFormFields(fields) {
  try {
    let resubmitCheck = document.getElementsByName("resubmit");
    resubmitCheck[0].value = "No";
    resubmitCheck[1].checked = true;
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        let fieldValue = fields[key];
        if (key === "fname") {
          document.getElementById("firstn").value = fieldValue;
        }
        if (key === "lname") {
          document.getElementById("lastn").value = fieldValue;
        }
        if (key === "gender") {
          let genderInp = document.getElementsByName("gender");
          fieldValue === "Male" || fieldValue === "male"
            ? (genderInp[1].checked = true)
            : (genderInp[0].checked = true);
        }
        if (key === "last4ssn") {
          document.getElementsByName("ssn")[0].value = fieldValue;
        }
        if (key === "street") {
          document.getElementById("address").value = fieldValue;
        }
        if (key === "city") {
          document.getElementById("city").value = fieldValue;
        }
        if (key === "state") {
          fieldValue = getStateAbriviaiton(fieldValue);
          document.getElementById("state").value = fieldValue;
        }
        if (key === "zip") {
          document.getElementById("zip").value = fieldValue;
        }
        if (key === "bday") {
          let dobField = document.getElementById("dob");
          fieldValue = new Date(fieldValue).toISOString();
          let field = fieldValue.split("T")[0];
          field = field.split("-");
          let year = field[0],
            month = field[1],
            day = field[2];
          let dob = `${month}/${day}/${year}`;
          if (dobField.value === "") {
            document.getElementById("dob").value = dob;
          }
        }
        if (key === "birthplace") {
          document.getElementById("pob").value = fieldValue;
        }
        if (key === "mname") {
          document.getElementById("MI").value = fieldValue;
        }
      }
    }
    let submitBtn = document.getElementById("subbut");
    submitBtn.click();
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in populateAhsFormFields() in Content Script`;
    insertFailLog(desc);
  }
}
/*
 * Submit the verification form
 */
function submitVerificationForm() {
  try {
    let btnContainer = document.getElementsByClassName("verify")[0];
    let btn = document.createElement("button");
    let btnFetch = document.createElement("button");
    btn.innerText = "Verify";
    btnFetch.innerText = "Fetch AHS Status";
    btn.className = "btn-verify";
    btnFetch.className = "btn-verify";
    btn.id = "verifybtn";
    btnFetch.id = "fetchbtn";

    btnContainer.appendChild(btn);
    btnContainer.appendChild(btnFetch);
    // btn.addEventListener("click", (e) => {
    document
      .getElementById("verifybtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let last4ssn = document.getElementById("last4ssn").value;
        let ssn = document.getElementById("ssn").value;
        let email = document.getElementById("email").value;

        let zip = document.getElementById("zip").value;

        let bday = document.getElementById("bday").value;
        if (!bday) {
          alert("Please fill out all fields");
        } else {
          if (
            document.getElementById("fname").value &&
            document.getElementById("lname").value &&
            document.getElementById("mname").value &&
            document.getElementById("altfname1").value &&
            document.getElementById("altlname1").value &&
            document.getElementById("altfname2").value &&
            document.getElementById("altlname2").value &&
            document.getElementById("ssn").value &&
            last4ssn &&
            document.getElementById("street").value &&
            document.getElementById("city").value &&
            document.getElementById("city2").value &&
            document.getElementById("state").value &&
            document.getElementById("state2").value &&
            document.getElementById("country").value &&
            zip &&
            document.getElementById("keyword").value &&
            bday &&
            (document.getElementById("male").checked === true ||
              document.getElementById("female").checked === true ||
              document.getElementById("other").checked === true)
          ) {
            if (
              email.length > 1 &&
              email.includes("@") &&
              email.includes(".")
            ) {
              if (zip.length === 5 && !isNaN(zip) && zip > 0) {
                if (ssn <= 0 || last4ssn <= 0) {
                  alert("Please enter a valid SSN");
                } else {
                  if (last4ssn.length === 4 && !isNaN(last4ssn)) {
                    let today = new Date();
                    let bdayDate = new Date(bday);
                    if (bdayDate > today) {
                      alert("Birthdate cannot be in the future");
                    } else {
                      let gender =
                        document.getElementById("male").checked === true
                          ? "male"
                          : "female";
                      // is using female fine instead of empty string????????????
                      chrome.storage.sync.set(
                        {
                          source: {
                            fname: document.getElementById("fname").value,
                            lname: document.getElementById("lname").value,
                            gender: gender,
                            mname: document.getElementById("mname").value,
                            altfname1:
                              document.getElementById("altfname1").value,
                            altlname1:
                              document.getElementById("altlname1").value,
                            altfname2:
                              document.getElementById("altfname2").value,
                            altlname2:
                              document.getElementById("altlname2").value,
                            ssn: document.getElementById("ssn").value,
                            last4ssn: document.getElementById("last4ssn").value,
                            street: document.getElementById("street").value,
                            city: document.getElementById("city").value,
                            state: document.getElementById("state").value,
                            zip: document.getElementById("zip").value,
                            keyword: document.getElementById("keyword").value,
                            birthplace: `${
                              document.getElementById("city2").value
                            }, ${document.getElementById("state2").value}, ${
                              document.getElementById("country").value
                            }`,
                            bday: document.getElementById("bday").value,
                            email: document.getElementById("email").value,
                          },
                        },
                        function () {
                          console.log("data saved");
                          chrome.storage.sync.get(
                            ["source"],
                            function (result) {
                              console.log("saved data: ", result.source);
                            }
                          );
                          postData();
                          return;
                        }
                      );
                      // chrome.tabs.create({
                      //   url: `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}`,
                      // });

                      window.open(
                        `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}&name=${
                          document.getElementById("fname").value
                        }`,
                        "_blank"
                      );
                      chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                          chrome.tabs.executeScript(
                            tabs[0].id,
                            { file: "content_script.js" },
                            function (result) {
                              console.log(result);
                            }
                          );
                        }
                      );
                    }
                  } else {
                    alert("Please enter a valid last 4 digits of SSN");
                  }
                }
              } else {
                alert("Please enter a valid zip code");
              }
            } else {
              alert("Please enter a valid email address");
            }
          } else {
            alert("Please fill out all fields");
          }
        }
      });
    document.getElementById("fetchbtn").addEventListener("click", function (e) {
      e.preventDefault();
      let last4ssn = document.getElementById("last4ssn").value;
      let ssn = document.getElementById("ssn").value;
      let email = document.getElementById("email").value;

      let zip = document.getElementById("zip").value;

      let bday = document.getElementById("bday").value;
      if (!bday) {
        alert("Please fill out all fields");
      } else {
        if (
          document.getElementById("fname").value &&
          document.getElementById("lname").value &&
          document.getElementById("mname").value &&
          document.getElementById("altfname1").value &&
          document.getElementById("altlname1").value &&
          document.getElementById("altfname2").value &&
          document.getElementById("altlname2").value &&
          document.getElementById("ssn").value &&
          last4ssn &&
          document.getElementById("street").value &&
          document.getElementById("city").value &&
          document.getElementById("city2").value &&
          document.getElementById("state").value &&
          document.getElementById("state2").value &&
          document.getElementById("country").value &&
          zip &&
          document.getElementById("keyword").value &&
          bday &&
          (document.getElementById("male").checked === true ||
            document.getElementById("female").checked === true ||
            document.getElementById("other").checked === true)
        ) {
          if (email.length > 1 && email.includes("@") && email.includes(".")) {
            if (zip.length === 5 && !isNaN(zip) && zip > 0) {
              if (ssn <= 0 || last4ssn <= 0) {
                alert("Please enter a valid SSN");
              } else {
                if (last4ssn.length === 4 && !isNaN(last4ssn)) {
                  let today = new Date();
                  let bdayDate = new Date(bday);
                  if (bdayDate > today) {
                    alert("Birthdate cannot be in the future");
                  } else {
                    let gender =
                      document.getElementById("male").checked === true
                        ? "male"
                        : "";

                    chrome.storage.sync.set(
                      {
                        source: {
                          fname: document.getElementById("fname").value,
                          lname: document.getElementById("lname").value,
                          gender: gender,
                          mname: document.getElementById("mname").value,
                          altfname1: document.getElementById("altfname1").value,
                          altlname1: document.getElementById("altlname1").value,
                          altfname2: document.getElementById("altfname2").value,
                          altlname2: document.getElementById("altlname2").value,
                          ssn: document.getElementById("ssn").value,
                          last4ssn: document.getElementById("last4ssn").value,
                          street: document.getElementById("street").value,
                          city: document.getElementById("city").value,
                          state: document.getElementById("state").value,
                          zip: document.getElementById("zip").value,
                          keyword: document.getElementById("keyword").value,
                          birthplace: `${
                            document.getElementById("city2").value
                          }, ${document.getElementById("state2").value}, ${
                            document.getElementById("country").value
                          }`,
                          bday: document.getElementById("bday").value,
                        },
                      },
                      function () {
                        console.log(
                          "Value is set to " +
                            document.getElementById("fname").value
                        );
                      }
                    );
                    // chrome.tabs.create({
                    //   url: `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}`,
                    // });
                    window.open(
                      `https://ahsnet.ahs.state.vt.us/ABC/org_status.cfm?name=${
                        document.getElementById("fname").value
                      }&email=${email}`,
                      "_blank"
                    );
                    // get current tab and execute script
                    chrome.tabs.query(
                      { active: true, currentWindow: true },
                      function (tabs) {
                        chrome.tabs.executeScript(
                          tabs[0].id,
                          { file: "content_script.js" },
                          function (result) {
                            console.log(result);
                          }
                        );
                      }
                    );
                  }
                } else {
                  alert("Please enter a valid last 4 digits of SSN");
                }
              }
            } else {
              alert("Please enter a valid zip code");
            }
          } else {
            alert("Please enter a valid email address");
          }
        } else {
          alert("Please fill out all fields");
        }
      }
    });
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in submitVerificationForm() in Content Script`;
    insertFailLog(desc);
  }
}

/*
 * Fill the Order Applicant form
 */
function fillApplicantForm() {
  try {
    chrome.storage.sync.get(["source"], function (result) {
      console.log("here");
      if (result.source) {
        console.log(result.source);
        document.getElementById("name.firstName").value = result.source.fname;
        document.getElementById("name.lastName").value = result.source.lname;
        document.getElementById("name.middleName").value = result.source.mname;
        document.getElementById("aliases0.name.firstName").value =
          result.source.altfname1;
        document.getElementById("aliases0.name.lastName").value =
          result.source.altlname1;
        // click button with name add-alias
        document.getElementsByName("add-alias")[0].click();
        document.getElementById("aliases1.name.firstName").value =
          result.source.altfname2;
        document.getElementById("aliases1.name.lastName").value =
          result.source.altlname2;
        document.getElementById("ssn").value = result.source.ssn;
        // document.getElementById("last4ssn").value = result.source.last4ssn;
        document.getElementById("currentAddress.street").value =
          result.source.street;
        document.getElementById("currentAddress.city").value =
          result.source.city;
        // document.getElementById("city2").value = result.source.birthplace;
        // document.getElementById("state").value = result.source.state;
        // document.getElementById("state2").value = result.source.birthplace;
        // find and select country from select list in option groups

        let countrySelect = document.getElementById(
          "currentAddress.country.countryId"
        );
        for (let i = 0; i < countrySelect.options.length; i++) {
          if (
            countrySelect.options[i].text ===
            result.source.birthplace.split(", ")[2]
          ) {
            countrySelect.selectedIndex = i;
            break;
          }
        }
        let stateSelect = document.getElementById(
          "currentAddress.state.stateId"
        );
        let internationalState = document.getElementById(
          "currentAddress.internationalState"
        );
        if (stateSelect) {
          for (let i = 0; i < stateSelect.options.length; i++) {
            if (stateSelect.options[i].text === result.source.state) {
              stateSelect.selectedIndex = i;
              break;
            }
          }
        }
        if (internationalState) {
          internationalState.value = result.source.state;
        }

        document.getElementById("currentAddress.zipCode").value =
          result.source.zip;
        // document.getElementById("keyword").value = result.source.keyword;
        document.getElementById("contactInformation.emailAddress").value =
          result.source.email;
        document.getElementById("dob").value = result.source.bday;

        // setTimeout(() => {
        //   chrome.storage.sync.remove("source");
        //   chrome.storage.sync.remove("fields");
        // }, 1000);
      }
    });
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in fillApplicantForm() in Content Script`;
    insertFailLog(desc);
  }
}
/**
 * search the exculsion website
 */

function searchExclusion() {
  chrome.storage.sync.get(["fields"], function (result) {
    let { fields } = result;
    populateExclusionLogin(fields);
  });
}

// perform google search with fname, lname, state, city, and keyword from source
function searchGoogle(fields) {
  try {
    let searchInputGoogle = document.getElementsByClassName("gLFyf gsfi")[0];
    searchInputGoogle.value = `${fields.fname} ${fields.lname} ${fields.state} ${fields.city} ${fields.keyword}`;
    document.getElementsByClassName("gNO89b")[0].click();
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in searchGoogle() in Content Script`;
    insertFailLog(desc);
  }
}

function loginClientConnect() {
  try {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let loginButton = document.getElementsByClassName("btn btn-primary")[0];
    loginButton.click();
    setTimeout(() => {
      let searchInputGoogle = document.getElementsByClassName("gLFyf gsfi")[0];
      searchInputGoogle.value = `${email} ${password}`;
      document.getElementsByClassName("gNO89b")[0].click();
    }, 1000);
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in loginClientConnect() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * populate the exclusion login form
 * @param {array} fieldsArr | form fields array
 */

function populateExclusionLogin(fields) {
  try {
    if (
      document.getElementsByTagName("h2")[0].innerText === "Service Unavailable"
    ) {
      postRecord(
        "No response from Exclusion website",
        "OIG",
        "https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm"
      );
    } else {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          let fieldValue = fields[key];
          if (key === "fname") {
            document.getElementById("ctl00_cpExclusions_txtSPFirstName").value =
              fieldValue;
          }
          if (key === "lname") {
            document.getElementById("ctl00_cpExclusions_txtSPLastName").value =
              fieldValue;
          }
        }
      }
      let submitBtn = document.getElementById("ctl00_cpExclusions_ibSearchSP");
      submitBtn.click();
    }
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in populateExclusionLogin() in Content Script`;
    insertFailLog(desc);
  }
}

/**
 * post the exclusion record to the jazz hr
 */

function sendExclusionRecord() {
  const conversion = async () => {
    let captureElement = document.getElementsByTagName("body")[0];

    const opt = {
      margin: 0,
      filename: "oig.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      enableLinks: false,
      jsPDF: {
        orientation: "p",
        unit: "mm",
        format: "tabloid",
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or "smart", default is 16
      },
      html2canvas: {
        // dpi: 300,
        // letterRendering: true,
        useCORS: true,
      },
    };
    await html2pdf().from(captureElement).set(opt).save();
    try {
      await html2pdf()
        .from(captureElement)
        .outputPdf()
        .then(function (pdf) {
          let doc = { oig: btoa(pdf) };
          postDocument(doc);
        });
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in conversion() in Content Script`;
      insertFailLog(desc);
    }
    // await html2pdf()
    //   .set(opt)
    //   .from(captureElement)
    //   .toPdf()
    //   .get("pdf")
    //   .then(function (pdfObj) {
    //     const perBlob = pdfObj.output("blob");
    //     const blob = new Blob([perBlob], {
    //       type: "application/pdf",
    //     });
    //     const oig = new File([blob], "oig.pdf", {
    //       type: "application/pdf",
    //     });
    //     chrome.storage.local.get(["source"], function (result) {
    //       let { source } = result;
    //       source["oig"] = oig;
    //       chrome.storage.local.set({
    //         source: source,
    //       });
    //     });
    //   });
  };
  try {
    let exclusionDiv = document.getElementById("ctl00_cpExclusions_pnlEmpty");
    if (exclusionDiv) {
      let record = exclusionDiv.getElementsByTagName("div")[0].innerText;
      // postRecord(record, 'OIG', 'https://sam.gov/search/?index=ex&page=1&sort=-relevance&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BclassificationWrapper%5D%5Bclassification%5D=Individual');
      // postRecord(record, 'OIG', 'https://www.sam.gov/SAM/pages/public/searchRecords/advancedPIRSearch.jsf');
      // postRecord(record, 'OIG', 'https://www.sam.gov/SAM/pages/public/searchRecords/advancedPIRSearch.jsf');
      try {
        conversion();
        postRecord(
          record,
          "OIG",
          "https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm"
        );
      } catch (err) {
        console.log("err: ", err);
        let desc = `${err.toString()} in sendExclusionRecord() in Content Script`;
        insertFailLog(desc);
      }
    } else {
      let record = document.getElementById("SP").innerText;
      // postRecord(record, 'OIG', 'https://sam.gov/search/?index=ex&page=1&sort=-relevance&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BclassificationWrapper%5D%5Bclassification%5D=Individual');
      // postRecord(record, 'OIG', 'https://www.sam.gov/SAM/pages/public/searchRecords/advancedPIRSearch.jsf');
      // postRecord(record, 'OIG', 'https://www.sam.gov/SAM/pages/public/searchRecords/advancedPIRSearch.jsf');
      try {
        conversion();
        postRecord(
          record,
          "OIG",
          "https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm"
        );
      } catch (err) {
        console.log("err: ", err);
      }
    }
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in sendExclusionRecord() in Content Script`;
    insertFailLog(desc);
  }
}

// /**
//  * search sam website
//  */

// function searchSam() {
// 	chrome.storage.sync.get(['fields'], function (result) {
// 		let { fields } = result;
// 		populateSamFormFields(fields);
// 	});
// }

function populateNewSamFormFields(fields) {
  setTimeout(() => {
    try {
      document.querySelector("#usa-accordion-item-5-header > button").click();

      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          let fieldValue = fields[key];
          if (key === "fname") {
            document.getElementById("firstname").value = fieldValue;
            document
              .getElementById("firstname")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
          if (key === "lname") {
            document.getElementById("lastname").value = fieldValue;
            document
              .getElementById("lastname")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
          if (key === "ssn") {
            document.getElementById("ssn").value = fieldValue;
            document
              .getElementById("ssn")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
        }
      }

      setTimeout(() => {
        document
          .querySelector("#usa-accordion-item-5")
          .getElementsByTagName("button")[0]
          .click();
        setTimeout(async () => {
          if (
            document
              .getElementsByTagName("sds-search-result-list")[0]
              ?.children[0].getElementsByTagName("a")[0]
          ) {
            document
              .getElementsByTagName("sds-search-result-list")[0]
              .children[0].getElementsByTagName("a")[0]
              .click();
          } else {
            let record = "No Record Found!";
            let captureElement = document.getElementsByTagName("body")[0];
            const opt = {
              margin: 0,
              filename: "sam.pdf",
              image: { type: "jpeg", quality: 1 },
              html2canvas: { scale: 2 },
              enableLinks: false,
              jsPDF: {
                orientation: "p",
                unit: "mm",
                format: "tabloid",
                putOnlyUsedFonts: true,
                floatPrecision: 16, // or "smart", default is 16
              },
              html2canvas: {
                // dpi: 300,
                // letterRendering: true,
                useCORS: true,
              },
            };

            await html2pdf().from(captureElement).set(opt).save();
            await html2pdf()
              .from(captureElement)
              .outputPdf()
              .then(function (pdf) {
                let doc = { sam: btoa(pdf) };
                postDocument(doc);
                postRecord(record, "google", "https://www.google.com");

                // console.log("string base: ", btoa(pdf));
                // chrome.storage.local.get(["source"], function (result) {
                //   let { source } = result;
                //   source["sam"] = btoa(pdf);
                //   chrome.storage.local.set({ source: source }, function () {
                //     postRecord(record, "google", "https://www.google.com");
                //   });
                // });
              });
            return;

            // try {
            //   html2pdf()
            //     .set(opt)
            //     .from(captureElement)
            //     .toPdf()
            //     .get("pdf")
            //     .then(function (pdfObj) {
            //       const perBlob = pdfObj.output("blob");
            //       const blob = new Blob([perBlob], {
            //         type: "application/pdf",
            //       });
            //       const sam = new File([blob], "sam.pdf", {
            //         type: "application/pdf",
            //       });
            //       chrome.storage.local.get(["source"], function (result) {
            //         let { source } = result;
            //         source["sam"] = sam;

            //         chrome.storage.local.set({ source: source }, function () {
            //           if (chrome.runtime.lastError) {
            //             /* error */
            //             console.log(
            //               "here came err: ",
            //               chrome.runtime.lastError.message
            //             );
            //             return;
            //           }
            //           postRecord(record, "google", "https://www.google.com");
            //         });
            //         // log source from local storage
            //         chrome.storage.local.get(["source"], function (result) {
            //           let { source } = result;
            //           console.log("source", source);
            //         });
            //       });
            //     });
            // } catch (err) {
            //   console.log("err: ", err);
            // }
            // postRecord(record, 'SAM', 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm');
            //  postRecord was here earlier, now moved to the end of the html2pdf function
          }
        }, 2000);
      }, 3000);
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in populateSamFormFields() in Content Script`;
      insertFailLog(desc);
    }
  }, 3000);
}

// /**
//  * populate the sam website form fields
//  * @param {array} fieldsArr | form fields array
//  */

// function populateSamFormFields(fieldsArr) {
// 	try {
// 		let formDiv = document.getElementById('tPIRSF');
// 		formDiv.style.display = 'block';
// 		let formCheck = document.getElementById('advPIRSearch:PIRSF:0');
// 		formCheck.checked = 'checked';
// 		let classificationSelect = document.getElementById('advPIRSearch:inputPIRSFClassification');
// 		classificationSelect.value = 'IND';
// 		fieldsArr.forEach((field) => {
// 			let fieldName = Object.keys(field)[0];
// 			let fieldValue = Object.values(field)[0];
// 			let fieldInp;
// 			switch (fieldName) {
// 				case 'fname':
// 					fieldInp = document.getElementById('advPIRSearch:inputExcpPIRSFIndFirstName');
// 					fieldInp.disabled = false;
// 					fieldInp.value = fieldValue;
// 					break;
// 				case 'lname':
// 					fieldInp = document.getElementById('advPIRSearch:inputExcpPIRSFIndLastName');
// 					fieldInp.disabled = false;
// 					fieldInp.value = fieldValue;
// 					break;
// 				case 'city':
// 					document.getElementById('advPIRSearch:inputPIRSFCity').value = fieldValue;
// 					break;
// 				case 'state':
// 					fieldValue = getStateAbriviaiton(fieldValue);
// 					document.getElementById('advPIRSearch:inputPIRSFStateTxt').value = fieldValue;
// 					break;
// 				case 'zip':
// 					document.getElementById('advPIRSearch:inputPIRSFZip').value = fieldValue;
// 					break;
// 				case 'mname':
// 					fieldInp = document.getElementById('advPIRSearch:inputExcpPIRSFIndMidName');
// 					fieldInp.disabled = false;
// 					fieldInp.value = fieldValue;
// 					break;
// 				default:
// 					return false;
// 			}
// 		});

// 		let submitBtn = document.getElementById('advPIRSearch:PIRAdvSearchButton');
// 		submitBtn.click();
// 	} catch (err) {
// 		console.log(err.toString())
// 		let desc = `${err.toString()} in populateSamFormFields() in Content Script`
// 		insertFailLog(desc)
// 	}

// }

// /**
//  * post the result from sam website to jazz hr
//  */

// function postSamRecord() {
// 	try {
// 		let record = document.getElementsByClassName('noResultsFontSize')[0];
// 		if (!record) {
// 			record = '';
// 			let recordTable = document.getElementById('search_results');
// 			let recordElements = recordTable
// 				.getElementsByTagName('li')[0]
// 				.getElementsByTagName('table')[1]
// 				.getElementsByTagName('table')[2]
// 				.getElementsByTagName('td');
// 			for (let i = 0; i < recordElements.length; i++) {
// 				let resultsArr = recordElements[i].getElementsByTagName('div');
// 				let resultsHeading = resultsArr[0].innerText;
// 				let resultsBody = resultsArr[1].innerText;
// 				record = `${record} ${resultsHeading} ${resultsBody}`;
// 			}
// 		} else {
// 			record = record.innerText;
// 		}
// 		postRecord(record, 'SAM', 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm');
// 	} catch (err) {
// 		console.log(err.toString())
// 		let desc = `${err.toString()} in postSamRecord() in Content Script`
// 		insertFailLog(desc)
// 	}

// }

/**
 * This function sends message to background
 * to post record retreived from the verification website
 * @param {string} record | record to be posted
 * @param {string} siteName | name of site from which record was verified
 *  @param {string} redirect | site on to which redirect upon record successfully posted
 */

function postRecord(record, siteName, redirect) {
  window.location.href = redirect;

  // let today = new Date();
  // let dd = String(today.getDate()).padStart(2, "0");
  // let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  // let yyyy = today.getFullYear();
  // today = mm + "-" + dd + "-" + yyyy;
  // chrome.storage.sync.get(
  //   ["firstName", "lastName", "prospectEmail"],
  //   function (result) {
  //     try {
  //       let { firstName, lastName, prospectEmail } = result;
  //       if (prospectEmail) {
  //         chrome.runtime.sendMessage(
  //           {
  //             baseUrl,
  //             bearerToken,
  //             record,
  //             prospectEmail,
  //             type: "postRecord",
  //             firstName,
  //             lastName,
  //             siteName,
  //             currentDate: today,
  //           },
  //           function (response) {
  //             if (response.fail || response) {
  //               if (!redirect) {
  //                 chrome.storage.sync.remove("fields");
  //                 chrome.storage.sync.remove("source", (result) => {
  //                   console.log(result);
  //                   window.close();
  //                 });
  //               }
  //               window.location.href = redirect;
  //             } else {
  //               vNotify.error({ text: "Record not posted" });
  //             }
  //           }
  //         );
  //       }
  //     } catch (err) {
  //       console.log("erro");
  //       console.log(err.toString());
  //       let desc = `${err.toString()} in postSamRecord() in Content Script`;
  //       insertFailLog(desc);
  //     }
  //   }
  // );
}
/**
 * This function sends message to background to send the data to the server
 */
function postData() {
  chrome.storage.sync.get(["source"], function (result) {
    try {
      let data = result.source;
      chrome.runtime.sendMessage(
        { baseUrl, bearerToken, data, type: "postData" },
        function (response) {
          if (response?.data?.id) {
            chrome.storage.sync.set(
              {
                id: response.data.id,
              },
              function () {
                console.log("id set");
              }
            );
          }
        }
      );
    } catch (err) {
      console.log("error");
      console.log(err.toString());
      let desc = `${err.toString()} in postData() in Content Script`;
      insertFailLog(desc);
    }
  });
}
/**
 * This function sends message to background to send the document to the server
 */
async function postDocument(doc) {
  chrome.storage.sync.get(["id"], function (result) {
    try {
      let id = result.id;
      chrome.runtime.sendMessage(
        { baseUrl, bearerToken, doc, id, type: "postDoc" },
        function (response) {
          // if (response?.data?.id) {
          //   chrome.storage.sync.set(
          //     {
          //       id: response.data.id,
          //     },
          //     function () {
          //       console.log("id set");
          //     }
          //   );
          // }
          console.log("response: ", response);
        }
      );
    } catch (err) {
      console.log("error");
      console.log(err.toString());
      let desc = `${err.toString()} in postDocument() in Content Script`;
      insertFailLog(desc);
    }
  });
}
/**
 * this function sets candidates details and populates the date range field of Ahs record fetch
 * @param {string} prospectEmail | applicant id of candidate
 * @param {string} name | name of the candidate
 */

function fetchAhsRequestDetails(prospectEmail, name) {
  if (prospectEmail) {
    chrome.runtime.sendMessage(
      { baseUrl, bearerToken, prospectEmail, type: "fetchAhsRecord" },
      function (response) {
        try {
          let { data } = response;
          if (data) {
            chrome.storage.sync.set({
              ahsData: data,
              prospectEmail,
              name,
            });
            let { created_at, updated_at } = data;
            let fromDate = formatAhsDate(created_at);
            let toDate = formatAhsDate(updated_at);
            populateAhsDate(fromDate, toDate);
          }
        } catch (err) {
          console.log(err.toString());
          let desc = `${err.toString()} in fetchAhsRequestDetails() in Content Script`;
          insertFailLog(desc);
        }
      }
    );
  }
}

/**
 * this function formats the date time into MM-DD-YYYY format
 * @param {date-time} datetime
 */

function formatAhsDate(datetime) {
  datetime = new Date(datetime).toISOString();
  console.log("herer date timee", datetime);
  let field = datetime.split("T")[0];
  field = field.split("-");
  // 06/11/1992
  let year = field[0],
    month = field[1],
    day = field[2];
  return `${month}-${day}-${year}`;
}

/**
 * this function populates to and from date of the Ahs website
 * @param {date-string} from
 * @param {date-string} to
 */

function populateAhsDate(from, to) {
  chrome.storage.sync.get(["prospectEmail"], function (result) {
    try {
      let { prospectEmail } = result;
      if (prospectEmail) {
        chrome.runtime.sendMessage(
          { baseUrl, bearerToken, prospectEmail, type: "fetchAhsStatus" },
          function (response) {
            try {
              let { data } = response;
              if (data) {
                chrome.storage.sync.set({
                  verificationStatus: data,
                });
                let fromInp = document.getElementsByName("from_dt")[0];
                fromInp.value = from;
                let toInp = document.getElementsByName("to_dt")[0];
                toInp.value = to;
                let submitBtn = document.getElementsByName("submit")[0];
                submitBtn.click();
              }
            } catch (err) {
              console.log(err.toString());
              let desc = `${err.toString()} in populateAhsDate() at chrome.runtime.sendMessage({ baseUrl, bearerToken, prospectEmail, type: 'fetchAhsStatus' } in Content Script`;
              insertFailLog(desc);
            }
          }
        );
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in populateAhsDate() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * this function searches for the ahs records table by name
 */

function searchAhsRecord() {
  chrome.storage.sync.get(["name", "verificationStatus"], function (result) {
    try {
      let { name, verificationStatus } = result;
      let { ahs_adult, ahs_child } = verificationStatus;
      if (ahs_adult && ahs_child) {
        // vNotify.success({ text: "Record already fetched" });
        setTimeout(() => {
          chrome.storage.sync.remove("fields");
          chrome.storage.sync.remove("source", (result) => {
            window.close();
          });
        }, 3000);
        return;
      }
      if (name) {
        let nameRows = document.querySelectorAll("[nowrap]");
        let nameMatched = false;
        let recordFound = false;
        let candidateName = name.split(" ");
        let firstName = candidateName[0];
        let lastName = candidateName[1];
        name = `${lastName}, ${firstName}`;
        let recordVerify = { child: false, adult: false };
        for (let i = 0; i < nameRows.length; i++) {
          if (nameRows[i].innerText.includes(name)) {
            nameMatched = true;
            chrome.storage.sync.set({
              firstName,
              lastName,
            });
            let rowMatched = nameRows[i].parentNode;
            let recordsRow = rowMatched.getElementsByTagName("a");
            recordsRow.length === 0
              ? (recordFound = false)
              : (recordFound = true);
            if (recordsRow.length) {
              for (let i = 0; i < recordsRow.length; i++) {
                const urlParams = new URLSearchParams(recordsRow[i].href);
                const recordType = urlParams.get("RegistryRecordTypeID");
                if (recordType === "6") {
                  recordVerify.adult = true;
                }
                if (recordType === "7") {
                  recordVerify.child = true;
                }
              }
              chrome.storage.sync.set({
                ahsRecord: recordVerify,
              });
              if (recordsRow.length === 2) {
                if (ahs_adult === 0) {
                  window.location.href = recordsRow[0].href;
                } else if (ahs_child === 0) {
                  window.location.href = recordsRow[1].href;
                }
              } else {
                const urlParams = new URLSearchParams(recordsRow[0].href);
                const recordType = urlParams.get("RegistryRecordTypeID");
                if (recordType === "6" && ahs_adult === 0) {
                  window.location.href = recordsRow[0].href;
                } else if (recordType === "7" && ahs_child == 0) {
                  window.location.href = recordsRow[0].href;
                } else {
                  // vNotify.error({ text: "One Record is under process" });
                  setTimeout(() => {
                    chrome.storage.sync.remove("fields");
                    chrome.storage.sync.remove("source");
                    window.close();
                  }, 5000);
                }
              }
            }
            break;
          }
        }
        if (!recordFound) {
          // vNotify.error({ text: "Record not found" });
          setTimeout(() => {
            chrome.storage.sync.remove("fields");
            chrome.storage.sync.remove("source");
            window.close();
          }, 3000);
        }
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in searchAhsRecord() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * remove html tags from string
 * @param {string} str
 */

function strip_html_tags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();
  return str.replace(/<[^>]*>/g, "");
}

/**
 * this function sends message to background to post the ahs adult record of candidate
 */

function postAhsAdultRecord() {
  chrome.storage.sync.get(["ahsRecord"], function (result) {
    try {
      let { child } = result.ahsRecord;
      let { search } = window.location;
      const urlParams = new URLSearchParams(search);
      let requestId = urlParams.get("requestID");
      let redirectUrl = `https://www.ahsnet.ahs.state.vt.us/ABC/show_clears.cfm?requestID=${requestId}&RegistryRecordTypeID=7`;
      let recordDiv = document.getElementsByTagName("p");
      if (recordDiv) {
        let record = "";
        for (let i = 1; i < recordDiv.length; i++) {
          record =
            record +
            strip_html_tags(recordDiv[i].innerHTML.replace(/\&nbsp;/g, ""));
          if (i == 1) {
            record = record + "\n";
          }
        }
        if (child) {
          postRecord(record, "AHS_Adult", redirectUrl);
        } else {
          postRecord(record, "AHS_Adult", false);
        }
      }
    } catch (err) {
      console.log(err.toString());
      let desc = `${err.toString()} in postAhsAdultRecord() in Content Script`;
      insertFailLog(desc);
    }
  });
}

/**
 * this function sends message to background to post the ahs child record of candidate
 */

function postAhsChildRecord() {
  try {
    let recordDiv = document.getElementsByTagName("p");
    if (recordDiv) {
      let record = "";
      for (let i = 1; i < recordDiv.length; i++) {
        record =
          record +
          strip_html_tags(recordDiv[i].innerHTML.replace(/\&nbsp;/g, ""));
        if (i == 1) {
          record = record + "\n";
        }
      }
      postRecord(record, "AHS_Child");
      setTimeout(() => {
        chrome.storage.sync.remove("fields");
        chrome.storage.sync.remove("source");
        window.close();
      }, 2000);
    }
  } catch (err) {
    console.log(err.toString());
    let desc = `${err.toString()} in postAhsChildRecord() in Content Script`;
    insertFailLog(desc);
  }
}
