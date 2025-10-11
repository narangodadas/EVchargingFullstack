// src/components/EVOwner/EVOwnerList.jsx
import React from "react";

export default function EVOwnerList({ owners, onEdit, onActivate, onDeactivate, onDelete }) {
  if (!owners || owners.length === 0) return <p>No EV owners found.</p>;

  return (
    <table className="min-w-full border divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left">NIC</th>
          <th className="px-4 py-2 text-left">Full Name</th>
          <th className="px-4 py-2 text-left">Email</th>
          <th className="px-4 py-2 text-left">Phone</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {owners.map((o) => (
          <tr key={o.nic}>
            <td className="px-4 py-2">{o.nic}</td>
            <td className="px-4 py-2">{o.fullName}</td>
            <td className="px-4 py-2">{o.email}</td>
            <td className="px-4 py-2">{o.phone}</td>
            <td className="px-4 py-2">{o.isActive ? "Active" : "Inactive"}</td>
            <td className="px-4 py-2 space-x-1">
              <button onClick={() => onEdit(o)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                Edit
              </button>
              {o.isActive ? (
                <button onClick={() => onDeactivate(o.nic)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                  Deactivate
                </button>
              ) : (
                <button onClick={() => onActivate(o.nic)}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
                  Activate
                </button>
              )}
              <button onClick={() => onDelete(o.nic)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}