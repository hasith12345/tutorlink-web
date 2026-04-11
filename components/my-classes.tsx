import { Edit2, Users, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Class {
  id: string;
  subject: string;
  venue: string;
  mode: 'Online' | 'Physical';
  date: string;
  time: string;
  fee: string;
  studentsEnrolled: number;
}

export function MyClasses() {
  const classes: Class[] = [
    {
      id: '1',
      subject: 'Mathematics - Algebra Basics',
      venue: 'Online',
      mode: 'Online',
      date: 'Monday & Wednesday',
      time: '5:00 PM - 6:00 PM',
      fee: 'Rs. 500/hour',
      studentsEnrolled: 8,
    },
    {
      id: '2',
      subject: 'Physics - Mechanics',
      venue: 'Physics Lab, Building A',
      mode: 'Physical',
      date: 'Tuesday & Thursday',
      time: '3:00 PM - 4:30 PM',
      fee: 'Rs. 750/hour',
      studentsEnrolled: 12,
    },
    {
      id: '3',
      subject: 'Chemistry - Organic Chemistry',
      venue: 'Online',
      mode: 'Online',
      date: 'Saturday',
      time: '10:00 AM - 11:30 AM',
      fee: 'Rs. 600/hour',
      studentsEnrolled: 5,
    },
    {
      id: '4',
      subject: 'English - Literature',
      venue: 'Conference Room 2',
      mode: 'Physical',
      date: 'Monday & Friday',
      time: '4:00 PM - 5:00 PM',
      fee: 'Rs. 400/hour',
      studentsEnrolled: 10,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">My Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-lg shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3">
                  {classItem.subject}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{classItem.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{classItem.date}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {classItem.mode}
                    </span>
                  </div>
                  <p>{classItem.time}</p>
                  <p className="font-semibold text-green-600">{classItem.fee}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    {classItem.studentsEnrolled} students enrolled
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Students</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
