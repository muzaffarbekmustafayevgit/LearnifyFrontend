// pages/teacher/EditCourse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const levels = [
    { value: 'beginner', label: 'Boshlang\'ich' },
    { value: 'intermediate', label: 'O\'rta' },
    { value: 'advanced', label: 'Murakkab' },
    { value: 'all', label: 'Barcha darajalar' }
  ];

  const categories = [
    'Dasturlash',
    'Dizayn',
    'Marketing',
    'Biznes',
    'Shaxsiy rivojlanish',
    'Sanoat',
    'Texnologiya',
    'Boshqa'
  ];

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Kursni olishda xatolik');

      const data = await response.json();
      setCourse(data.data.course);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(course),
      });

      if (!response.ok) throw new Error('Yangilashda xatolik');

      const data = await response.json();
      alert('Kurs muvaffaqiyatli yangilandi');
      navigate('/teacher/courses');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (field, value) => {
    setCourse(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value,
        isFree: field === 'amount' ? value === 0 : prev.price.isFree
      }
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 m-4 text-red-700 bg-red-100 rounded-lg">
      {error}
    </div>
  );

  if (!course) return (
    <div className="p-4 m-4 text-yellow-700 bg-yellow-100 rounded-lg">
      Kurs topilmadi
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kursni Tahrirlash</h1>
          <p className="text-gray-600">{course.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Kurs nomi */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Kurs nomi *
              </label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Qisqa tavsif */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Qisqa tavsif
              </label>
              <textarea
                value={course.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kurs haqida qisqacha ma'lumot..."
              />
            </div>

            {/* Batafsil tavsif */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Batafsil tavsif *
              </label>
              <textarea
                value={course.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Kategoriya */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Kategoriya *
              </label>
              <select
                value={course.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Kategoriyani tanlang</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Daraja */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Daraja
              </label>
              <select
                value={course.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Narx */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Narx (so'm)
              </label>
              <input
                type="number"
                value={course.price?.amount || 0}
                onChange={(e) => handlePriceChange('amount', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valyuta */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Valyuta
              </label>
              <select
                value={course.price?.currency || 'USD'}
                onChange={(e) => handlePriceChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="UZS">UZS</option>
              </select>
            </div>

            {/* Rasm URL */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Kurs rasmi URL
              </label>
              <input
                type="url"
                value={course.thumbnail || ''}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* O'rganish natijalari */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                O'rganish Natijalari (har biri yangi qatorda)
              </label>
              <textarea
                value={course.learningOutcomes?.join('\n') || ''}
                onChange={(e) => handleChange('learningOutcomes', e.target.value.split('\n').filter(item => item.trim()))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kursni tugatgandan so'ng nimalarni o'rganasiz..."
              />
            </div>

            {/* Talablar */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Talablar (har biri yangi qatorda)
              </label>
              <textarea
                value={course.requirements?.join('\n') || ''}
                onChange={(e) => handleChange('requirements', e.target.value.split('\n').filter(item => item.trim()))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kursni boshlash uchun nimalarni bilish kerak..."
              />
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
            <button
              type="button"
              onClick={() => navigate('/teacher/courses')}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;