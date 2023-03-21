let env = require('dotenv').config({"path": "../.env"});
//const key = env.parsed.PINATA_API_KEY;
const secret = env.parsed.PINATA_JWT_TOKEN;
const axios = require("axios")

export const pinJSONToIPFS = async(jsonBody) => {
    let constURL = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    return axios.
    post(constURL, jsonBody, {headers: {
        Authorization: "Bearer " + secret,
    }}).then(function (response) {
        return {
            success: true,
            pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        }
    })
    .catch(
        function(error) {
            console.log(error)
            return {
                success: false,
                message: error.message
            }
        }
    );
}