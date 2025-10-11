import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    level: "beginner",
    category: "",
  });
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Yangi module/lesson formlari
  const [newModule, setNewModule] = useState({ title: "", description: "", order: 0 });
  const [newLesson, setNewLesson] = useState({ 
    title: "", 
    content: "", 
    type: "video", 
    duration: 0, 
    order: 0,
    moduleId: "" 
  });

  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api";

  // 🧩 Kurs va uning tarkibini yuklash
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await fetch(`${API_URL}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && data.success && data.data && data.data.course) {
          const c = data.data.course;
          setCourse({
            title: c.title || "",
            description: c.description || "",
            price: c.price?.amount || 0,
            level: c.level || "beginner",
            category: c.category || "",
          });

          // Modullarni olish
          await fetchModules();
          // Darslarni olish
          await fetchLessons();
        } else {
          alert("⚠️ Kurs topilmadi yoki sizda huquq yo'q");
          navigate("/teacher/courses");
        }
      } catch (err) {
        console.error("Kursni olishda xatolik:", err);
        alert("Server bilan aloqa yo'q");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, navigate]);

  // 📚 Modullarni olish
  const fetchModules = async () => {
    try {
      const res = await fetch(`${API_URL}/modules/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setModules(data.data.modules || []);
      }
    } catch (error) {
      console.error("Modullarni olishda xatolik:", error);
    }
  };

  // 📖 Darslarni olish
  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API_URL}/lessons/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLessons(data.data.lessons || []);
      }
    } catch (error) {
      console.error("Darslarni olishda xatolik:", error);
    }
  };

  // ➕ Yangi module qo'shish
  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newModule,
          courseId: id,
          order: modules.length + 1
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Modul qo'shildi!");
        setNewModule({ title: "", description: "", order: 0 });
        fetchModules();
      } else {
        alert("❌ Xatolik: " + data.message);
      }
    } catch (error) {
      console.error("Modul qo'shishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // ➕ Yangi dars qo'shish
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.moduleId) {
      alert("Iltimos, modulni tanlang!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newLesson,
          courseId: id,
          order: lessons.filter(l => l.moduleId === newLesson.moduleId).length + 1
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Dars qo'shildi!");
        setNewLesson({ 
          title: "", 
          content: "", 
          type: "video", 
          duration: 0, 
          order: 0,
          moduleId: "" 
        });
        fetchLessons();
      } else {
        alert("❌ Xatolik: " + data.message);
      }
    } catch (error) {
      console.error("Dars qo'shishda xatolik:", error);
      alert("Server bilan aloqa xatosi!");
    }
  };

  // 📝 Kursni yangilash (sizning mavjud funksiyangiz)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...course,
          price: {
            amount: Number(course.price),
            currency: "USD",
            isFree: Number(course.price) === 0,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Kurs muvaffaqiyatli yangilandi!");
      } else {
        alert(`❌ Xatolik: ${data.message || "Kursni yangilashda muammo yuz berdi"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("⚠️ Server bilan aloqa xatosi!");
    } finally {
      setSaving(false);
    }
  };

  // 🗑️ Modulni o'chirish
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Bu modulni o'chirmoqchimisiz?")) return;
    
    try {
      const res = await fetch(`${API_URL}/modules/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        alert("✅ Modul o'chirildi!");
        fetchModules();
      }
    } catch (error) {
      console.error("Modulni o'chirishda xatolik:", error);
    }
  };

  // 🗑️ Darsni o'chirish
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Bu darsni o'chirmoqchimisiz?")) return;
    
    try {
      const res = await fetch(`${API_URL}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        alert("✅ Dars o'chirildi!");
        fetchLessons();
      }
    } catch (error) {
      console.error("Darsni o'chirishda xatolik:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        ⏳ Kurs ma'lumotlari yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/teacher/courses")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Orqaga
          </button>
          <h1 className="text-3xl font-bold text-gray-900">✏️ {course.title}</h1>
          <p className="text-gray-600">Kursni boshqarish va tarkibini qo'shish</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="flex border-b">
            {[
              { id: "basic", label: "Asosiy ma'lumotlar", icon: "📝" },
              { id: "modules", label: "Modullar", icon: "📚" },
              { id: "lessons", label: "Darslar", icon: "📖" },
              { id: "preview", label: "Ko'rib chiqish", icon: "👁️" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* 1. Asosiy ma'lumotlar */}
            {activeTab === "basic" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Kurs nomi *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={course.title}
                      onChange={(e) => setCourse({...course, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Kategoriya *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={course.category}
                      onChange={(e) => setCourse({...course, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Narx (USD)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={course.price}
                      onChange={(e) => setCourse({...course, price: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Daraja
                    </label>
                    <select
                      name="level"
                      value={course.level}
                      onChange={(e) => setCourse({...course, level: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="beginner">Boshlang'ich</option>
                      <option value="intermediate">O'rta</option>
                      <option value="advanced">Ilg'or</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-2">
                    Tavsif *
                  </label>
                  <textarea
                    name="description"
                    value={course.description}
                    onChange={(e) => setCourse({...course, description: e.target.value})}
                    rows="6"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 font-semibold text-white rounded-lg transition ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {saving ? "💾 Saqlanmoqda..." : "✅ O'zgarishlarni saqlash"}
                </button>
              </form>
            )}

            {/* 2. Modullar */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                {/* Yangi modul qo'shish formi */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">➕ Yangi Modul Qo'shish</h3>
                  <form onSubmit={handleAddModule} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Modul nomi"
                        value={newModule.title}
                        onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Tartib raqami"
                        value={newModule.order}
                        onChange={(e) => setNewModule({...newModule, order: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                      />
                    </div>
                    <textarea
                      placeholder="Modul tavsifi"
                      value={newModule.description}
                      onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      rows="2"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      ➕ Modul Qo'shish
                    </button>
                  </form>
                </div>

                {/* Modullar ro'yxati */}
                <div>
                  <h3 className="font-semibold mb-3">📚 Modullar ({modules.length})</h3>
                  {modules.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Hozircha modullar mavjud emas</p>
                  ) : (
                    <div className="space-y-3">
                      {modules.map(module => (
                        <div key={module._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-gray-600 text-sm">{module.description}</p>
                              <p className="text-xs text-gray-500">Tartib: {module.order}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteModule(module._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Darslar */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                {/* Yangi dars qo'shish formi */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">➕ Yangi Dars Qo'shish</h3>
                  <form onSubmit={handleAddLesson} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={newLesson.moduleId}
                        onChange={(e) => setNewLesson({...newLesson, moduleId: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                        required
                      >
                        <option value="">Modulni tanlang</option>
                        {modules.map(module => (
                          <option key={module._id} value={module._id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={newLesson.type}
                        onChange={(e) => setNewLesson({...newLesson, type: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                      >
                        <option value="video">Video</option>
                        <option value="article">Maqola</option>
                        <option value="quiz">Test</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Dars nomi"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Davomiylik (daqiqa)"
                        value={newLesson.duration}
                        onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                        className="border border-gray-300 rounded-lg p-2"
                      />
                    </div>

                    <textarea
                      placeholder="Dars mazmuni"
                      value={newLesson.content}
                      onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      rows="3"
                    />

                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      ➕ Dars Qo'shish
                    </button>
                  </form>
                </div>

                {/* Darslar ro'yxati */}
                <div>
                  <h3 className="font-semibold mb-3">📖 Darslar ({lessons.length})</h3>
                  {lessons.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Hozircha darslar mavjud emas</p>
                  ) : (
                    <div className="space-y-3">
                      {lessons.map(lesson => {
                        const module = modules.find(m => m._id === lesson.moduleId);
                        return (
                          <div key={lesson._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{lesson.title}</h4>
                                <p className="text-gray-600 text-sm">{lesson.content}</p>
                                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                  <span>Modul: {module?.title || "Noma'lum"}</span>
                                  <span>Turi: {lesson.type}</span>
                                  <span>Davomiylik: {lesson.duration} daq</span>
                                  <span>Tartib: {lesson.order}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteLesson(lesson._id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Ko'rib chiqish */}
            {activeTab === "preview" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-xl mb-4">📊 Kurs Statistikasi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
                      <div className="text-sm text-gray-600">Modullar</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{lessons.length}</div>
                      <div className="text-sm text-gray-600">Darslar</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Jami daqiqa</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {course.price === 0 ? "Bepul" : `$${course.price}`}
                      </div>
                      <div className="text-sm text-gray-600">Narx</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-xl mb-4">🏗️ Kurs Tuzilmasi</h3>
                  {modules.map(module => {
                    const moduleLessons = lessons.filter(lesson => lesson.moduleId === module._id);
                    return (
                      <div key={module._id} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-lg mb-2">{module.title}</h4>
                        {moduleLessons.length === 0 ? (
                          <p className="text-gray-500 text-sm">Hozircha darslar mavjud emas</p>
                        ) : (
                          <div className="space-y-2 ml-4">
                            {moduleLessons.map(lesson => (
                              <div key={lesson._id} className="flex items-center gap-3 text-sm">
                                <span className={
                                  lesson.type === 'video' ? 'text-red-500' :
                                  lesson.type === 'article' ? 'text-blue-500' : 'text-green-500'
                                }>
                                  {lesson.type === 'video' ? '🎬' : 
                                   lesson.type === 'article' ? '📄' : '❓'}
                                </span>
                                <span>{lesson.title}</span>
                                <span className="text-gray-500">({lesson.duration} daq)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/teacher/courses")}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    ← Orqaga
                  </button>
                  <button
                    onClick={() => window.open(`/courses/${id}`, '_blank')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    👁️ Kursni Ko'rish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}