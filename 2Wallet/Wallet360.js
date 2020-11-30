
var web3;
var Web3 = require('web3');
var privateKey;
var uploadedFile;
var myAddress;
var gaslimit = 210000;
var gasPrice;

/**
	* networkSelection select a network node
* @param id,  DOM ID of selected network
*/
function networkSelection(id) {
	var selected = id.options[id.selectedIndex].value;
	web3 = new Web3(new Web3.providers.HttpProvider(selected));
};

networkSelection(document.getElementById('mySelect'));

/**
	* txFeeCalculator calculate transactoin cost
* @param id,  DOM id to represent calculated transactoin cost
*/
function txFeeCalculator(id) {
	document.getElementById('gasPriceValue').innerHTML = id.value + " Gwei";
	gasPrice = id.value * 1000000000;
	transactionCost = (gasPrice * gaslimit) / 1000000000000000000;
	document.getElementById('transactionCost').value = transactionCost + " Ether";
};

txFeeCalculator(document.getElementById('gasPrice'));

/**
	* balance get online balance 
* @param acct, account for balance inquary 
*/
function balance(acct) {

	return (web3.fromWei(web3.eth.getBalance(acct), 'ether').toNumber()).toFixed(3);
};

/**
* loading wait until key creation is in process
*/
function loading() {								//show loading image while keys creation are prosessing on back
	var numbers = /[0-9]/g;
	var password = document.getElementById('passToCreate').value;		// password to encrypt keys
	if (password.length >= 5) {
		if (password.match(numbers)) {
			document.getElementById('submit1').style.display = 'none';
			document.getElementById('noteP').style.display = 'none';
			document.getElementById('loading').style.display = 'block';
			setTimeout(createKeyWallet, 1);
		}
		else {
			alert("Please Enter atleast one Ditgit !");
		}
	}
	else {
		alert("Please Enter atleast five characters long Password !");
	}
};

/**
* enterToCreate call a function on ENTER key press
* @param event, event on which function will call;
*/
function enterToCreate(event) {						// call a function on Enter kry press
	if (event.keyCode == 13 || event.which == 13) {
		loading();
	}
};

/**
* createKeyWallet creats wallet using Keythereum Library
*/
function createKeyWallet() {
	var password = document.getElementById('passToCreate').value;		// password to encrypt keys
	var params = { keyBytes: 32, ivBytes: 16 };
	var dk = keythereum.create(params);						// keyethereum function to create keys

	var options = { kdf: "scrypt", cipher: "aes-128-ctr", kdfparams: { c: 262144, dklen: 32, prf: "hmac-sha256" } };
	var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options); //function to dump keys in json file
	var data = "text/json;charset=utf-8," + JSON.stringify(keyObject, null, 2);

	var jsonDownload = document.getElementById('jsonDownload');
	var doneButton = document.getElementById('doneButton');			// process to download json file
	var jsonDownloadButton = document.getElementById('jsonDownloadButton');			// process to download json file

	jsonDownload.href = 'data:' + data;
	jsonDownload.download = ('Wallet360 UTC/JSON.json');
	jsonDownload.innerHTML = 'Download Keystore ';
	doneButton.style.display = 'block';
	jsonDownloadButton.style.display = 'block';

	document.getElementById("loading").style.display = "none";
	document.getElementById('precautions').style.display = 'block';
};

var generatedMnemonic;

/**
* generateMnemonic generate Random mnemonic using bip39 library
*/
function generateMnemonic() {
	generatedMnemonic = bip39.generateMnemonic();
	document.getElementById("randomMnemonicBar").innerHTML = generatedMnemonic;
	document.getElementById('precautionsText').style.display = 'block';
	// localStorage.clear();
}

/**
* passForEncryption show a DOM with input field for password
*/
function passForEncryption() {
	document.getElementById('hideIt').style.display = 'none';
	document.getElementById('showIt').style.display = 'block';
}

/**
	* enterToCreateHDWallet call a function on ENTER key press
	* @param event, event on which function will call
	*/
function enterToCreateHDWallet(event) {
	if (event.keyCode == 13 || event.which == 13) {
		createHDWallet();
	}
}

