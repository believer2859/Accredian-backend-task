const express = require("express");
const { PrismaClient } = require("@prisma/client");
const validator = require("validator");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());


app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Endpoint to handle referral form submission
app.post("/api/referrals", async (req, res) => {
  const { name, email, referredBy } = req.body;

  if (!name || !email || !referredBy) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (name === referredBy) {
    return res
      .status(400)
      .json({ error: "Name and Referred By should not be the same" });
  }

  try {
    const newReferral = await prisma.referral.create({
      data: {
        name,
        email,
        referredBy,
      },
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "manishgodhani.tp@gmail.com",
        pass: "qmok psbn tlmc qcpk",
      },
    });

    const mailOptions = {
      from: "manishgodhani.tp@gmail.com",
      to: email,
      subject: "Referral Confirmation",
      text: `Hi ${name},\n\nThank you for the referral!\n\nBest Regards,\nAccredian`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });

    res.status(201).json(newReferral);
  } catch (error) {
    res.status(500).json({ error: "Error creating referral" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
