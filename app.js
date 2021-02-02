const fs = require('fs');
const util = require('util');
const request = require('request');
const express = require('express')
const app = express()
const port = 3000
const readFile = util.promisify(fs.readFile);
const searchAPI='https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf&lang=en-en&text=';
const bigURL='http://norvig.com/big.txt';
let tmp = new Array();
let uniqueArray = new Array();
let string = new Array();
let finalDataArray = new Array();
let count = new Array();
var finalArray = [];
let objValue = {
	string: '',
	count: 0
}
function getStuff() {
	// return readFile('big.txt');
}
app.get('/', (req, res) => {
	request(bigURL, function (error, response, data) {
		let stringData = JSON.stringify(data.toString());
		//replace special chars
		let splittedData = stringData.replace(/\\n/g, " ").replace(/\|/g, " ").replace(/\[/g, " ").replace(/\]/g, " ").replace(/\\t/g, " ").replace(/[?=]/g, " ").replace(/\./g, " ").replace(/ +/g, " ")
		let splitspace = splittedData.split(" ");
		let n = 0;
		let final = [];
		//intialise array with count for 10
		while (tmp.length < 10) {
			try {
				let reg = new RegExp(splitspace[n], "g");
				let stringCount = splittedData.match(reg).length;
				if (splitspace[n].length >= 6 && !tmp.includes(splitspace[n]) && stringCount > 1) {
					tmp.unshift({ string: splitspace[n], count: stringCount });
					count.unshift(stringCount);
				}
			} catch (e) {
				// console.log(e);
			}
			n++;
		}
		//sort in asc
		finalDataArray = Object.entries(tmp).sort((a, b) => a[1].count - b[1].count);
		// loop for count all character
		for (let i = 0; i < splitspace.length / 100; i++) {
			console.log(i + " Finding...");
			try {
				let reg = new RegExp(splitspace[i], "g");
				let stringCount = splittedData.match(reg).length;
				if (splitspace[i].length >= 6 && !uniqueArray.includes(splitspace[i]) && stringCount > finalDataArray[0][1].count) {
					uniqueArray.push(splitspace[i]);
					finalDataArray.push([i, { string: splitspace[i], count: stringCount }]);
					finalDataArray.shift();
				}
			} catch (e) {
				// console.log(e);
			}
		}
		console.log(finalDataArray);
		//desc order 
		finalDataArray = Object.entries(finalDataArray).sort((a, b) => b[1][1].count - a[1][1].count);
		//final object generat
		finalSort(finalDataArray).then(data => {
			console.log('data')
			console.log(data)
			res.send(data);
		});
	})
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
// fnction to replace synonme for respective obj
async function finalSort(finalDataArray) {
	let finalArray = [];
	// console.log(finalDataArray);
	return new Promise(async (resolve, reject) => {
		for (i = 0; i < finalDataArray.length; i++) {
			console.log(finalDataArray[i][1][1].count);
			let result = await fetchPron(finalDataArray[i][1][1].string);
			if (result) {
				finalDataArray[i][1][1]['pos'] = result['pos'];
				finalDataArray[i][1][1]['syn'] = result['syn'];
			}
			finalArray.push(finalDataArray[i][1][1]);

		}
		resolve(finalArray)
	})

}

async function fetchPron(text) {
	console.log(text);
	return new Promise(function (resolve, reject) {
		request(`${searchAPI}${text}`, function (error, response, body) {
			let result = JSON.parse(body);
			let tmpobj = {}
			try {
				if (result.def.length > 0) {
					tmpobj.pos = result.def[0].pos;
					if (result.def[0].tr && result.def[0].tr[0].syn) {
						tmpobj.syn = result.def[0].tr[0].syn[0].text;
					}
				}
				resolve(tmpobj);
			} catch (e) {

			}

		});
	})

}