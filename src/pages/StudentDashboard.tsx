
import { Header } from "@/components/Header";
import { StudentProfileForm } from "@/components/student/StudentProfileForm";
import { LessonRequests } from "@/components/student/LessonRequests";

export default function StudentDashboard() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
        <div className="grid grid-cols-1 gap-8">
          <LessonRequests />
          <StudentProfileForm />
        </div>
      </div>
    </>
  );
}
