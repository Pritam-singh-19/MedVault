const User = require("../models/userModel");

// Get User Profile (Private)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure all fields are included in the response
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || "",
      dob: user.dob || "",
      address: user.address || "",
      state: user.state || "",
      city: user.city || "",
      pinCode: user.pinCode || "",
    };

    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Profile (Private)
const updateProfile = async (req, res) => {
  try {
    const { mobile, dob, address, state, city, pinCode, } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only if new values are provided
    user.mobile = mobile || user.mobile;
    user.dob = dob ? new Date(dob) : user.dob;
    user.address = address || user.address;
    user.state = state || user.state;
    user.city = city || user.city;
    user.pinCode = pinCode || user.pinCode;

    await user.save();

    // Send the updated profile back in response
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        address: user.address,
        state: user.state,
        city: user.city,
        pinCode: user.pinCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Save FCM Token (Private)
const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Add token if not already present
    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }
    res.status(200).json({ message: "FCM token saved" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getProfile, updateProfile, saveFcmToken };
