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

// (async () => {
//    await downloadFirmFilings("1.zip")
//     .then(() => {
//         outputPath = path.resolve("../../audit-buzz-backend/data/");
//         console.log(outputPath);
//         unzipFile("1.zip", outputPath);
//     });
// })();

module.exports = downloadFirmFilings;
