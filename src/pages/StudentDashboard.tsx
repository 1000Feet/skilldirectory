
import { StudentProfileForm } from "@/components/student/StudentProfileForm";

export default function StudentDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      <StudentProfileForm />
    </div>
  );
}
