// src/components/EVOwner/EVOwnerSearch.jsx
import React, { useState } from "react";

export default function EVOwnerSearch({ onSearch }) {
  const [nic, setNic] = useState("");

  const handleSearch = () => {
    if (nic.trim() !== "") onSearch(nic.trim());
  };

  return (
    <div className="mb-4 flex items-center space-x-2">
      <input
        type="text"
        value={nic}
        onChange={(e) => setNic(e.target.value)}
        placeholder="Search by NIC"
        className="border rounded px-3 py-1 w-64"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        Search
      </button>
      <button
        onClick={() => { setNic(""); onSearch(null); }}
        className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
      >
        Reset
      </button>
    </div>
  );
}