/**
* createHDWallet creats wallet using ethereum_wallet Library
*/
function createHDWallet() {

	var password = document.getElementById('passToGenerateSeed').value;
	var seed = bip39.mnemonicToSeed(generatedMnemonic, password); // Generate Seeds from Mnemonic

	const hd = hdkey.fromMasterSeed(seed);	  // Generate HD keys form Seed
	var nodeDerivationPath = "m/44'/60'/0'/0/0"; // Derivation Path give information where from we wants start retriving adress from the tree	
	const node = hd.derivePath(nodeDerivationPath); //Combine HD keys with nodeDerivationPath
	var addressIndexWallet = node.getWallet();  //Generate a Wallet from HD Keys

	myAddress = ("0x" + addressIndexWallet.getAddress().toString("hex")); // Retrive Adressess
	var publicKey = addressIndexWallet.getPublicKey().toString('hex'); // Retrive public Key
	privateKey = addressIndexWallet.getPrivateKey().toString('hex'); // Retrive private Key

	// setCookie(Password,generatedMnemonic)
	containerInfo();
	document.getElementById('myAddress').innerHTML = myAddress;
	document.getElementById('myPrivateKey').value = privateKey;
	document.getElementById('balance').innerHTML =
		('<span style="color:white;"> </span>' + balance(myAddress) + ' Ether');
};


//////////////////////////////////////////////////////////////// To Open Wallet ///////////////////////////////////
/**
* loadFile create an object of file when a josn file is selected
*/
function loadFile(event) {
	uploadedFile = event.target.files[0];
	if (uploadedFile.type !== "text/json" && uploadedFile.type !== "application/json") {
		document.getElementById("alertJson").innerHTML = ("Wrong file type == " + uploadedFile.type);
		document.getElementById("alertJson").style.display = 'block';
		return false;
	}
	else {
		document.getElementById('fileName').innerHTML = (uploadedFile.name + " file is Selected");

	}
};

/**
* enterToOpen call a function on ENTER key press 
* @param event, event on which function will call;
*/
function enterToOpen(event) {										// call a function on Enter kry press
	if (event.keyCode == 13 || event.which == 13) {
		openWallet();
	}
};

/**
* openWallet Extrect address form json file.
*/
function openWallet() {
	var password = document.getElementById('passToOpen').value;     // password to decrept keys			
	if (uploadedFile) {
		if (password !== "") {									// read data from uploaded json file
			var readFile = new FileReader();
			readFile.onload = function (e) {
				var contents = e.target.result;
				var json = JSON.parse(contents);

				myAddress = ("0x" + json.address);
				privateKey = (keythereum.recover(password, json)).toString('hex');
				document.getElementById('myAddress').innerHTML = myAddress;
				document.getElementById('myPrivateKey').value = privateKey;
				document.getElementById('balance').innerHTML =
					('<span style="color:white;"> </span>' + balance(myAddress) + ' Ether');
				containerInfo();
			};
			readFile.readAsText(uploadedFile);
		}
		else {
			document.getElementById("alertJson").innerHTML = "Please enter a password!"
			document.getElementById("alertJson").style.display = 'block';
		}
	}
	else {
		document.getElementById("alertJson").innerHTML = "Please select a file!"
		document.getElementById("alertJson").style.display = 'block';
	}
};

/**
	* enterToOpenHDWallet call a function on ENTER key press 
	* @param event, event on which function will call;
	*/
function enterToOpenHDWallet(event) {
	if (event.keyCode == 13 || event.which == 13) {
		openHDWallet();
	}
}

/**
	* openHDWallet Extract address from given Mnemonic
*/
function openHDWallet() {
	var password = document.getElementById('passToOpenHDWallet').value;
	var enteredMnemonic = document.getElementById('enteredMnemonic').value;
	if (enteredMnemonic !== "") {
		var seed = bip39.mnemonicToSeed(enteredMnemonic, password); // Generate Seeds from Mnemonic
		const hd = hdkey.fromMasterSeed(seed);	  // Generate HD keys form Seed
		var nodeDerivationPath = "m/44'/60'/0'/0/0"; // Derivation Path give information where from we wants start retriving adress from the tree	
		const node = hd.derivePath(nodeDerivationPath); //Combine HD keys with nodeDerivationPath
		var addressIndexWallet = node.getWallet();  //Generate a Wallet from HD Keys

		myAddress = ("0x" + addressIndexWallet.getAddress().toString("hex")); // Retrive Adressess
		var publicKey = addressIndexWallet.getPublicKey().toString('hex'); // Retrive public Key
		privateKey = addressIndexWallet.getPrivateKey().toString('hex'); // Retrive private Key

		// setCookie(password,generatedMnemonic)
		containerInfo();
		document.getElementById('myAddress').innerHTML = myAddress;
		document.getElementById('myPrivateKey').value = privateKey;
		document.getElementById('balance').innerHTML =
			('<span style="color:white;"> </span>' + balance(myAddress) + ' Ether');
	} else {
		document.getElementById('alertMne').style.display = 'block';
	}
}

