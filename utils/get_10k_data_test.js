const axios = require("axios");

// Input CIK number
// Output: marketCap, revenue, marketCap attribute
async function get_10k(cik) {
  const cikStr = String(cik).padStart(10, "0");
  const url_companyfacts = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cikStr}.json`;
  const url_submissions = `https://data.sec.gov/submissions/CIK${cikStr}.json`;

  let url_companyfactsCall = axios({
    method: "get",
    url: url_companyfacts,
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  let url_submissionsCall = axios({
    method: "get",
    url: url_submissions,
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  return Promise.all([url_companyfactsCall, url_submissionsCall])
    .then(function (responses) {
      // handle url_companyfacts response
      const response1 = responses[0];
      const marketCap =
        response1.data.facts.dei.EntityPublicFloat.units.USD.slice(-1)[0].val;

      const attribute = "RevenueFromContractWithCustomerExcludingAssessedTax";
      const revenueData = response1.data.facts["us-gaap"][attribute].units.USD;

      const targetFrames = ["CY2021", "CY2022", "CY2023", "CY2024"];
      const newData = revenueData.filter((item) =>
        targetFrames.includes(item.frame)
      );

      const revenue = newData.reduce((accumulator, currentValue) => {
        accumulator[currentValue.frame] = currentValue.val;
        return accumulator;
      }, {});

      const response2 = responses[1];
      const zipCode = response2.data.addresses.business.zipCode;

      console.log("marketCap: ", marketCap);
      console.log("revenue: ", revenue);
      console.log("attribute: ", attribute);
      console.log("zipCode: ", zipCode);

      return {
        cikStr: cikStr,
        marketCap: marketCap,
        revenue: revenue,
        attribute: attribute,
      };
    })
    .catch(function (error) {
      console.error(error);
    });
}

(async () => {
  const result = get_10k(885550);
  console.log(result);
})();
