const express = require("express");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs"); // Import the fs module
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
  destination: function (req, file, cb) {
    const className = req.body.className.trim();
    const destination = `./public/uploads/${className}`;

    // Create the directory if it doesn't exist
    fs.mkdir(destination, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating folder:", err);
      }
      cb(null, destination);
    });
  },
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
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const { phoneNumber, name, sex, birthday, className, phoneNumberParent } =
    req.body;

  try {
    const inputPath = path.join(
      __dirname,
      "public/uploads",
      className,
      req.file.filename
    );
    const outputFolderPath = path.join(
      __dirname,
      "public/uploads/compress",
      className
    );
    const outputFilename = req.file.filename;
    const outputPath = path.join(outputFolderPath, outputFilename);

    // Create the output folder if it doesn't exist
    fs.mkdirSync(outputFolderPath, { recursive: true });

    // Compress the image using sharp
    await sharp(inputPath)
      .resize(400, 400)
      .jpeg({ quality: 80 }) // Set the JPEG quality (0-100)
      .toFile(outputPath);

    console.log("Uploaded Data:", {
      phoneNumber,
      name,
      sex,
      birthday,
      className,
      imageName: outputFilename, // Use the compressed image's filename
      phoneNumberParent,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
