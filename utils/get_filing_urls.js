const request = require("request");
const cheerio = require("cheerio");

async function httpGet({ url, headers }) {
  return new Promise((resolve, reject) => {
    request(url, { headers }, (error, res, body) => {
      return error ? reject(error) : resolve(body);
    });
  });
}

function processBody(html) {
  const $ = cheerio.load(html);
  return (
    "https://www.sec.gov" +
    $("table.tableFile tr").eq(1).find("a").attr("href").replace("/ix?doc=", "")
  );
}

async function processDocument(docType, $, headers) {
  const href = `https://www.sec.gov${$("tr")
    .filter(
      (i, element) =>
        $(element).find("td:first-child").text().trim() === docType
    )
    .first()
    .find('td:nth-child(2) a:contains("Documents")')
    .attr("href")}`;

  // console.log(href);

  const body = await httpGet({ url: href, headers });
  return await processBody(body);
}

// Input: CIK number
// Output: filing urls of 10K, DEF 14A
async function get_filingUrls(cik) {
  const headers = {
    "User-Agent": "PostmanRuntime/7.26.8",
  };

  const cikStr = String(cik).padStart(10, "0");
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${cikStr}&owner=exclude`;
  console.log(url);

  const body = await httpGet({ url, headers });
  const $ = cheerio.load(body);

  let url_10K = "";
  let url_DEF14A = "";

  try {
    url_10K = await processDocument("10-K", $, headers);
    console.log(url_10K);
  } catch (error) {
    console.log(error);
  }

  try {
    url_DEF14A = await processDocument("DEF 14A", $, headers);
  } catch (error) {
    console.log(error);
  }

  // Extract SIC code
  const paragraphs = $("p.identInfo");

  let SICCode = null;

  paragraphs.each((i, el) => {
    const paragraph = $(el).html();

    const SICIndex = paragraph.indexOf("SIC");

    if (SICIndex !== -1) {
      const startIndex = paragraph.indexOf('">', SICIndex) + 2;
      const endIndex = paragraph.indexOf("</a>", startIndex);
      SICCode = paragraph.slice(startIndex, endIndex);
      return false; // This breaks the loop after finding first SIC code
    }
  });
  return { url_10K, url_DEF14A, SICCode };
}

(async () => {
  const result = await get_filingUrls(1844389);
  console.log(result);
})();

module.exports = get_filingUrls;
