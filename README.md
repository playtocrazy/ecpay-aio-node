# ECPay All In One For Node.js
---

## How to use
```
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
const htm = create.payment_client.aio_check_out_all(parameters = base_param, invoice = inv_params);
```


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

