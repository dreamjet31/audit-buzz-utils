const cheerio = require("cheerio");
const request = require("request");

async function httpGet({ url, headers }) {
  return new Promise((resolve, reject) => {
    request(url, { headers }, (error, res, body) => {
      return error ? reject(error) : resolve(body);
    });
  });
}

// Input: 10K filing url
// Output: auditor location
async function get_auditor_location(url) {
  try {
    const headers = {
      "User-Agent": "PostmanRuntime/7.26.8",
    };

    const body = await httpGet({ url, headers });
    // console.log(body);
    const $ = cheerio.load(body);

    let auditor_location = $(
      'ix\\:nonNumeric[name="dei:AuditorLocation"]'
    ).text();

    return auditor_location;
  } catch (error) {
    console.log(error);
  }
}

module.exports = get_auditor_location;
