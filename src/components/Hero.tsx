import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-3 py-1 text-sm font-medium bg-secondary rounded-full inline-block mb-4">
            Revolutionizing Interviews
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Master Your Next Interview
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Prepare, practice, and succeed in your interviews with our intelligent platform.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="text-lg px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Learn More
          </Button>
        </motion.div>
      </div>
    </section>
  );
};