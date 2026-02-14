import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lecture, subscribeToLectures, deactivateLecture } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { StopCircle, ClipboardList } from 'lucide-react';
import classroomBg from '@/assets/classroom-bg.jpg';

export default function ViewLectures() {
  const { isFaculty, logout } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLectures((data) => {
      setLectures(data);
      setLoading(false);
    });
    return () => { unsubscribe(); };
  }, []);

  if (!isFaculty) {
    navigate('/faculty-login');
    return null;
  }

  const handleEndLecture = async (id: string) => {
    if (confirm('Are you sure you want to end this lecture?')) {
      const success = await deactivateLecture(id);
      if (success) {
        toast.success('Lecture ended!');
      } else {
        toast.error('Failed to end lecture');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatTime = (date: string) => new Date(date).toLocaleTimeString();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${classroomBg})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">Digital Scan</Link>
          <nav className="flex items-center gap-6">
            <Link to="/faculty" className="hover:text-gray-300 transition-colors">Home</Link>
            <div className="relative group">
              <button className="hover:text-gray-300 transition-colors">Student ▼</button>
              <div className="absolute right-0 top-full mt-2 bg-white rounded shadow-lg py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/faculty/add-student" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Add Student</Link>
                <Link to="/faculty/students" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">View Students</Link>
              </div>
            </div>
            <div className="relative group">
              <button className="hover:text-gray-300 transition-colors">Lecture ▼</button>
              <div className="absolute right-0 top-full mt-2 bg-white rounded shadow-lg py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/faculty/start-lecture" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Start Lecture</Link>
                <Link to="/faculty/lectures" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">View Lectures</Link>
              </div>
            </div>
            <button onClick={handleLogout} className="hover:text-gray-300 transition-colors">Logout</button>
          </nav>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center italic mb-8">
              Lecture List (Real-time)
            </h2>

            {loading ? (
              <div className="text-white text-center">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden shadow-lg overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Faculty</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Room</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lectures.map((lecture) => {
                      const isActive = lecture.is_active && new Date(lecture.end_time) > new Date();
                      return (
                        <tr key={lecture.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{lecture.title}</td>
                          <td className="px-4 py-3">{lecture.faculty_name}</td>
                          <td className="px-4 py-3">{formatDate(lecture.start_time)}</td>
                          <td className="px-4 py-3">{formatTime(lecture.start_time)}</td>
                          <td className="px-4 py-3">{lecture.room}</td>
                          <td className="px-4 py-3 text-center">
                            {isActive ? (
                              <span className="badge-present">Active</span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-400 text-white rounded text-sm">Ended</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/faculty/lecture-attendance/${lecture.id}`)}
                            >
                              <ClipboardList className="w-4 h-4 mr-1" />
                              Attendance
                            </Button>
                            {isActive && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/faculty/qr/${lecture.id}`)}
                                >
                                  View QR
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleEndLecture(lecture.id)}
                                >
                                  <StopCircle className="w-4 h-4 mr-1" />
                                  End
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {lectures.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No lectures found. Start a lecture first.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button variant="secondary" onClick={() => navigate('/faculty')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>

        <footer className="bg-gray-800 text-white text-center py-4">
          © 2026 Digital Scan | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
