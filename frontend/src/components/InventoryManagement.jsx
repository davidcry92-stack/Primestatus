import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const { apiCall } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    category: 'flower',
    price: '',
    original_price: '',
    image: '',
    description: '',
    thc: '',
    vendor: '',
    in_stock: true,
    rating: '',
    reviews: ''
  });

  useEffect(() => {
    loadProducts();
  }, [searchTerm, filterCategory, filterStock]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterStock !== '') queryParams.append('in_stock', filterStock);

      const response = await apiCall(`/api/admin/inventory?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    try {
      let response;
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        reviews: formData.reviews ? parseInt(formData.reviews) : 0
      };

      if (editingProduct) {
        // Update existing product
        response = await apiCall(`/api/admin/inventory/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      } else {
        // Add new product
        response = await apiCall('/api/admin/inventory', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      if (response.ok) {
        await loadProducts();
        resetForm();
        alert(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to ${editingProduct ? 'update' : 'add'} product: ${errorData.detail}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      original_price: product.original_price ? product.original_price.toString() : '',
      image: product.image,
      description: product.description,
      thc: product.thc,
      vendor: product.vendor,
      in_stock: product.in_stock,
      rating: product.rating.toString(),
      reviews: product.reviews.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/inventory/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProducts();
        alert('Product deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete product: ${errorData.detail}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'flower',
      price: '',
      original_price: '',
      image: '',
      description: '',
      thc: '',
      vendor: '',
      in_stock: true,
      rating: '',
      reviews: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const categoryStyles = {
      'flower': 'bg-green-600 text-white',
      'edibles': 'bg-purple-600 text-white',
      'concentrates': 'bg-orange-600 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[category] || 'bg-gray-600 text-white'}`}>
        {category.toUpperCase()}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="flower">Flower</option>
                    <option value="edibles">Edibles</option>
                    <option value="concentrates">Concentrates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.original_price}
                    onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">THC Content</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 24% or 10mg per piece"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.thc}
                    onChange={(e) => setFormData({...formData, thc: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vendor</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Review Count</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.reviews}
                    onChange={(e) => setFormData({...formData, reviews: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in_stock"
                  className="mr-2"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({...formData, in_stock: e.target.checked})}
                />
                <label htmlFor="in_stock" className="text-sm text-gray-300">In Stock</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or vendor"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="flower">Flower</option>
              <option value="edibles">Edibles</option>
              <option value="concentrates">Concentrates</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stock Status</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
            >
              <option value="">All Products</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{product.name}</div>
                          <div className="text-sm text-gray-400">{product.thc}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(product.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">${product.price}</div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-sm text-gray-400 line-through">${product.original_price}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.in_stock 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {product.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      ⭐ {product.rating} ({product.reviews})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        Total Products: {products.length} | In Stock: {products.filter(p => p.in_stock).length} | Out of Stock: {products.filter(p => !p.in_stock).length}
      </div>
    </div>
  );
};

export default InventoryManagement;