var list = { "symbol": [], "contractAddrArray": [] }

/**
	* appendTokenButton choose between ethers and tokens to send
*/
function appendTokenButton() {
	var len = list.symbol.length;
	toggle = document.getElementById('toggle');

	var length = toggle.options.length;
	for (i = 0; i < length; i++) {
		toggle.options[i + 1] = null;
	}
	for (var i = 0; i < len; i++) {
		var opt = document.createElement('option');
		opt.value = list.contractAddrArray[i];
		opt.innerHTML = list.symbol[i];
		toggle.appendChild(opt);
	}
}

/**
* popUp show a div to add token in wallet
*/
function popUp() {
	document.getElementById('mainBody').classList.add("wrapper");
	document.getElementById('containerContract').style.display = 'block';
}

/**
* contractAdd extract contract symbol and demical from contract address
*/
function contractAdd() {

	var contractAddr = document.getElementById("contractAddress").value;

	if (contractAddr.length == 42) {
		var contractABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenOwner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "acceptOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "to", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "tokens", "type": "uint256" }, { "name": "data", "type": "bytes" }], "name": "approveAndCall", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "newOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "tokenAddress", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "transferAnyERC20Token", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenOwner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "tokenOwner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" }], "name": "Approval", "type": "event" }]

		tokenContract = (web3.eth.contract(contractABI).at(contractAddr));

		var tokenDecimal = (function () {
			var decimal = tokenContract.decimals();
			return function () { return decimal; }
		})();


		var tokenDecimals = (function () {
			var decimal = '1' + '0'.repeat(tokenContract.decimals().c[0]);
			return function () { return decimal; }
		})();

		var tokenSymbol = (function () {
			var symbol = tokenContract.symbol();
			return function () { return symbol; }
		})();

		function tokenBalance(acct) {
			var balance = tokenContract.balanceOf(acct)

			balance = (balance / tokenDecimals());
			return balance.toFixed(3)
		}

		(function autoFill() {
			document.getElementById('tokenSymbol').value = tokenSymbol();
			document.getElementById("tokenDecimal").value = tokenDecimal();
		})();
	}
}

/**
	* appendToken add and show tokens in token list
*/
function appendToken() {

	var contractAddr = document.getElementById("contractAddress").value;

	var tokenDecimal = (function () {
		var decimal = tokenContract.decimals();
		return function () { return decimal; }
	})();

	var tokenDecimals = (function () {
		var decimal = '1' + '0'.repeat(tokenContract.decimals().c[0]);
		return function () { return decimal; }
	})();

	var tokenSymbol = (function () {
		var symbol = tokenContract.symbol();
		return function () { return symbol; }
	})();

	function tokenBalance(acct) {
		var balance = tokenContract.balanceOf(acct);
		balance = (balance / tokenDecimals());
		return balance.toFixed(3)
	}
	// var i = 0;
	// len = list.contractAddrArray.length;
	// for(;i<len;){
	// 	if (contractAddr !== list.contractAddrArray[i]) {

	list.symbol.push(tokenSymbol());
	list.contractAddrArray.push(contractAddr);

	var br = document.createElement("br");

	var tokenList = document.createElement("div");
	tokenList.classList.add("tokenList");

	var div1 = document.createElement("div");
	div1.classList.add("Asymbol");
	div1.innerHTML = (tokenSymbol());

	var div2 = document.createElement("div");
	div2.classList.add("Aamount");
	div2.innerHTML = (tokenBalance(myAddress));

	tokenList.appendChild(div1);
	tokenList.appendChild(div2);

	var element = document.getElementById('list');

	element.appendChild(tokenList);
	appendTokenButton();
	closePopUp();
	window.scrollTo(0, document.body.scrollHeight);
	// 	}
	// 	i++;
	// }
}

/**
* closePopUp hide a div which apppear to add token in wallet
*/
function closePopUp() {
	document.getElementById("contractAddress").value = '';
	document.getElementById("tokenSymbol").value = '';
	document.getElementById("tokenDecimal").value = '';
	document.getElementById('mainBody').classList.remove("wrapper");
	document.getElementById('containerContract').style.display = 'none';
}

