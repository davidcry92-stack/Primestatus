import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const StrainsManagement = () => {
  const [strains, setStrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStrain, setEditingStrain] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newStrain, setNewStrain] = useState({
    name: '',
    category: 'lows',
    type: 'hybrid',
    thc_content: '',
    cbd_content: '',
    effects: '',
    flavors: '',
    ailments: '',
    description: '',
    price_range: '',
    availability: true,
    image: null
  });
  const { apiCall } = useContext(AuthContext);

  const categories = [
    { id: 'lows', name: 'Lows (Affordable)', icon: '💰', color: 'bg-green-900 text-green-300' },
    { id: 'deps', name: 'Deps (Regular)', icon: '🌿', color: 'bg-yellow-900 text-yellow-300' },
    { id: 'za', name: 'Za (Premium)', icon: '⭐', color: 'bg-purple-900 text-purple-300' }
  ];

  const strainTypes = [
    { id: 'indica', name: 'Indica', icon: '🌙' },
    { id: 'sativa', name: 'Sativa', icon: '☀️' },
    { id: 'hybrid', name: 'Hybrid', icon: '🌓' }
  ];

  useEffect(() => {
    loadStrains();
  }, []);

  const loadStrains = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall('/api/admin/strains', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStrains(data.strains || []);
      }
    } catch (error) {
      console.error('Failed to load strains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image must be less than 5MB');
        return;
      }

      setNewStrain({ ...newStrain, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      
      // Add all strain data
      Object.keys(newStrain).forEach(key => {
        if (key !== 'image') {
          formData.append(key, newStrain[key]);
        }
      });

      // Add image if provided
      if (newStrain.image) {
        formData.append('image', newStrain.image);
      }

      const url = editingStrain 
        ? `/api/admin/strains/${editingStrain.id}`
        : '/api/admin/strains';
      
      const method = editingStrain ? 'PUT' : 'POST';

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        resetForm();
        loadStrains();
        alert(editingStrain ? 'Strain updated successfully!' : 'Strain added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save strain: ${error.detail}`);
      }
    } catch (error) {
      console.error('Failed to save strain:', error);
      alert('Failed to save strain');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (strain) => {
    setEditingStrain(strain);
    setNewStrain({
      name: strain.name,
      category: strain.category,
      type: strain.type,
      thc_content: strain.thc_content || '',
      cbd_content: strain.cbd_content || '',
      effects: strain.effects || '',
      flavors: strain.flavors || '',
      ailments: strain.ailments || '',
      description: strain.description || '',
      price_range: strain.price_range || '',
      availability: strain.availability !== false,
      image: null
    });
    setImagePreview(strain.image_url || null);
  };

  const handleDelete = async (strainId) => {
    if (!confirm('Are you sure you want to delete this strain?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/strains/${strainId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadStrains();
        alert('Strain deleted successfully!');
      } else {
        alert('Failed to delete strain');
      }
    } catch (error) {
      console.error('Failed to delete strain:', error);
      alert('Failed to delete strain');
    }
  };

  const resetForm = () => {
    setEditingStrain(null);
    setNewStrain({
      name: '',
      category: 'lows',
      type: 'hybrid',
      thc_content: '',
      cbd_content: '',
      effects: '',
      flavors: '',
      ailments: '',
      description: '',
      price_range: '',
      availability: true,
      image: null
    });
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Strains Management</h2>
        <div className="text-sm text-gray-400">
          🌿 Manage strains for Lows, Deps, and Za categories
        </div>
      </div>

      {/* Add/Edit Strain Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          {editingStrain ? 'Edit Strain' : 'Add New Strain'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Strain Name</label>
              <input
                type="text"
                value={newStrain.name}
                onChange={(e) => setNewStrain({ ...newStrain, name: e.target.value })}
                placeholder="e.g., OG Kush, Blue Dream"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={newStrain.category}
                onChange={(e) => setNewStrain({ ...newStrain, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Strain Type</label>
              <select
                value={newStrain.type}
                onChange={(e) => setNewStrain({ ...newStrain, type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              >
                {strainTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">THC Content</label>
              <input
                type="text"
                value={newStrain.thc_content}
                onChange={(e) => setNewStrain({ ...newStrain, thc_content: e.target.value })}
                placeholder="e.g., 18-24%"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CBD Content</label>
              <input
                type="text"
                value={newStrain.cbd_content}
                onChange={(e) => setNewStrain({ ...newStrain, cbd_content: e.target.value })}
                placeholder="e.g., 0.1-1%"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={newStrain.description}
              onChange={(e) => setNewStrain({ ...newStrain, description: e.target.value })}
              placeholder="Describe the strain, its characteristics, and growing information..."
              rows="3"
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Effects</label>
              <input
                type="text"
                value={newStrain.effects}
                onChange={(e) => setNewStrain({ ...newStrain, effects: e.target.value })}
                placeholder="e.g., Relaxing, Euphoric, Creative"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Flavors</label>
              <input
                type="text"
                value={newStrain.flavors}
                onChange={(e) => setNewStrain({ ...newStrain, flavors: e.target.value })}
                placeholder="e.g., Citrus, Pine, Earthy"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ailments</label>
              <input
                type="text"
                value={newStrain.ailments}
                onChange={(e) => setNewStrain({ ...newStrain, ailments: e.target.value })}
                placeholder="e.g., Anxiety, Pain, Insomnia"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
              <input
                type="text"
                value={newStrain.price_range}
                onChange={(e) => setNewStrain({ ...newStrain, price_range: e.target.value })}
                placeholder="e.g., $30-40 per 3.5g"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Strain Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer"
            />
            <div className="text-xs text-gray-500 mt-1">
              Upload high-quality strain images (Max 5MB, JPG/PNG)
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Strain preview"
                  className="w-32 h-32 object-cover rounded-md border border-gray-600"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newStrain.availability}
                onChange={(e) => setNewStrain({ ...newStrain, availability: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-300">Available for display</span>
            </label>
          </div>

          <div className="flex space-x-4">
            {editingStrain && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium"
            >
              {loading ? 'Saving...' : (editingStrain ? 'Update Strain' : 'Add Strain')}
            </button>
          </div>
        </form>
      </div>

      {/* Strains List */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          Existing Strains ({strains.length})
        </h3>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading strains...</p>
          </div>
        )}

        {!loading && strains.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🌿</div>
            <p className="text-gray-400">No strains added yet. Add your first strain above!</p>
          </div>
        )}

        {!loading && strains.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strains.map(strain => (
              <div key={strain.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
                {strain.image_url && (
                  <img
                    src={strain.image_url}
                    alt={strain.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-bold text-lg">{strain.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(strain)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(strain.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      categories.find(c => c.id === strain.category)?.color
                    }`}>
                      {categories.find(c => c.id === strain.category)?.icon}{' '}
                      {categories.find(c => c.id === strain.category)?.name}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      {strainTypes.find(t => t.id === strain.type)?.icon}{' '}
                      {strain.type}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{strain.description}</p>
                  
                  {(strain.thc_content || strain.cbd_content) && (
                    <div className="flex space-x-4 text-xs text-gray-400 mb-2">
                      {strain.thc_content && <span>THC: {strain.thc_content}</span>}
                      {strain.cbd_content && <span>CBD: {strain.cbd_content}</span>}
                    </div>
                  )}

                  {strain.effects && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Effects: {strain.effects}</p>
                    </div>
                  )}

                  {strain.price_range && (
                    <div className="text-sm text-emerald-400 font-semibold">
                      {strain.price_range}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      strain.availability 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {strain.availability ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrainsManagement;