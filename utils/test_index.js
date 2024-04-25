const get_filing_urls = require("./get_filing_urls");
const get_fees_data = require("./get_fees_data");
const get_10k = require("./get_10k_data");
const get_auditor_location = require("./get_auditor_location");

(async () => {
  const cik = 1121404;
  const urls = await get_filing_urls(cik);
  const data_10k = await get_10k(cik);
  const auditor_location = await get_auditor_location(urls.url_10K);
  const fees_data = await get_fees_data(urls.url_DEF14A);
  console.log(data_10k);
  console.log(auditor_location);
  console.log(fees_data);
})();
