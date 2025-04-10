
require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
//cors
const cors = require("cors");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests with no origin (like mobile apps, Postman)
        return callback(null, true);
      }
      return callback(null, true); // Allow all origins
    },
    credentials: true, // Allow cookies, authorization headers
  })
);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       return callback(null, true); // Accept all origins dynamically
//     },
//     credentials: true,
//   })
// );




//importing the Router
const useRouter = require('./user')
//importing the database
const database = require('./db1') 
//ejs file
app.set('view engine','ejs')
//jwt encoding
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')//it will encode req.body
app.use(bodyParser.urlencoded({extended:true}))
//importing schema
const user = require('./model1')
//jwt token importing
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cookieParser())

app.get('/',(req,res)=>{
    res.status(200).json({message:"Hello World"})
})



app.post('/signup', async (req, res) => {
    console.log(req.body);
    const { fullName, email, password: plainTextPassword } = req.body;

    try {
        // Check if email already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(plainTextPassword, salt);

        // Create new user
        await user.create({
            fullName,
            email,
            password: encryptedPassword
        });

        return res.status(200).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Check if user exists
        const userObj = await user.findOne({ email });
        if (!userObj) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // 2️⃣ Check if password matches
        const isPasswordValid = await bcrypt.compare(password, userObj.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // 3️⃣ Generate JWT token
        const token = jwt.sign(
            { userId: userObj._id, email: email, type: "user" },
            process.env.SECRET_KEY,
            { expiresIn: "2h" }
        );

        // 4️⃣ Set token in cookies securely
        res.cookie("token", token, {
            httpOnly: true,  // Prevents access by JavaScript
            secure:true,
            sameSite: "None",  // Allow cross-origin cookies
            maxAge: 2 * 60 * 60 * 1000  // 2 hours
        });

        // 5️⃣ Send success response with token
        return res.status(200).json({ message: "Login successful", token });

        // res.redirect('/protected')
        

    } catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/protected',(req,res)=>{
    const {token} = req.cookies
    try{
        if(token){
            const tokenData = jwt.verify(token,process.env.SECRET_KEY)
            console.log(tokenData)
            if(tokenData.type == 'user'){
                return res.status(200).send({message:"token contains user type"})
            }else{
                return res.status(404).send({message:"no user type token"})
            }
        }else{
            res.redirect('/signin')
        }
    }catch(error){
        console.error('Error verifying token',error)
        res.redirect('/signin')
    }
})


// app.post("/logout", (req, res) => {
//     res.clearCookie("token", {
//         httpOnly: true,
//         secure: true, // Change to true if using HTTPS
//         sameSite: "None"
//     });

//     return res.status(200).json({ message: "Logged out successfully" });
// });

app.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Change to true if using HTTPS
        sameSite: "Lax"
    });

    return res.status(200).json({ message: "Logged out successfully" });
});


  


app.use('/routes',useRouter)


const currentServer = 5152
app.listen(currentServer);
console.log('Server is Listening on' + currentServer)

