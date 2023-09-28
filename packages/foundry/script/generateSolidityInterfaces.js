const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function findFilesWithExtension(dir, ext, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) return callback(err);
  
    const matchingFiles = [];
    let filesProcessed = 0;
  
    files.forEach((file) => {
      const filePath = path.join(dir, file);
  
      fs.stat(filePath, (err, stats) => {
        if (err) {
          filesProcessed++;
          if (filesProcessed === files.length) {
            callback(null, matchingFiles);
          }
          return;
        }
  
        if (stats.isDirectory()) {
          findFilesWithExtension(filePath, ext, (err, nestedMatchingFiles) => {
            if (err) {
              filesProcessed++;
              if (filesProcessed === files.length) {
                callback(null, matchingFiles);
              }
              return;
            }
  
            matchingFiles.push(...nestedMatchingFiles);
  
            filesProcessed++;
            if (filesProcessed === files.length) {
              callback(null, matchingFiles);
            }
          });
        } else if (path.extname(file) === ext) {
          matchingFiles.push(filePath);
        }

        filesProcessed++;
        if (filesProcessed === files.length) {
          callback(null, matchingFiles);
        }
      });
    });
  });
}

function executeSubprocess(files) {
  if (files.length === 0) {
    console.log("No .huff files found.");
    return;
  }

  files.forEach((file) => {
    console.log(`Generating Solidity interface for: ${file}`);
    const child = exec(`huffc ${file} --interface`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating interface: ${error}`);
      }
      console.log(`${stdout}`);
    });
  });
}

function main() {

  const path_to_huff_sources = path.join(
    __dirname,
    "..",
    "contracts",
    "huff"
  );
  
  findFilesWithExtension(path_to_huff_sources, ".huff", (err, files) => {
    executeSubprocess(files);
  });
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
