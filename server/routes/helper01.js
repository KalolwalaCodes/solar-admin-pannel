const fs = require('node:fs/promises');
const path = require('path');
const dataPath = path.join(__dirname, '../data/Investordata.json');

async function readInvestorData() {
    try {
      const data = await fs.readFile(dataPath, { encoding: 'utf8' });
    //   console.log(data);
    return data;
    } catch (err) {
      console.log(err);
    }
  }
module.exports=readInvestorData;