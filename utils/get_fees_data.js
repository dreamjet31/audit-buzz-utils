const cheerio = require("cheerio");
const request = require("request");

async function httpGet({ url, headers }) {
  return new Promise((resolve, reject) => {
    request(url, { headers }, (error, res, body) => {
      return error ? reject(error) : resolve(body);
    });
  });
}

// Input: DEF 14A filing url
// Output: audit fees, audit-related fees, tax fees, all other fees, total
async function get_fees_data(url) {
  try {
    const headers = {
      "User-Agent": "PostmanRuntime/7.26.8",
    };

    const body = await httpGet({ url, headers });
    let $ = cheerio.load(body);

    // Find the table containing "audit fees"
    const table = $("table").filter(function () {
      return $(this).text().toLowerCase().includes("audit fees");
    });

    $ = cheerio.load(table.html());
    $("body").find("b, sup").remove();

    // Get and filter the text content
    let text = $("body")
      .text()
      .trim()
      .split("\n")
      .filter((x) => x.trim())
      .map((item) =>
        isNaN(item.replace(/[\$,]/g, "").replace("—", 0))
          ? item
          : parseInt(item.replace(/[\$,]/g, "").replace("—", 0))
      )
      .filter((item) => !Number.isNaN(item));

    // Find index and get remaining text after "audit fees"
    const slicedText = text.slice(
      text.findIndex(
        (item) =>
          typeof item === "string" && item.toLowerCase().includes("audit fees")
      )
    );

    const numbers = slicedText.filter((item) => typeof item === "number");
    // console.log(numbers);
    return numbers;
  } catch (error) {
    console.error(error);
  }
}

module.exports = get_fees_data;
