import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseView({ courseId, course }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [watchedLessons, setWatchedLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  
  const navigate = useNavigate();

  // Modullar va darslarni olish
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // 1. Modullarni olish
        const modulesRes = await fetch(`http://localhost:5000/api/modules/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const modulesData = await modulesRes.json();

        if (modulesData.success) {
          const modulesWithLessons = modulesData.data.modules;
          setModules(modulesWithLessons);

          // Birinchi modul va darsni tanlash
          if (modulesWithLessons.length > 0) {
            const firstModule = modulesWithLessons[0];
            setSelectedModule(firstModule);
            
            if (firstModule.lessons && firstModule.lessons.length > 0) {
              setSelectedLesson(firstModule.lessons[0]);
            }
          }
        }

      } catch (err) {
        console.error("❌ Xato:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId]);

  // Modul tanlanganda
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    if (module.lessons && module.lessons.length > 0) {
      setSelectedLesson(module.lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  // Dars tanlanganda
  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  // Video play
  const handleVideoPlay = () => {
    if (!selectedLesson || watchedLessons[selectedLesson._id]) return;

    setTimeout(() => {
      setWatchedLessons((prev) => ({
        ...prev,
        [selectedLesson._id]: true,
      }));
    }, 30000);
  };

  // Ortga qaytish
  const handleBack = () => {
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">⏳ Kurs tarkibi yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>❌ Xatolik:</strong> {error}
          <button 
            onClick={handleBack}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Ortga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
            >
              ← Ortga
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
          </div>
          <div className="text-sm text-gray-500">
            {modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)} ta dars
          </div>
        </div>
      </div>

      {/* Asosiy kontent */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chap panel - Modullar va darslar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Kurs Tarkibi</h2>
            
            {modules.length > 0 ? (
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div key={module._id} className="bg-white rounded-lg border border-gray-200">
                    {/* Modul sarlavhasi */}
                    <button
                      onClick={() => handleModuleSelect(module)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedModule?._id === module._id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">{index + 1}.</span>
                          <span className="font-medium text-gray-800">{module.title}</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {module.lessons?.length || 0}
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {module.description}
                        </p>
                      )}
                    </button>

                    {/* Darslar ro'yxati */}
                    {selectedModule?._id === module._id && module.lessons && module.lessons.length > 0 && (
                      <div className="px-3 pb-2">
                        <div className="space-y-1 mt-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson._id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full text-left p-2 rounded text-sm transition ${
                                selectedLesson?._id === lesson._id
                                  ? "bg-blue-100 text-blue-700 font-medium border border-blue-200"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500 text-xs">{lessonIndex + 1}.</span>
                                  <span className="text-left">{lesson.title}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {lesson.duration && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                                      {lesson.duration}m
                                    </span>
                                  )}
                                  {watchedLessons[lesson._id] && (
                                    <span className="text-green-500 text-xs">✅</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>Hozircha modullar mavjud emas</p>
              </div>
            )}
          </div>
        </div>

        {/* O'ng panel - Video va dars kontenti */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-6">
            {selectedLesson ? (
              <>
                {/* Dars sarlavhasi */}
                <div className="mb-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="text-blue-600">{selectedModule?.title}</span>
                    <span className="mx-2">›</span>
                    <span className="font-medium text-gray-700">{selectedLesson.title}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    🎥 {selectedLesson.title}
                  </h2>
                </div>

                {/* Video player */}
                <div className="mb-6">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      width="100%"
                      height="auto"
                      controls
                      onPlay={handleVideoPlay}
                      className="w-full"
                      poster={selectedLesson.thumbnail}
                    >
                      <source src={selectedLesson.videoUrl} type="video/mp4" />
                      Sizning brauzeringiz video formatini qo'llab-quvvatlamaydi.
                    </video>
                  </div>
                </div>

                {/* Dars tavsifi */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Dars haqida</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedLesson.description || "Ushbu dars haqida ma'lumot mavjud emas."}
                  </p>
                  
                  {selectedLesson.duration && (
                    <div className="flex items-center mt-4 text-sm text-gray-600">
                      <span className="mr-2">⏱️</span>
                      Davomiylik: {selectedLesson.duration} daqiqa
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Darsni Tanlang
                </h3>
                <p className="text-gray-500 mb-6">
                  Chap tomondagi modullardan darsni tanlang va o'qishni boshlang.
                </p>
                {selectedModule?.lessons?.length === 0 && (
                  <p className="text-yellow-600 bg-yellow-50 p-3 rounded-lg inline-block">
                    ⚠️ Ushbu modulda hozircha darslar mavjud emas.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}