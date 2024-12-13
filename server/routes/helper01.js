const fs = require('node:fs/promises');
const path = require('path');
const dataPath = path.join(__dirname, '../data/Investordata.json');
const dataPath1 = path.join(__dirname, '../data/news.json');
const dataPath2 = path.join(__dirname, '../data/Sustainability.js');
async function readInvestorData() {
    try {
      const data = await fs.readFile(dataPath, { encoding: 'utf8' });
    //   console.log(data);
    return data;
    } catch (err) {
      console.log(err);
    }
  }
async function readNewsData() {
    try {
      const data = await fs.readFile(dataPath1, { encoding: 'utf8' });
    //   console.log(data);
    return data;
    } catch (err) {
      console.log(err);
    }
  }
async function readSustainabilityData() {
    try {
      const data = await fs.readFile(dataPath2, { encoding: 'utf8' });
    //   console.log(data);
    return data;
    } catch (err) {
      console.log(err);
    }
  }
module.exports={readInvestorData,readNewsData,readSustainabilityData};