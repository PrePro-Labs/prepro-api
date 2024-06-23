const router = require("express").Router();
const { sendEmail } = require("../../config/functions");

router.post("/submit", (req, res) => {
  const { type, message, user } = req.body;

  try {
    sendEmail(
      "johngaynordev@gmail.com tylergoodall3@gmail.com",
      null,
      null,
      `SUPPORT TICKET - ${type}`,
      `${user.name} (${user.email}): ${message}`
    );
    res.status(200).json({ message: "Successfully submitted support ticket" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
