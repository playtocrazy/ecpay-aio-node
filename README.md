# ECPay All In One For Node.js
---
## The differences

This repository is forked from [ECPay/ECPayAIO_Node.js](https://github.com/ECPay/ECPayAIO_Node.js), but there're two major differences:

1. Using parameters injection instead of XML configuration.  
2. Fix gen_chk_mac_value function to generate a valid `checkMacValue`

## Install

    yarn add ecpay-aio-node

  OR  

    npm install ecpay-aio-node

## How to use

```javascript
import ecpay from 'ecpay-aio-node'

let base_param = {
    MerchantTradeNo: 'f0a0d7e9fae1bb72bc93'
    MerchantTradeDate: '2020/08/09 15:50:30'
    TotalAmount: '1000',
    TradeDesc: 'Trade Description',
    ItemName: 'Product Name',
    ReturnURL: 'https://us-central1-qraft-app.cloudfunctions.net/dev-createSampleOrder',
    EncryptType:'1'
};

let inv_params = {
     RelateNumber: 'SJDFJas97Gj11VOMSfK',
     CustomerID: '',
     CustomerIdentifier: '',
     CustomerName: 'User Name',
     CustomerAddr: 'Address',
     CustomerPhone: '0123456789',
     CustomerEmail: 'user@test.com',
     ClearanceMark: '2',
     TaxType: '1',
     CarruerType: '',
     CarruerNum: '',
     Donation: '0',
     LoveCode: '',
     Print: '1',
     InvoiceItemName: 'Product1|Product2',
     InvoiceItemCount: '2|3',
     InvoiceItemWord: 'PSC|PSC',
     InvoiceItemPrice: '35|10',
     InvoiceItemTaxType: '1|1',
     InvoiceRemark: 'Product1Desc|Product2Desc',
     DelayDay: 0,
     InvType: '07'
};

const create = new ecpay({
    operationMode: "Test",
    isProjectContractor: "N",
    ignorePayment: [],
    merchantInfo: {
        merchantID: "", // your MerchantID
        hashKey: "", // your HashKey
        hashIV: "" // your HashIV
    }
});
const html = create.payment_client.aio_check_out_all(parameters = base_param, invoice = inv_params);
```

## Fix gen_chk_mac_value function  

There is a bug in the original gen_chk_mac_value function from ECPay Node.js SDK, it will generate the wrong CheckMacValue and cause `CheckMacValue Error` when you are posting your form to ECPay site.

Now it has been fixed, For the detail of the code change you can see [here](https://github.com/playtocrazy/ecpay-aio-node/commit/9bc3a2cc95845ed5a98564af325b472d554789f1?branch=9bc3a2cc95845ed5a98564af325b472d554789f1&diff=split).

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

