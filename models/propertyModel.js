const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    listedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["Hostel/PG", "Flat/Room", "Girls Hostel/PG"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    pincode: {
      type: String,
      required: true,
    },
    rent: {
      type: String,
      required: true,
    },
    deposite: {
      type: String,
    },
    electricityBill: {
      type: Boolean,
      default: false,
    },
    waterBill: {
      type: Boolean,
      default: false,
    },
    internetBill: {
      type: Boolean,
      default: false,
    },
    maintenance: {
      type: String,
    },
    furnishingStatus: {
      type: String,
      enum: ["Full Furnished", "Semi-Furnished", "Unfurnished"],
      required: true,
    },
    occupancyType: {
      type: String,
      enum: ["Single", "Double", "Triple"],
      required: true,
    },
    facilities: {
      parking: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      cctv: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      laundry: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      ac: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      cooler: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      geyser: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      gym: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      lift: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
      powerBackup: {
        type: String,
        enum: ["Yes", "No"],
        default: "No",
      },
    },
    tenantPreference: {
      type: String,
      enum: ["Students", "Working Professionals", "Family", "Bachelors"],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ["Male", "Female", "Any"],
      required: true,
    },
    smokingAllowed: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
      required: true,
    },
    alcoholAllowed: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
      required: true,
    },
    petsAllowed: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: true,
    },
    video: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
