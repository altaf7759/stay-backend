require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");
const cors = require("cors");
const User = require("./models/userModel");
const Property = require("./models/propertyModel");
const Wishlist = require("./models/wishlistModel");
const app = express();

const client = new OAuth2Client(
  "537603122600-eie1b52uijo6b62hv6k9vbem2hhto9bj.apps.googleusercontent.com"
);

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify your uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: file size limit
}).fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Google login route
app.post("/login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "537603122600-eie1b52uijo6b62hv6k9vbem2hhto9bj.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const user = await User.findOne({ email: payload.email });

    if (user) {
      console.log("user found");
      res.json({ message: "Login successful", user: payload, id: user._id });
      return;
    }
    const newUser = await User.create({
      email: payload.email,
      name: payload.name,
    });

    res.json({ message: "User created", user: payload, id: newUser._id });
  } catch (error) {
    console.log("error with login", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Property listing route
app.post("/list-your-properties", upload, async (req, res) => {
  try {
    const formData = req.body; // The form data sent from frontend

    if (!formData) {
      return res.status(400).json({ message: "Form data is missing" });
    }

    // Handle file uploads
    formData.images = req.files.images
      ? req.files.images.map((file) => file.path)
      : [];
    formData.video = req.files.video ? req.files.video[0].path : null;

    // Create the new property
    const newFormData = await Property.create({
      listedBy: formData.listedBy,
      propertyType: formData.propertyType,
      title: formData.title,
      description: formData.description,
      city: formData.city,
      area: formData.area,
      landmark: formData.landmark,
      pincode: formData.pincode,
      rent: formData.rent,
      deposite: formData.deposite,
      electricityBill: formData.electricityBill,
      waterBill: formData.waterBill,
      internetBill: formData.internetBill,
      maintenance: formData.maintenance,
      furnishingStatus: formData.furnishingStatus,
      occupancyType: formData.occupancyType,
      facilities: {
        parking: formData.parking,
        cctv: formData.cctv,
        laundry: formData.laundry,
        ac: formData.ac,
        geyser: formData.geyser,
        cooler: formData.cooler,
        gym: formData.gym,
        lift: formData.lift,
        powerBackup: formData.powerBackup,
      },
      tenantPreference: formData.tenantPreference,
      genderPreference: formData.genderPreference,
      smokingAllowed: formData.smokingAllowed,
      alcoholAllowed: formData.alcoholAllowed,
      petsAllowed: formData.petsAllowed,
      ownerName: formData.ownerName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      images: formData.images,
      video: formData.video,
    });

    res.json({
      message: "Property created successfully!",
      propertyDetails: newFormData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

// Get all properties
app.get("/properties-list", async (req, res) => {
  try {
    const propertiesList = await Property.find();
    res.status(200).json({ list: propertiesList });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

app.get("/property/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const propertyDetails = await Property.findById(id);
    if (!propertyDetails) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({
      property: propertyDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the property details" });
  }
});

// Search properties
app.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send("Query is required.");
  }

  try {
    const data = await Property.find({
      $or: [{ city: new RegExp(query, "i") }, { area: new RegExp(query, "i") }],
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Error with search query.");
  }
});

app.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await Property.find({ listedBy: userId });
    console.log(userId);

    res.json({
      list: list,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      message: "Error fetching properties",
      error: error.message,
    });
  }
});

app.post("/wishlist/add/:userId/:propertyId", async (req, res) => {
  const { userId, propertyId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(propertyId)
    ) {
      return res.status(400).json({ error: "Invalid userId or propertyId" });
    }

    let wishlist = await Wishlist.findOne({ userId: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, wishlistProperties: [] });
    }

    if (!wishlist.wishlistProperties.includes(propertyId)) {
      wishlist.wishlistProperties.push(propertyId);
    } else {
      return res.status(200).json({ message: "Property already in wishlist" });
    }

    await wishlist.save();

    res.status(200).json({
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

app.delete("/wishlist/remove/:userId/:propertyId", async (req, res) => {
  const { userId, propertyId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      res.status(404).json({ message: "Property not found in wishlist" });
    }

    wishlist.wishlistProperties = wishlist.wishlistProperties.filter(
      (id) => id.toString() !== propertyId
    );
    await wishlist.save();

    res.status(200).json({ message: "Property removed from wishlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove property from wishlist" });
  }
});

app.get("/wishlist/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate(
      "wishlistProperties"
    );

    if (wishlist) {
      res.status(200).json({ wishlist: wishlist.wishlistProperties });
    } else {
      res.status(404).json({ message: "Wishlist not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
