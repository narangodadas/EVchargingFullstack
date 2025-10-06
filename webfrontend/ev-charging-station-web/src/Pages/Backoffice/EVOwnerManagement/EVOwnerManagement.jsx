// src/pages/BackofficeDashboard.jsx
import React, { useState, useEffect } from "react";
import EVOwnerSearch from "../../../Components/EVOwner/EVOwnerSearch";
import EVOwnerList from "../../../Components/EVOwner/EVOwnerList";
import EVOwnerForm from "../../../Components/EVOwner/EVOwnerForm";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5296/api/evowners",
  headers: { "Content-Type": "application/json" },
});

export default function EVOwnerManagement() {
  const [owners, setOwners] = useState([]);
  const [editingOwner, setEditingOwner] = useState(null);

  const fetchAll = async () => {
    const res = await api.get("/");
    setOwners(res.data);
  };

  const handleSearch = async (nic) => {
    if (!nic) return fetchAll();
    try {
      const res = await api.get(`/${nic}`);
      setOwners(res.data ? [res.data] : []);
    } catch (err) {
      setOwners([]);
    }
  };

  const handleSave = async (owner) => {
    try {
      if (editingOwner) {
        await api.put(`/${owner.nic}`, owner);
      } else {
        await api.post("/", owner);
      }
      setEditingOwner(null);
      fetchAll();
    } catch (err) {
      alert("Error saving EV Owner");
    }
  };

  const handleActivate = async (nic) => {
    await api.patch(`/${nic}/activate`);
    fetchAll();
  };

  const handleDeactivate = async (nic) => {
    await api.patch(`/${nic}/deactivate`);
    fetchAll();
  };

  const handleDelete = async (nic) => {
    if (window.confirm("Are you sure you want to delete this EV Owner?")) {
      await api.delete(`/${nic}`);
      fetchAll();
    }
  };

  const handleEdit = (owner) => setEditingOwner(owner);

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">EV Owner Management</h1>

      <EVOwnerSearch onSearch={handleSearch} />

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setEditingOwner({})}
      >
        + Create New Owner
      </button>

      {editingOwner || !owners.length ? (
        <EVOwnerForm initialData={editingOwner} onSave={handleSave} onCancel={() => setEditingOwner(null)} />
      ) : null}

      <EVOwnerList
        owners={owners}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

      
    </div>
  );
}