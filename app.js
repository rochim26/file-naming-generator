const express = require("express");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp"); // Import sharp library
const app = express();
const port = 3000;

function cutStringTo30Chars(inputString) {
  if (inputString.length > 30) {
    return inputString
      .replace(/\b\w/g, function (match) {
        return match.toUpperCase();
      })
      .substring(0, 30); // Add ellipsis if the string is longer
  } else {
    return inputString;
  }
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const { phoneNumber, name, sex, birthday, className, phoneNumberParent } =
      req.body;

    const customFilename = `${phoneNumber
      .replace(/[-\s]/g, "")
      .trim()}#I${cutStringTo30Chars(
      name
    )}#S${sex}#B${birthday}#C${className.trim()}#P${phoneNumberParent
      .replace(/[-\s]/g, "")
      .trim()}#${phoneNumber
      .replace(/[-\s]/g, "")
      .trim()}#T1#M${phoneNumberParent.replace(/[-\s]/g, "").trim()}`;
    const filename = `${customFilename.trim()}.jpg`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  // Render the form for uploading data and image
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const { phoneNumber, name, sex, birthday, className, phoneNumberParent } =
    req.body;
  const imageName = req.file.filename;

  const inputPath = path.join(__dirname, "public/uploads", req.file.filename);
  const outputFilename = req.file.filename;
  const outputPath = path.join(
    __dirname,
    "public/uploads/compress",
    outputFilename
  );

  // Compress the image using sharp
  await sharp(inputPath)
    .resize(400, 400)
    .jpeg({ quality: 80 }) // Set the JPEG quality (0-100)
    .toFile(outputPath);

  // Store data and image details in your database or file system
  // For simplicity, we'll just log the data for now
  console.log("Uploaded Data:", {
    phoneNumber,
    name,
    sex,
    birthday,
    className,
    imageName,
    phoneNumberParent,
  });

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
