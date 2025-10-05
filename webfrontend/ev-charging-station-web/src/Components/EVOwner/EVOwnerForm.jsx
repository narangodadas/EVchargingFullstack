// src/components/EVOwner/EVOwnerForm.jsx
import React, { useState, useEffect } from "react";

export default function EVOwnerForm({ initialData, onSave, onCancel }) {
  const [owner, setOwner] = useState({
    nic: "",
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (initialData) setOwner(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setOwner({ ...owner, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(owner);
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-2 mb-4 bg-gray-50">
      <div>
        <label className="block">NIC</label>
        <input
          type="text"
          name="nic"
          value={owner.nic}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
          required
          disabled={!!initialData} // disable NIC if editing
        />
      </div>
      <div>
        <label className="block">Full Name</label>
        <input type="text" name="fullName" value={owner.fullName} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div>
        <label className="block">Email</label>
        <input type="email" name="email" value={owner.email} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="block">Phone</label>
        <input type="text" name="phone" value={owner.phone} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="space-x-2">
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded">
          Save
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}