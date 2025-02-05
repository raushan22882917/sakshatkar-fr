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
    {
      title: "Blind 75 LeetCode",
      description: "Master the most frequently asked coding questions with the Blind 75 list.",
      icon: Code,
      route: "/blind-75",
      image: "https://miro.medium.com/v2/resize:fit:1024/1*VGFY9kJ1l6G7v_6lcrLfkg.png",
    }
    
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

        
      </div>

      {/* Footer Section */}
      <footer className="w-full bg-gray-900 text-white text-center py-4 mt-12">
        <p>&copy; {new Date().getFullYear()} Coding Practice Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
