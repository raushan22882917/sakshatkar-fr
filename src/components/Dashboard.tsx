import { motion } from "framer-motion";
import { InterviewCard } from "./InterviewCard";

const interviews = [
  {
    title: "Frontend Developer",
    company: "Tech Corp",
    date: "2024-03-15",
    time: "10:00 AM",
    status: "upcoming" as const,
  },
  {
    title: "Senior React Developer",
    company: "Innovation Labs",
    date: "2024-03-12",
    time: "2:00 PM",
    status: "completed" as const,
  },
  {
    title: "Full Stack Engineer",
    company: "StartUp Inc",
    date: "2024-03-18",
    time: "11:30 AM",
    status: "upcoming" as const,
  },
];

export const Dashboard = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Your Interviews</h2>
          <p className="text-muted-foreground">Track and prepare for your upcoming interviews</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <InterviewCard {...interview} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};