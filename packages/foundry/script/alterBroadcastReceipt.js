const fs = require('fs');
const path = require('path');

// Check if a value exists in array of tuples
function containsValueInTuples(arr, value) {
  for (const [name, address] of arr) {
    if (address === value) {
      return name;
    }
  }
  return null;
}

function main() {
  
  let network = process.argv[2];

  if (network === "default_network") {
    network = "31337"
  }

  const broadcastReceiptPath = path.join(
    __dirname,
    "..",
    "broadcast",
    "Deploy.s.sol",
    network,
    "run-latest.json"
  );
  
  // Read and parse the JSON file
  fs.readFile(broadcastReceiptPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading broadcast receipt: ${err}`);
      process.exit(1);
    }
 
    try {
      const jsonObj = JSON.parse(data);
  
      let NamedAddresses = jsonObj.returns?.[0]?.value || "[]";

      // Ensure 'NamedAddresses' is a valid JSON array string
      if (typeof NamedAddresses === 'string') {
        // Replace single quotes with double quotes and parse as JSON
        NamedAddresses = JSON.parse(
          NamedAddresses
          .replace('(', '["')
          .replace(', ', '", "')
          .replace(')', '"]')
        );
      }
  
      // Check if 'NamedAddresses' is empty
      if (!Array.isArray(NamedAddresses) || NamedAddresses.length === 0) {
        throw new Error('Array NamedAddresses is empty or invalid in the JSON file.');
      }
  
      // Check if the JSON object has a "transactions" field that is an array
      if (Array.isArray(jsonObj.transactions)) {
        jsonObj.transactions.forEach((transaction, index) => {
          if (transaction.transactionType === 'CREATE' && transaction.contractName === null) {
            const contractAddress = transaction.contractAddress;
            const associatedName = containsValueInTuples(NamedAddresses, contractAddress);
  
            if (associatedName !== null) {
              jsonObj.transactions[index].contractName = "I" + associatedName;
            }
          }
        });
  
        // Write the updated JSON object back to the file
        const updatedJson = JSON.stringify(jsonObj, null, 2);
        fs.writeFile(broadcastReceiptPath, updatedJson, 'utf8', (err) => {
          if (err) {
            console.error(`Error modifying broadcast receipt: ${err}`);
            process.exit(1);
          }
        });
      } else {
        console.error('The "transactions" field is not an array in the JSON object.');
        process.exit(1);
      }
    } catch (parseError) {
      console.error(`Error parsing broadcast receipt: ${parseError}`);
      process.exit(1);
    }
    // } catch (emptyBError) {
    //   console.error(emptyBError.message);
    //   process.exit(1);
    // }
  });  
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}