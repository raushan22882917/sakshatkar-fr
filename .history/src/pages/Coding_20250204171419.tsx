import { PracticeModeCard } from "@/components/PracticeModeCard";
import { User, Users, Building } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Coding() {
  // Array of coding practice modes with title, description, icon, route, and image
  const codingModes = [
    {
      title: "Beginner Coder",
      description: "Enhance your coding skills independently with comprehensive feedback.",
      icon: User,
      route: "/self-practice",
      image: "https://www.yarddiant.com/images/how-to-practice-coding-every-day.jpg",
    },
    {
      title: "Experienced Coder",
      description: "Work alongside peers to solve problems and learn collectively.",
      icon: Users,
      route: "/peer-practice",
      image: "https://www.codio.com/hubfs/Blog_EN_PICS/August%202021%20Blog%20-%20Collaborative%20Coding%20in%20Codio.png#keepProtocol",
    },
    {
      title: "Company Wise Questions",
      description: "Browse and practice coding questions from your company's previous exams.",
      icon: Building,
      route: "/company-practice",
      image: "https://savvytokyo.scdn3.secure.raxcdn.com/app/uploads/2023/10/LINE_ALBUM_1-Monday_231016_4.jpg",
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Navbar Component - No margin issue */}
      <Navbar />

      {/* Main content wrapper */}
      <div className="w-full px-4 py-12 flex-1">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-8 text-center">Coding Practice</h1>

        {/* Grid Layout for Practice Mode Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {codingModes.map((mode) => (
            <PracticeModeCard key={mode.title} {...mode} />
          ))}
        </div>

        {/* Instructions Section - Below Cards with Image on Left */}
        <section className="mt-16 flex flex-col md:flex-row items-center  p-6 rounded-lg shadow-md">
          {/* Image Secti
          {/* Text Section */}
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            <h2 className="text-2xl font-semibold mb-4">How to Use This Platform</h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              <li>Select a coding mode based on your experience level.</li>
              <li>Follow the given problems and solve them in your preferred language.</li>
              <li>Collaborate with peers for enhanced learning and discussion.</li>
              <li>Company-wise questions help prepare for technical interviews.</li>
              <li>Track your progress and revisit past problems for improvement.</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-gray-900 text-white text-center py-4 mt-12">
        <p>&copy; {new Date().getFullYear()} Coding Practice Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
