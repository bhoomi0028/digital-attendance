import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceRecord, subscribeToAttendance } from '@/lib/database';
import { Button } from '@/components/ui/button';
import classroomBg from '@/assets/classroom-bg.jpg';

export default function ViewAttendance() {
  const { isFaculty, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // subscribeToAttendance already fetches initial data, no need for double fetch
    const unsubscribe = subscribeToAttendance((data) => {
      setRecords(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isFaculty) {
    navigate('/faculty-login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${classroomBg})` }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
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

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center italic mb-8">
              Attendance Records (Real-time)
            </h2>

            {loading ? (
              <div className="text-white text-center">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-4 py-3 text-left">Roll No</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Lecture Title</th>
                      <th className="px-4 py-3 text-left">Lecture Date</th>
                      <th className="px-4 py-3 text-left">Lecture Room</th>
                      <th className="px-4 py-3 text-left">Punch Time</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{record.student_roll_no}</td>
                        <td className="px-4 py-3">{record.student_name}</td>
                        <td className="px-4 py-3">{record.lecture_title}</td>
                        <td className="px-4 py-3">{record.lecture_date}</td>
                        <td className="px-4 py-3">{record.lecture_room}</td>
                        <td className="px-4 py-3">{record.punch_time}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="badge-present">Present</span>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={() => navigate('/faculty')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-4">
          © 2026 Digital Scan | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
