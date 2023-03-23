<template>
    <div class="container">
        <Button class="button-88" @click="connectWallet()" >{{connetWalletVariable}}</Button>
        <div class="container1">
          <h1>🧙 Alchemy NFT Minter </h1>
          <h4>Simply add your asset's link name and description and then press mint</h4>
        </div>

        <div class="container1">
          <h1>🖼️ Link to Asset </h1>
         <input type="text" placeholder="https://ipfs.io/adasffsdfw232edwr/" size="50" v-model="link" required/>
        </div>

        <div class="container1">
          <h1>🤔 Name </h1>
         <input type="text" placeholder="My First NFT" size="50" v-model="name"/>
        </div>

        <div class="container1">
          <h1>✍️ Description </h1>
         <input type="text" placeholder="Even cooler than cryptokitties" size="50" v-model="description" required/>
        </div>
        <div class="container2">
        <Button class="button-29" @click="mint()" v-bind:disabled="mintButtonDisabled">Mint NFT</Button>
      </div>

      <p class="error">
          {{ errorMessage }}
      </p>
      <p class="success">
        <a v-bind:href="txnURL" target="_blank">{{successMessage}}</a>
      </p>
    </div>

</template>

<script>

import axios from 'axios'
import {PINATA_JWT_TOKEN, ETHER_URL} from "../utils/consts.js"
import {createAlchemyWeb3} from "@alch/alchemy-web3"

export default {
  name: 'FrontPage',
  data() {
    return {
      connetWalletVariable: "Connect Wallet",
      link:'',
      name:'',
      description:'',
      errorMessage: '',
      pinataURL: '',
      successMessage: '',
      txnURL: '',
    }
  },

  watch() {
    let x = this;
    if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        x.connetWalletVariable = accounts[0];
      }
    });
  }
  },

  computed: {
    mintButtonDisabled: function() {
      if(this.connetWalletVariable.includes("Connected")) {
        return false;
      } else {
        return true;
      }
    },

    fWallet: function() {
      return window.ethereum.selectedAddress;
    }
   
  },


  methods: {

    async mint() {

      console.log(this.mintButtonDisabled);

      if(this.name == null || this.name == '' || this.link == null || this.link == '' || this.description == null || this.description == '') {
        this.errorMessage = "Please fill name, link and description"
        return;
      }

      // call mint function here:
      // get _tokenId and hence fileName here
      const web3 = createAlchemyWeb3(ETHER_URL); 
      const contractABI = require('../contract-abi.json')
      const contractAddress = "0xa5e5d5453ac485114f692cb89eb51285a75a9adb";
      console.log(web3);       
      window.contract = new web3.eth.Contract(contractABI, contractAddress);

      let txnParams = {
        to: contractAddress,
        from: window.ethereum.selectedAddress,
        data: window.contract.methods._tokenIds().encodeABI(),
      }

      let hexValue = await window.ethereum.request({
        method: "eth_call",
        params: [txnParams],
      })

      let tokenNumber = parseInt(hexValue, 16);
      console.log("token_number", tokenNumber);
      // add to ipfs and MINT
      this.addDataToIPFSAndMint(tokenNumber);
      console.log("name:", this.name, "link:", this.link, "description:", this.description);
    },

    async addDataToIPFSAndMint(tokenNumber) {

      let jobj = {
        "pinataMetadata":{
          "name": tokenNumber+".json"
        },

        "pinataContent": {
          "name": this.name,
          "image": this.link,
          "description": this.description,
        }
      }

      console.log(jobj)

      this.pinJSONToIPFSAndMint(jobj);
  },


    async pinJSONToIPFSAndMint(jsonBody) {
      
      const secret = PINATA_JWT_TOKEN;
      let constURL = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: constURL,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer '+ secret,
        },
        data : jsonBody
    };


    let obj = this;

    axios.request(config).
    then(function(response) {
      let pinataUrl =  "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
      obj.pinataURL = pinataUrl;
      console.log(pinataUrl);

      // mint here
      obj.mintNFT();
      // take this variable and connect to huu7

      obj.name = '';
      obj.link = '';
      obj.description = '';
      
    }).catch((error) => {
      console.log(error);
      obj.errorMessage = error;
      obj.name = '';
      obj.link = '';
      obj.description = '';
    });
    },

  async mintNFT() {
      this.errorMessage = '';
      this.successMessage = '';
      const web3 = createAlchemyWeb3(ETHER_URL); 
      const contractABI = require('../contract-abi.json')
      const contractAddress = "0xe88a7ad1b1761238f3be748262d9bfca0f1d605d";
      console.log(web3);       
      window.contract = new web3.eth.Contract(contractABI, contractAddress);

      // make a txn
      let txnParams = {
        to: contractAddress,
        from: window.ethereum.selectedAddress,
        data: window.contract.methods.mintNFT(window.ethereum.selectedAddress, this.pinataURL).encodeABI(),
      }

      console.log(txnParams)


      try {
      const txnHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txnParams],
      })

      console.log(txnHash)
      this.txnURL = "https://goerli.etherscan.io/tx/"+txnHash;
      this.successMessage = "checkout your transaction at https://goerli.etherscan.io/tx/"+txnHash
    } catch(err) {
      this.errorMessage = err
    }


    },
    async connectWallet() {

      console.log("FirstWallet: ", this.fWallet);

      this.errorMessage = '';
      this.successMessage = '';
      console.log("connecting wallet");
      // connect wallet function here
      if(window.ethereum) {
      try {
        console.log("found");
        // get list of accounts
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log(addressArray);

        if(addressArray != null) {
          this.walletAddress = addressArray[0];
        }

      console.log(this.walletAddress);

         // set wallet address
      localStorage.setItem('wallet_address', addressArray[0])

      if(localStorage.getItem("wallet_address") == null || localStorage.getItem("wallet_address") == ""){
        // dont change button
        
      } else {
        // change button text to wallet address
        this.walletAddress = localStorage.getItem("wallet_address")
        let lastInitial =  this.walletAddress.length - 4;
        let lastLast = this.walletAddress.length
        this.connetWalletVariable = 'Connected: ' + localStorage.getItem("wallet_address").slice(0, 7) + "..." + localStorage.getItem("wallet_address").slice(lastInitial, lastLast);
        console.log(localStorage.getItem("wallet_address"))
      }

      } catch(err) {
        console.log(err);
        this.errorMessage = err
      }
    } else {

      this.errorMessage = "Error: Wallet not found please install metamask from : https://metamask.io/download.html"
    }

    

    },

    formatAddress(address) {
      let lastInitial =  address.length - 4;
      let lastLast = address.length
      return 'Connected: ' + address.slice(0, 7) + "..." + address.slice(lastInitial, lastLast);
    }

  }, 

  async mounted() {

    console.log("hi");
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });

        this.walletAddress = addressArray[0];
        this.connetWalletVariable = this.formatAddress(addressArray[0]); 
        localStorage.setItem("wallet_address", addressArray[0]);
      } catch(err) {
        // do nothing
        console.log(err);
      }
    } else {
      this.errorMessage = "Error: Wallet not found please install metamask from : https://metamask.io/download.html" 
    }

      // register listener
      // register listener

      let obj2 = this;

      window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        this.connetWalletVariable = obj2.formatAddress(accounts[0]);
        localStorage.setItem("wallet_address", accounts[0]);
        this.walletAddress = accounts[0];
      }});

  }

}