/** 
* call a function on ESC key press
*/
document.addEventListener("keyup", function (e) {
	if (e.keyCode === 27) { // ESC
		closePopUp();
	}
});

/** 
* transaction make a raw transaction
*/
function transaction() {									// Raw Transaction function
	var selected;
	(function tokenSelection() {
		var e = document.getElementById('toggle');
		selected = e.options[e.selectedIndex].value;
	})();

	var signingkey = new ethereumjs.Buffer.Buffer(privateKey, 'hex'); 			//buffer to privatekey	

	if (selected == "ether") {
		var txparams = 																//parameters for transaction
		{
			nonce: web3.toHex(web3.eth.getTransactionCount(myAddress)),
			gasPrice: gasPrice,
			gasLimit: gaslimit,
			to: document.getElementById('toAddress').value,
			value: web3.toHex(web3.toWei((document.getElementById('sendAmount').value), 'ether')),
			data: ""
		};
		var tx = new ethereumjs.Tx(txparams); 										//transaction object
		tx.sign(signingkey);
		var rawTx = '0x' + tx.serialize().toString('hex');
		sendRawTransaction(rawTx);
	}
	else {
		var toAddress = document.getElementById('toAddress').value;
		var noOfToken = ((document.getElementById('sendAmount').value) * 1000000000000000000);
		var data = tokenContract.transfer.getData(toAddress, noOfToken);
		var txparams = 																//parameters for transaction
		{
			nonce: web3.toHex(web3.eth.getTransactionCount(myAddress)),
			gasPrice: gasPrice,
			gasLimit: gaslimit,
			to: selected,
			value: "0x00",
			data: data
		};
		var tx = new ethereumjs.Tx(txparams); 										//transaction object
		tx.sign(signingkey);
		var rawTx = '0x' + tx.serialize().toString('hex');
		sendRawTransaction(rawTx);

	}
}

/** 
* sendRawTransaction sends raw transaction
*/
function sendRawTransaction(rawTransaction) {
	web3.eth.sendRawTransaction(rawTransaction, function (err, hash) {					//SendRaw Transaction 
		if (!err) {
			document.getElementById('ransactionTrack').href = ("https://rinkeby.etherscan.io/tx/" + hash);
			document.getElementById("trackDiv").style.display = "inline";
			setTimeout(function () {
				document.getElementById("trackDiv").style.display = "none";
			}, 5000)
		}
		else {
			console.log(err);
		}
	});
}

/** 
* balanceRefresh retrive current balance
*/
function balanceRefresh() {								// A refrash button to refrash balance after transaction
	document.getElementById('balance').innerHTML =
		('<span style="color:white;"></span>' + balance(myAddress) + ' Ether');
}

/** 
* eyeOnPk hide or show Private Key
*/
function eyeOnPk() {
	var x = document.getElementById("myPrivateKey");
	if (x.type === "password") {
		x.type = "text";
	}
	else {
		x.type = "password";
	}
}

///////////////////////////////Ajax request is replaced with DOM (Below function are for DOM manipulation)////////////

/* These function are for DOM manupulation */

function containerFront() {
	document.getElementById('containerFront').style.display = 'block';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function containerCreate() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'block';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function containerOpen() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'block';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function createWithKeythereum() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'block';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function createWithHDWallet() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'block';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';
	document.getElementById('showIt').style.display = 'none';
	document.getElementById('hideIt').style.display = 'block';
	document.getElementById('precautionsText').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function openWithKeythereum() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'block';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function openWithHDWallet() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'block';
	document.getElementById('containerInfo').style.display = 'none';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
function containerInfo() {
	document.getElementById('containerFront').style.display = 'none';
	document.getElementById('containerCreate').style.display = 'none';
	document.getElementById('containerOpen').style.display = 'none';
	document.getElementById('createWithKeythereum').style.display = 'none';
	document.getElementById('createWithHDWallet').style.display = 'none';
	document.getElementById('openWithKeythereum').style.display = 'none';
	document.getElementById('openWithHDWallet').style.display = 'none';
	document.getElementById('containerInfo').style.display = 'block';

	document.getElementById('passToCreate').value = "";
	document.getElementById('passToOpen').value = "";
	document.getElementById('randomMnemonicBar').innerHTML = "";
	document.getElementById('enteredMnemonic').value = "";
	document.getElementById('passToOpenHDWallet').value = "";
};
