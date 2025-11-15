import TQIScore from './TQIScore';

interface ScheduleItem {
  id: number;
  title: string;
  start: string;
  end?: string;
  location?: string;
  [key: string]: unknown;
}

interface TimetableCardProps {
  timetable: {
    id: number;
    name: string;
    tqi: number;
    schedule?: ScheduleItem[];
  };
  onClick: () => void;
}

export default function TimetableCard({ timetable, onClick }: TimetableCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl cursor-pointer transition-all transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{timetable.name}</h3>
        <TQIScore score={timetable.tqi} />
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{timetable.schedule?.length || 0} classes scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>Optimized schedule</span>
        </div>
      </div>

      <button className="mt-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2 rounded-lg transition-colors">
        View Details →
      </button>
    </div>
  );
}