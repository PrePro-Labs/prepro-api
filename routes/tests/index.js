const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "TEST UNPROTECTED ROUTE" });
});

router.get("/protected", auth, (req, res) => {
  const { id } = req.params;

  res.status(200).json({ message: "TEST PROTECTED ROUTE" });
});

router.get("/test/:id", (req, res) => {
  const { id } = req.params;

  res.status(200).json({ message: `ROUTE FOR ID=${id}` });
});

function auth(req, res, next) {
  const isAuthenticated = true;
  if (isAuthenticated) {
    next();
  } else {
    res
      .status(400)
      .json({ message: "you are not authenticated to view this data." });
  }
}
module.exports = router;
