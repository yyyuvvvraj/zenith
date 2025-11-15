'use client';

interface TimetableModalProps {
  timetable: {
    id: number;
    name: string;
    tqi: number;
    schedule: {
      day: string;
      time: string;
      subject: string;
      teacher: string;
      room: string;
    }[];
  };
  onClose: () => void;
}

export default function TimetableModal({ timetable, onClose }: TimetableModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{timetable.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-indigo-600">TQI Score: {timetable.tqi}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">{timetable.schedule.length} Classes</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Schedule Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-indigo-200">Day</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-indigo-200">Time</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-indigo-200">Subject</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-indigo-200">Teacher</th>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-indigo-200">Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.schedule.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-b border-gray-200 font-medium text-gray-700">{item.day}</td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">{item.time}</td>
                    <td className="p-4 border-b border-gray-200 font-semibold text-indigo-600">{item.subject}</td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">{item.teacher}</td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
              Export Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}