		var strSel;
		var web3;
	    var Web3 = require('web3');
	function GetSelectedItem(el)
		{
		    var e = document.getElementById(el);
		     strSel =e.options[e.selectedIndex].value;
			 web3 = new Web3(new Web3.providers.HttpProvider(strSel));
		};





///////////////////////////////////////////////////////////// To Generate Wallet /////////////////////////////////////////////////////////////////////	
	
	var someDate = new Date();
	var dd = someDate.getDate();
	var mm = someDate.getMonth() + 1;
	var y = someDate.getFullYear();
	var someFormattedDate = (dd + '/'+ mm + '/'+ y);
	var keyObject;

	function Center(event) {
		if (event.keyCode !== 13 || event.which !== 13 ) {

		}
		if (event.keyCode == 13 || event.which == 13 ) {
			create_wallet();
		}
	}
	function create_wallet() {


		var numbers = /[0-9]/g;

		if (document.getElementById('passwordC').value !== "" && document.getElementById('passwordC').value.length >= 5 && document.getElementById('passwordC').value.match(numbers)
		 ) {			


			var submit = document.getElementById('submit');
			submit.style.display = 'none';
			var params = {keyBytes:32 , ivBytes: 16 };
			var dk = keythereum.create(params);
		
			var options = { kdf: "scrypt", cipher:"aes-128-ctr", kdfparams:{ c:262144, dklen:32, prf:"hmac-sha256" }};
			var passwordC = document.getElementById('passwordC').value;

			keyObject = keythereum.dump(passwordC, dk.privateKey, dk.salt, dk.iv, options);
		
			var data = "text/json;charset=utf-8," + JSON.stringify(keyObject,null,2);

			var json = document.getElementById('json');

			json_button.style.display='block';
			json_download_button.style.display='block';
			document.getElementById('precautions').style.display='block';
			json.href = 'data:' + data;
			json.download = ('Mallet360 ' + 'UTC/JSON.json');
			json.innerHTML = 'Download Keystore File (UTC/JSON)';
		}
	
		else{
			alert("Please enter a strong passwordC !");
		}

	};	
	
	function promote() {
		var xhttp = new XMLHttpRequest();
	  	xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	      		var a  = document.getElementById("body");
	      		a.innerHTML = this.responseText;
	    	}
  		};
  	xhttp.open("GET", "Mallet360_access.html", true);
  	xhttp.send();
	};


////////////////////////////////////////////////////////////// To Access Wallet /////////////////////////////////////////////////////////////////////	


	var passwordO;
	var uploadedFile;
	var my_address;

	function access_wallet(event){
    	uploadedFile = event.target.files[0]; 
    	if(uploadedFile.type !== "text/json" && uploadedFile.type !== "application/json") { 
	        alert("Wrong file type == " + uploadedFile.type); 
	        return false;
	    }
	};

	function Oenter(event) {
		if (event.keyCode == 13 || event.which == 13 ) {
			open_wallet();
		}
	}
    function open_wallet() {

		passwordO = document.getElementById('passwordO');
    	var numbers = /[0-9]/g;

		if (passwordO.value !== "" && passwordO.value.length >= 5	) {
		    if (uploadedFile) {
		        var readFile = new FileReader();
		        readFile.onload = function(e) { 
		            var contents = e.target.result;
		            var json = JSON.parse(contents);
		            json_data(json);
		            pk(passwordO.value, json);
		    	};
		        readFile.readAsText(uploadedFile);
		    }
		    else { 
		        alert("Failed to load file");
		    }
		}
		else{
			alert("Please Enter a PasswordO")
		}
    	};


//////////////////////////////////////////////////////////////// To Open Wallet /////////////////////////////////////////////////////////////////////

    var hex_decryptedPrivateKey;
    var publickey_forNonce;
	function json_data(json) {
		var xhttp = new XMLHttpRequest();
  		xhttp.onreadystatechange = function() {
	   		 if (this.readyState == 4 && this.status == 200) {
			    var a  = document.getElementById("body");
			    a.innerHTML = this.responseText;
			    my_address = ('0x'+json.address);
			    document.getElementById('my_address').innerHTML = my_address;
			    var bal1 = balance(my_address);
				document.getElementById('balance').innerHTML = ('<span style="color:white;"> Balance: </span>'+ bal1  + ' Ether');
		    }
  		};
  		xhttp.open("GET", "Mallet360_info.html", true);
  		xhttp.send();
	};

	function pk(pas,json) {
			var decryptedPrivateKey = keythereum.recover(pas, json )
			hex_decryptedPrivateKey = decryptedPrivateKey.toString('hex');
			publickey_forNonce = ("0x" + json.address);
			 		 
	}

	// var balance = (acct)=> {return web3.fromWei(web3.eth.getBalance(acct),'ether').toNumber()};

	function balance(acct) {

    	return web3.fromWei(web3.eth.getBalance(acct),'ether').toNumber()
    };

	function sendTx() {

		var getTransactionCount = web3.eth.getTransactionCount(publickey_forNonce);

		var privateKey = new ethereumjs.Buffer.Buffer(hex_decryptedPrivateKey,'hex')

			console.log("nonce : " + web3.toHex(getTransactionCount));
			console.log("gasPrice : " + web3.toHex(document.getElementById('gasPrice').value));
			console.log("gasLimit : " + web3.toHex(document.getElementById('gasLimit').value));
			console.log("toAddress : " + document.getElementById('toAddress').value)
			console.log("sendAmount : " + web3.toHex(web3.toWei((document.getElementById('sendAmount').value), 'ether')));

		var txParams = 
		{
		    nonce:    web3.toHex(getTransactionCount),
		    gasPrice: web3.toHex(document.getElementById('gasPrice').value),
		    gasLimit: web3.toHex(document.getElementById('gasLimit').value),
		    to:       document.getElementById('toAddress').value, 
		    value:    web3.toHex(web3.toWei((document.getElementById('sendAmount').value), 'ether')),
		    data:     ''
		};

  		var tx = new ethereumjs.Tx(txParams);
		
		tx.sign(privateKey);
		
		var serializedTx = tx.serialize().toString('hex');

	    var rawTx = '0x' + serializedTx;

		web3.eth.sendRawTransaction(rawTx, function (err, hash) {
		    if (!err)
		        alert("TX Hash : " + hash);
		    else
		        console.log(err);
		});
	};