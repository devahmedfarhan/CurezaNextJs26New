इस Ledger Dashboard और Commission Service के अनुसार, प्लेटफॉर्म चार्जेस (Platform Charges) का प्रतिशत इस प्रकार है:

1. Default Commission Rates (यदि कोई कस्टम रेट सेट नहीं है):
Platform Commission (प्लेटफॉर्म कमीशन): 25.00% (क्योरेज़ा का बेस प्लेटफॉर्म चार्ज)
Payment Gateway / COD fee (गेटवे या COD प्रोसेसिंग फीस): 2.50%
Total platform deduction (कुल प्लेटफॉर्म कटौती): 27.50% (टोटल कमीशन)
2. Tax & Compliance Splits (टैक्स और सरकारी नियम):
GST on Commission: प्लेटफॉर्म कमीशन पर 18% GST लगता है।
TCS (Tax Collected at Source): सेल प्राइस (Sale Price) का 1%।
TDS (Tax Deducted at Source): सेल प्राइस (Sale Price) का 1%।
Taxable Value (टैक्सेबल वैल्यू): सेल प्राइस में 18% GST शामिल मानकर Sale Price / 1.18 से निकाला जाता है।
3. Net Earnings (विक्रेता को मिलने वाला पैसा):
विक्रेता को मिलने वाला कुल पैसा (Amount Payable / Net Earnings) इस फार्मूला से तय होता है: $$\text{Amount Payable} = \text{Sale Price} - \text{Platform Commission (25%)} - \text{GST on Commission (18% on Comm.)} - \text{TCS (1%)} - \text{TDS (1%)}$$

नोट: यदि आपके स्टोर के लिए एडमिन द्वारा कोई कस्टम रेट सेट किया गया है, तो डेटाबेस से आपकी सेट की हुई कस्टम रेट (जैसे कि 15% या 20%) ही यहाँ रियल-टाइम में लोड होकर अप्लाई होती है।



1. Discount By Vendor (विक्रेता द्वारा दी गई छूट)
मतलब (Meaning): यह वह डिस्काउंट (छूट) है जो विक्रेता (Vendor) ने अपने प्रोडक्ट पर ग्राहक को दी है। यह प्रोडक्ट के अधिकतम खुदरा मूल्य (MRP) और अंतिम बिक्री मूल्य (Sale Price) के बीच का अंतर है।
कैलकुलेशन (Formula): $$\text{Discount By Vendor} = \text{MRP} - \text{Sale Price}$$
उदाहरण (Example): यदि प्रोडक्ट की MRP ₹100 है और आपने उसे ₹80 में बेचा (Sale Price), तो ₹20 इस कॉलम में दिखाई देगा।