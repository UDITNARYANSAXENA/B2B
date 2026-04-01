import { useState, useEffect } from 'react';
import Layout from './Layout';
import { Edit2 } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetch(`${API_BASE}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const saveEdit = async (id) => {
    const newCompanyName = document.getElementById('companyName').value.trim();

    if (!newCompanyName) {
      alert("Company name cannot be empty");
      return;
    }

    try {
      await fetch(`${API_BASE}/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ company: newCompanyName })
      });

      alert("Company Name Updated Successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to update company");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-xl">Loading Companies...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">All Companies (Sellers)</h1>
        <p className="text-gray-500">Total: {companies.length}</p>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-6">Company Name</th>
              <th className="text-left p-6">Seller Name</th>
              <th className="text-left p-6">Email</th>
              <th className="text-left p-6">Phone</th>
              <th className="w-32 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                {/* ← Yeh line main change hai */}
                <td className="p-6 font-semibold text-lg">
                  {c.company || "Not Provided"}
                </td>
                <td className="p-6 text-gray-600">{c.name || '-'}</td>
                <td className="p-6">{c.email}</td>
                <td className="p-6">{c.phone || '-'}</td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => setEditing(c)} 
                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition"
                  >
                    <Edit2 size={22} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal - Only Company Name Edit */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Edit Company Name</h3>
            
            <div className="mb-2 text-sm text-gray-500">Company Name</div>
            <input
              type="text"
              defaultValue={editing.company || ""}
              id="companyName"
              className="w-full border rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter Company Name"
            />

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setEditing(null)} 
                className="flex-1 py-4 border rounded-2xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveEdit(editing._id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium"
              >
                Save Company Name
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Companies;