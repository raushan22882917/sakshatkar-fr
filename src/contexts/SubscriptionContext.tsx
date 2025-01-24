import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  solvedQuestions: number;
  createdGroups: number;
  isSubscribed: boolean;
  canSolveMoreQuestions: boolean;
  canCreateMoreGroups: boolean;
  incrementSolvedQuestions: () => void;
  incrementCreatedGroups: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [solvedQuestions, setSolvedQuestions] = useState(0);
  const [createdGroups, setCreatedGroups] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('user_stats')
          .select('solved_questions, created_groups, is_subscribed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Create new user stats if not exists
          await supabase.from('user_stats').insert([
            {
              user_id: user.id,
              solved_questions: 0,
              created_groups: 0,
              is_subscribed: false
            }
          ]);
          setSolvedQuestions(0);
          setCreatedGroups(0);
          setIsSubscribed(false);
        } else if (userData) {
          setSolvedQuestions(userData.solved_questions);
          setCreatedGroups(userData.created_groups);
          setIsSubscribed(userData.is_subscribed);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const incrementSolvedQuestions = async () => {
    if (user?.id) {
      const newCount = solvedQuestions + 1;
      setSolvedQuestions(newCount);
      await supabase
        .from('user_stats')
        .update({ solved_questions: newCount })
        .eq('user_id', user.id);
    }
  };

  const incrementCreatedGroups = async () => {
    if (user?.id) {
      const newCount = createdGroups + 1;
      setCreatedGroups(newCount);
      await supabase
        .from('user_stats')
        .update({ created_groups: newCount })
        .eq('user_id', user.id);
    }
  };

  const canSolveMoreQuestions = isSubscribed || solvedQuestions < 5;
  const canCreateMoreGroups = isSubscribed || createdGroups < 2;

  return (
    <SubscriptionContext.Provider
      value={{
        solvedQuestions,
        createdGroups,
        isSubscribed,
        canSolveMoreQuestions,
        canCreateMoreGroups,
        incrementSolvedQuestions,
        incrementCreatedGroups,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
