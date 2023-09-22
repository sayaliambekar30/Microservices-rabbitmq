const express = require("express");
const app = express();
const PORT = 7070;
const mongoose = require("mongoose");
const User = require("./user");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const saltRounds = 10;

// connect to database
mongoose
  .connect("mongodb://127.0.0.1:27017/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Auth-Service DB Connected`);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(express.json());

// Login route
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Password Incorrect" });
        }

        const payload = {
            email,
            name: user.name
        };

        jwt.sign(payload, "secret", (err, token) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Token generation failed" });
            } else {
                return res.status(200).json({ token: token });
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Something went wrong" , error: err.message });
    }
});


// Registration route
app.post("/auth/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({ message: "User already exists" });
        } else {
            const hash = bcrypt.hashSync(password, saltRounds);
            const newUser = new User({
                email: email,
                name: name,
                password: hash,
            });

            await newUser.save();

            return res.status(200).json(newUser);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" , error: err.message});
    }
});


app.listen(PORT, () => {
    console.log(`Auth-Service at ${PORT}`);
});