</script>

<style scoped>

.container {
  margin-right: 3%;
  margin-left: 20%;
}
/* CSS */
.button-88 {
  display: flex;
  align-items: center;
  font-family: inherit;
  font-weight: 500;
  font-size: 16px;
  padding: 0.7em 1.4em 0.7em 1.1em;
  color: white;
  background: #ad5389;
  background: linear-gradient(0deg, rgba(20,167,62,1) 0%, rgba(102,247,113,1) 100%);
  border: none;
  box-shadow: 0 0.7em 1.5em -0.5em #14a73e98;
  letter-spacing: 0.05em;
  border-radius: 20em;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  float: right;
}

.error {
  color: red;
  font-size: 1.3em;
  
}

.success {
  color: green;
  font-size: 1.3em;
}

.button-88:hover {
  box-shadow: 0 0.5em 1.5em -0.5em #14a73e98;
}

.button-88:active {
  box-shadow: 0 0.3em 1em -0.5em #14a73e98;
}

input[type=text] {
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    font-size: 1.3em;


}

input[type=text]:hover {
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    font-size: 1.3em;


}

input[type=text]:active {
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    font-size: 1.3em;

}

input[type=text]:focus {
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    font-size: 1.3em;
   
}

h1 {
  color: blue;
}

h4 {
  color: rgb(58, 58, 173)
}

/* CSS */
.button-29 {
  align-items: center;
  appearance: none;
  background-image: radial-gradient(100% 100% at 100% 0, #5adaff 0, #5468ff 100%);
  border: 0;
  border-radius: 6px;
  box-shadow: rgba(45, 35, 66, .4) 0 2px 4px,rgba(45, 35, 66, .3) 0 7px 13px -3px,rgba(58, 65, 111, .5) 0 -3px 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-family: "JetBrains Mono",monospace;
  height: 48px;
  justify-content: center;
  line-height: 1;
  list-style: none;
  overflow: hidden;
  padding-left: 16px;
  padding-right: 16px;
  position: relative;
  text-align: left;
  text-decoration: none;
  transition: box-shadow .15s,transform .15s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  will-change: box-shadow,transform;
  font-size: 18px;
}

button[enabled] .button-29:focus {
  box-shadow: #3c4fe0 0 0 0 1.5px inset, rgba(45, 35, 66, .4) 0 2px 4px, rgba(45, 35, 66, .3) 0 7px 13px -3px, #3c4fe0 0 -3px 0 inset;
}

button[enabled]  .button-29:hover {
  box-shadow: rgba(45, 35, 66, .4) 0 4px 8px, rgba(45, 35, 66, .3) 0 7px 13px -3px, #3c4fe0 0 -3px 0 inset;
  transform: translateY(-2px);
}

button[enabled] .button-29:active {
  box-shadow: #3c4fe0 0 3px 7px inset;
  transform: translateY(2px);
}

.container2 {
  margin-top: 2em;
}

button[disabled]{
  border: 1px solid #999999;
  background-color: #cccccc;
  background-image: radial-gradient(100% 100% at 100% 0, #d0d3ca 0, #808294 100%);
  color: #666666;
}
</style>