require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));    //bodyparser middleware
app.use(express.static("public"));                  //Static folder

mailchimp.setConfig({                  //configuring mailchimp api
  apiKey: process.env.APIKEY,
  server: "us10",
});

//Get and Post Routes

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

    const url = `https://us10.api.mailchimp.com/3.0/lists/${process.env.listID}`;

    const options = {
        method : "POST",
        auth : `shreyy:${process.env.APIKEY}`
    };

    const request = https.request(url, options, (response) => {

        //if signup data is successfully sent to mailchimp servers
        if(response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");       //display success page
        }else{
            res.sendFile(__dirname + "/failure.html");       //else display failure page
        }

        response.on("data", (data)=>{
            console.log(JSON.parse(data));
        })
    })

    // request.write(jsonData); 
    request.end();
});

//Post route for success page
app.post("/success", (req, res)=>{         //When user clicks try again button on success page
    res.redirect("/");                     //redirects to home route i.e. signup page
});

//Post route for failure page 
app.post("/failure", (req, res)=>{         //When user clicks try again button on failure page
    res.redirect("/");                     //redirects to home route i.e. signup page
})


//Get API : fetches list of all contacts 
app.get('/listUsers', async(req, res, next)=>{
    const response = await mailchimp.lists.getListMembersInfo(`${process.env.listID}`);
    console.log(response);
    res.status(200).json(response);
});

//Post API : send an email 
app.post('/campaign/sendmail', async(req, res, next)=>{
    const response = await mailchimp.messages?.send({ message: {
      html: "<p>This is your custom HTML assigned to your campaign as content.</p>",
      text : "optional text to be sent",
      subject : "The message subject",
      from_email : "shreyashidabral@gmail.com",
      to : [{
        email : "shreyashidabral543@gmail.com",
        name : "Shrey"
      }],
      important : true    
    }
    });
    console.log(response);
    res.status(200).json(response);
});

//Post API : send bulk email for a campaign 
app.post('/campaign/sendcampignmail', async(req, res, next)=>{
    const campaign_response = await mailchimp.campaigns.create({
        type:"plaintext",
        recipients: {
            list_id:`${process.env.listID}`     //send to all list contacts
        },
        settings:{
            subject_line:"Test Subject",
            title:"Sample Title",
            from_name:"Shreyashi",
            reply_to:"noreply@mydomain.com",
            template_id:`${process.env.templateID}`
        },
        content_type:"template"
    });
    console.log(campaign_response);

    const sendmsg_response = await mailchimp.messages?.sendTemplate({
        template_name: "Sample Template4",
        template_content: [],
        message: {
          subject : "Sample Subject",
          text : "This is the sample text",
          from_email : "test12@gmail.com",
          to : [{
              email : "shreyashidabral543@gmail.com", 
              name : "Shreyashi",
              type : "to"
          }],
          important : true,
          auto_text : true,
          auto_html : true,
        }
    });

    // const sendmsg_response = await client.campaigns.send("campaign_id");
    // console.log(sendmsg_response);

    res.status(200).json(sendmsg_response);
});


// const createtemplate = async () => {
//     const response = await mailchimp.templates.create({
//       name: "Sample Template4",
//       html: `<p>This is your custom HTML assigned to your campaign as content.</p>`,
//     });
//     console.log(response);
// };

app.listen(4000, () => {
    console.log("Server started at port 4000");
})
