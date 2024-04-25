const axios = require("axios");

// Input CIK number
// Output: marketCap, revenue, marketCap attribute
async function get_10k(cik) {
  try {
    const cikStr = String(cik).padStart(10, "0");
    const url_companyfacts = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cikStr}.json`;

    let response = await axios({
      method: "get",
      url: url_companyfacts,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    let marketCap, revenue;

    if (response.data.facts.dei.EntityPublicFloat.units) {
      marketCap =
        response.data.facts.dei.EntityPublicFloat.units.USD.slice(-1)[0].val;
    }

    const attribute = "RevenueFromContractWithCustomerExcludingAssessedTax";

    if (
      response.data.facts["us-gaap"] &&
      response.data.facts["us-gaap"][attribute] &&
      response.data.facts["us-gaap"][attribute].units
    ) {
      let revenueData = response.data.facts["us-gaap"][attribute].units.USD;
      const targetFrames = ["CY2021", "CY2022", "CY2023", "CY2024"];
      const newData = revenueData.filter((item) =>
        targetFrames.includes(item.frame)
      );

      revenue = newData.reduce((accumulator, currentValue) => {
        accumulator[currentValue.frame] = currentValue.val;
        return accumulator;
      }, {});
    }

    return {
      cikStr: cikStr,
      marketCap: marketCap,
      revenue: revenue,
      attribute: attribute,
    };
  } catch (error) {
    console.error(error);
  }
}

// (async () => {
//   const result = await get_10k(22444);
//   console.log(result);
// })();

module.exports = get_10k;
