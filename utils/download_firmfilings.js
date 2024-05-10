const axios = require("axios");
const fs = require("fs");
const path = require('path');
const jszip = require('jszip');
// download FirmFilings and unzip the file


async function unzipFile(zipFilePath, outputDir) {
    // Read the zip file into memory
    const data = fs.readFileSync(zipFilePath);
    
    // Load zip data with JSZip
    const zip = await jszip.loadAsync(data);
    
    // Process each file inside the zip archive
    Object.keys(zip.files).forEach(async filename => {
        const fileData = zip.files[filename];
        
        // Check if fileData is a directory
        if (!fileData.dir) {
            // Extract file contents
            const content = await fileData.async("nodebuffer");
            
            // Define the output file path
            const outputPath = path.join(outputDir, filename);
            
            // Ensure the directory structure is created
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });

            // Write the extracted file to disk
            fs.writeFileSync(outputPath, content);
        }
    });
}

function processFirmFilings(filePath) {
  const csvFile = fs.readFileSync(filePath, 'utf8');

  const results = Papa.parse(csvFile, {
      skipEmptyLines: true,
      complete: (results) => {
      }
  }).data;

  // Audit Partner Name, ID, Firm Name, ID, Audit Report Date, Issuer cik
  //         4            1      1       1           1              1
  const columnsToExtract = [25, 26, 27, 28, 29, 3, 2, 23, 19];
  let data = results.map(row => columnsToExtract.map(index => row[index]));
  data.sort((a, b) => {
    if(a[4] !== b[4]) {
      return a[4] - b[4];
    } else {
      return new Date(b[7]) - new Date(a[7]);
    }
  });
  data = data.slice(1);
  data.forEach(ap => {
    
  });
  return data.slice(1);
}

async function downloadFirmFilings(outputPath) {
  try {
    const writer = fs.createWriteStream(outputPath);
    return axios({
        method: 'get',
        url: 'https://pcaobus.org/assets/PCAOBFiles/FirmFilings.zip',
        responseType: 'stream'
    }).then(response => {
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    });
  } catch (error) {
    console.error(error);
  }
}

(async () => {
   await downloadFirmFilings("1.zip")
    .then(() => {
        outputPath = path.resolve("../audit-buzz-backend/data/");
        console.log(outputPath);
        unzipFile("1.zip", outputPath);
        // processFirmFilings(outputPath + "FirmFilings.csv")
    });
})();

module.exports = downloadFirmFilings;
