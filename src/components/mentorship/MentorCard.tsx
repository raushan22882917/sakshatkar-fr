import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mentor } from '@/types/mentorship';

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={mentor.profile_image_url || '/placeholder.svg'}
            alt={mentor.profiles?.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{mentor.profiles?.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{mentor.company}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mentor.experience}+ years experience
                </p>
                <p className="font-semibold">
                  ${mentor.one_on_one_price}/hour
                </p>
              </div>
              <Button onClick={() => navigate(`/mentorship/${mentor.id}`)}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}