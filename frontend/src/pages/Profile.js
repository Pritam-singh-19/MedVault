import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    dob: "",
    address: "",
    state: "",
    city: "",
    pinCode: "",
  });

  // Fetch latest profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setProfile(result);
      setFormData(result);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formDataObj = new FormData();
  
      // Append form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataObj.append(key, formData[key]);
      });
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // Do NOT set Content-Type, fetch automatically sets it for FormData
        },
        body: formDataObj,
      });
      
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
  
      alert("Profile updated successfully!");
      fetchProfile(); // Refresh profile after update
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    }
  };
  

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      {/* Profile Photo Section */}

  
      <h2>My Profile</h2>
      <div className="profile-details">
        <p><strong>Name:</strong> {profile?.name || "Not Available"}</p>
        <p><strong>Email:</strong> {profile?.email || "Not Available"}</p>
        <p><strong>Mobile:</strong> {profile?.mobile || "Not Set"}</p>
        <p><strong>Date of Birth:</strong> {profile?.dob ? new Date(profile.dob).toDateString() : "Not Set"}</p>
        <p><strong>Address:</strong> {profile?.address || "Not Set"}</p>
        <p><strong>State:</strong> {profile?.state || "Not Set"}</p>
        <p><strong>City:</strong> {profile?.city || "Not Set"}</p>
        <p><strong>Pin Code:</strong> {profile?.pinCode || "Not Set"}</p>
      </div>
  
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Details"}
      </button>
  
      {showForm && (
        <form className="profile-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Mobile number" name="mobile" value={formData.mobile} onChange={handleChange} />
          <input type="date" placeholder="DOB" name="dob" value={formData.dob} onChange={handleChange} />
          <input type="text" placeholder="Address" name="address" value={formData.address} onChange={handleChange} />
          <input type="text" placeholder="State" name="state" value={formData.state} onChange={handleChange} />
          <input type="text" placeholder="City" name="city" value={formData.city} onChange={handleChange} />
          <input type="text" placeholder="Pin Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
          <button type="submit">Update Profile</button>
        </form>
      )}
    </div>
  );
  
};

export default Profile;
