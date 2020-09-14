/**
 * Created by ying.wu on 2017/6/12.
 */
const fs = require('fs');
const et = require('elementtree');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

// const EventEmitter = require('events').EventEmitter;

class APIHelper {
    constructor(options){
        if (!options.merchantInfo || !options.merchantInfo.merchantID || !options.merchantInfo.hashIV || !options.merchantInfo.hashKey) {
            throw new Error("Should specify the complete `merchantInfo.merchantID`, `merchantInfo.hashIV` and `merchantInfo.hashKey`")
        }
        this.op_mode = options.operationMode || "Test";
        this.contractor_stat = options.isProjectContractor || "N";
        this.ignore_payment = options.ignorePayment || [];
        this.merc_id = options.merchantInfo.merchantID;
        this.hkey = options.merchantInfo.hashKey;
        this.hiv = options.merchantInfo.hashIV;
        this.date = new Date();
    }
    get_mercid(){
        return this.merc_id;
    }
    get_op_mode(){
        return this.op_mode;
    }
    get_ignore_pay(){
        return this.ignore_payment;
    }
    get_curr_unixtime(){
        return this.date.getTime().toString().slice(0, 10);
    }
    is_contractor(){
        if (this.contractor_stat === 'N') {
            return false
        } else if (this.contractor_stat === 'Y') {
            return true
        } else {
            throw new Error("Unknown [IsProjectContractor] configuration.");
        }
    }
    urlencode_dot_net(raw_data, case_tr='DOWN'){
        if (typeof raw_data === 'string') {
            let encode_data = encodeURIComponent(raw_data);
            switch (case_tr) {
                case 'KEEP':
                    // Do nothing
                    break;
                case 'UP':
                    encode_data = encode_data.toUpperCase();
                    break;
                case 'DOWN':
                    encode_data = encode_data.toLowerCase();
                    break;
            }
            encode_data = encode_data.replace(/\'/g,"%27");
            encode_data = encode_data.replace(/\~/g,"%7e");
            encode_data = encode_data.replace(/\%20/g,"+");
            return encode_data
        } else {
            throw new Error("Data received is not a string.");
        }
    }
    encode_special_param(params, target_arr){
        let urlencode_dotnet = this.urlencode_dot_net;
        if (params.constructor === Object) {
            target_arr.forEach(function (n) {
                if (Object.keys(params).includes(n)) {
                    params[n] = urlencode_dotnet(params[n]);
                }
            });
        }
    }
    gen_chk_mac_value(params, mode=1){
        if (params.constructor === Object) {
            // throw exception if param contains CheckMacValue, HashKey, HashIV
            let sec = ['CheckMacValue', 'HashKey', 'HashIV'];
            sec.forEach(function (pa) {
                if (Object.keys(params).includes(pa)) {
                    throw new Error(`Parameters shouldn't contain ${pa}`);
                }
            });
      
            // solution inspired from https://gist.github.com/tom19960222/166fff7cf797b4392f4324db86b34105?fbclid=IwAR1iqdWR5z-khgTv0YlfoTQ6rifJvrKHBjiUWclt0ANVu96YO-MeQqW2-wY
            let checkValue = Object.keys(params)
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                .map(key => `${key}=${params[key]}`)
                .join("&");
            checkValue = encodeURIComponent(`HashKey=${this.hkey}&${checkValue}&HashIV=${this.hiv}`).toLowerCase();
            checkValue = checkValue.replace(/%20/g, '+')
                         .replace(/%2d/g, '-')
                         .replace(/%5f/g, '_')
                         .replace(/%2e/g, '.')
                         .replace(/%21/g, '!')
                         .replace(/%2a/g, '*')
                         .replace(/%28/g, '(')
                         .replace(/%29/g, ')');
            console.log(checkValue)
      
            switch (mode){
                case 0:
                     checkValue = crypto.createHash('md5').update(checkValue).digest('hex');
                    break;
                case 1:
                     checkValue = crypto.createHash('sha256').update(checkValue).digest('hex');
                    break;
                default:
                    throw new Error("Unexpected hash mode.");
            }
      
            return checkValue.toUpperCase();
        } else {
            throw new Error("Data received is not a Object.");
        }
    }
    gen_aes_encrypt(params){
        if (params.constructor === Object){
            // throw exception if param contains HashKey, HashIV
            let sec = ['HashKey', 'HashIV'];
            sec.forEach(function (pa) {
                if (Object.keys(params).includes(pa)) {
                    throw new Error(`Parameters shouldn't contain ${pa}`);
                }
            });
            let encipher = crypto.createCipheriv('aes-128-cbc', this.hkey, this.hiv);
            let text = params['PaymentToken'];
            let encrypted_base64 = Buffer.concat([encipher.update(text), encipher.final()]).toString('base64');
            return this.urlencode_dot_net(encrypted_base64);
        } else {
            throw new Error(`Data received is not a Object.`);
        }
    }
    http_request(method, api_url, payload){
        if (method !== "GET" && method !== "POST") {
            throw new Error("Only GET & POST method are available.");
        }

        var target_url = url.parse(api_url);
        var postData = querystring.stringify(payload);
        var http_op;

        if (target_url.protocol === 'https:'){
            http_op = https;
        } else if (target_url.protocol === 'http:'){
            http_op = http;
        } else {
            throw new Error("Only http & https protocol are available.");
        }

        var options = {
            protocol: target_url['protocol'],
            hostname: target_url['hostname'],
            path: target_url['path'],
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            }
        };

        return new Promise((resolve, reject) => {

            const req = http_op.request(options, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                // res.setEncoding('utf8');
                const body = [];
                res.on('data', (chunk) => {
                    // console.log(`BODY: ${chunk}`);
                    body.push(chunk);
                });
                res.on('end', () => {
                    // console.log('response data.');
                    // console.log(body);
                    resolve(body);
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
                reject(e)
            });

            req.write(postData);
            req.end();
        });
    };
    gen_html_post_form(act, id, parameters, input_typ='hidden', submit=true){
        var html = "<form id=\""+ id +"\" action=\""+ act + "\" method=\"post\">";
        Object.keys(parameters).forEach(function (key) {
            html += "<input type=\""+ input_typ +"\" name=\"" + key + "\" id=\"" + key + "\" value=\"" + parameters[key] + "\" />";
        });
        if (submit === true){
            html += `<script type="text/javascript">document.getElementById("${id}").submit();</script>`;
        }
        html += "</form>";
        // console.log(typeof html);
        return html
    }
    valid_chkmc_string(str){
       let rtn_obj = {};
       let rtn_arr = str.split('&');
       rtn_arr.forEach(function (e) {
          let param = e.split('=');
          rtn_obj[param[0]] = param[1];
       });
       let chkmac = rtn_obj['CheckMacValue'];
       delete rtn_obj['CheckMacValue'];
       let val = '';
       if (chkmac.length === 64){
           val = this.gen_chk_mac_value(rtn_obj);
       } else if (chkmac.length === 32) {
           val = this.gen_chk_mac_value(rtn_obj, 0);
       }
       if (chkmac === val){
           return true
       } else {
           return false
       }

    }

}
module.exports = APIHelper;