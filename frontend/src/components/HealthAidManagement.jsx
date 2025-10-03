import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const HealthAidManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [newTerm, setNewTerm] = useState({
    term: '',
    definition: '',
    category: 'slang',
    related_terms: '',
    etymology: '',
    usage_examples: ''
  });
  const { apiCall } = useContext(AuthContext);

  const categories = [
    { id: 'slang', name: 'Slang', icon: '💬' },
    { id: 'science', name: 'Science', icon: '🧬' },
    { id: 'culture', name: 'Culture', icon: '🎭' },
    { id: 'legal', name: 'Legal', icon: '⚖️' },
    { id: 'medical', name: 'Medical', icon: '🏥' },
    { id: 'cultivation', name: 'Cultivation', icon: '🌱' }
  ];

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall('/api/admin/wictionary/terms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTerms(data.terms || []);
      }
    } catch (error) {
      console.error('Failed to load terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const termData = {
        ...newTerm,
        related_terms: newTerm.related_terms.split(',').map(t => t.trim()).filter(t => t)
      };

      const url = editingTerm 
        ? `/api/admin/wictionary/terms/${editingTerm.id}`
        : '/api/admin/wictionary/terms';
      
      const method = editingTerm ? 'PUT' : 'POST';

      const response = await apiCall(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(termData)
      });

      if (response.ok) {
        setNewTerm({
          term: '',
          definition: '',
          category: 'slang',
          related_terms: '',
          etymology: '',
          usage_examples: ''
        });
        setEditingTerm(null);
        loadTerms();
        alert(editingTerm ? 'Term updated successfully!' : 'Term added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save term: ${error.detail}`);
      }
    } catch (error) {
      console.error('Failed to save term:', error);
      alert('Failed to save term');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (term) => {
    setEditingTerm(term);
    setNewTerm({
      term: term.term,
      definition: term.definition,
      category: term.category,
      related_terms: term.related_terms?.join(', ') || '',
      etymology: term.etymology || '',
      usage_examples: term.usage_examples || ''
    });
  };

  const handleDelete = async (termId) => {
    if (!confirm('Are you sure you want to delete this term?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await apiCall(`/api/admin/wictionary/terms/${termId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadTerms();
        alert('Term deleted successfully!');
      } else {
        alert('Failed to delete term');
      }
    } catch (error) {
      console.error('Failed to delete term:', error);
      alert('Failed to delete term');
    }
  };

  const cancelEdit = () => {
    setEditingTerm(null);
    setNewTerm({
      term: '',
      definition: '',
      category: 'slang',
      related_terms: '',
      etymology: '',
      usage_examples: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Health-Aid Dictionary Management</h2>
        <div className="text-sm text-gray-400">
          📖 Manage cannabis terms and definitions
        </div>
      </div>

      {/* Add/Edit Term Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          {editingTerm ? 'Edit Term' : 'Add New Term'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Term</label>
              <input
                type="text"
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                placeholder="e.g., Za, Deps, Terpenes"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={newTerm.category}
                onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Definition</label>
            <textarea
              value={newTerm.definition}
              onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
              placeholder="Comprehensive definition of the term..."
              rows="4"
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Related Terms</label>
            <input
              type="text"
              value={newTerm.related_terms}
              onChange={(e) => setNewTerm({ ...newTerm, related_terms: e.target.value })}
              placeholder="Related terms separated by commas"
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Etymology (Optional)</label>
              <input
                type="text"
                value={newTerm.etymology}
                onChange={(e) => setNewTerm({ ...newTerm, etymology: e.target.value })}
                placeholder="Origin of the term..."
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Usage Examples (Optional)</label>
              <input
                type="text"
                value={newTerm.usage_examples}
                onChange={(e) => setNewTerm({ ...newTerm, usage_examples: e.target.value })}
                placeholder="Example usage in sentences..."
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            {editingTerm && (
              <button
                type="button"
                onClick={cancelEdit}
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
              {loading ? 'Saving...' : (editingTerm ? 'Update Term' : 'Add Term')}
            </button>
          </div>
        </form>
      </div>

      {/* Terms List */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Existing Terms ({terms.length})</h3>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading terms...</p>
          </div>
        )}

        {!loading && terms.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📖</div>
            <p className="text-gray-400">No terms added yet. Add your first term above!</p>
          </div>
        )}

        {!loading && terms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {terms.map(term => (
              <div key={term.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold">{term.term}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(term)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    term.category === 'slang' ? 'bg-purple-900 text-purple-300' :
                    term.category === 'science' ? 'bg-blue-900 text-blue-300' :
                    term.category === 'culture' ? 'bg-pink-900 text-pink-300' :
                    term.category === 'legal' ? 'bg-yellow-900 text-yellow-300' :
                    term.category === 'medical' ? 'bg-red-900 text-red-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {categories.find(c => c.id === term.category)?.icon} {term.category}
                  </span>
                </div>

                <p className="text-gray-300 text-sm line-clamp-3">{term.definition}</p>
                
                {term.related_terms && term.related_terms.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Related: {term.related_terms.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAidManagement;