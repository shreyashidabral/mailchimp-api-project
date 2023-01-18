require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mailchimp.setConfig({
  apiKey: process.env.APIKEY,
  server: "us10",
});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res){
    var fname = req.body.firstName;
    const lname = req.body.lastName;
    const email = req.body.email;

    const data = {
        members : [
            {
                email_address : email,
                status : "subscribed",
                merge_fields : {
                    FNAME : fname,
                    LNAME : lname 
                }
            }
        ]
    }

    const jsonData = JSON.stringify(data);

    const url = `https://us10.api.mailchimp.com/3.0/lists/${process.env.audienceID}`;

    const options = {
        method : "POST",
        auth : `shreyy:${process.env.APIKEY}`
    };

    const request = https.request(url, options, (response) => {

        if(response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");
        }else{
            res.sendFile(__dirname + "/failure.html");
        }

        response.on("data", (data)=>{
            console.log(JSON.parse(data));
        })
    })

    request.write(jsonData); 
    request.end();
});

app.post("/failure", (req, res)=>{
    res.redirect("/");
})




























async function run() {
    const response = await mailchimp.ping.get();
    console.log(response);
}
  
run();

app.listen(4000, () => {
    console.log("Server started at port 4000");
})
