import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeOutputProps {
  output: string | null;
  isLoading: boolean;
  error: string | null;
}

export function CodeOutput({ output, isLoading, error }: CodeOutputProps) {
  if (isLoading) {
    return (
      <div className="h-[200px] border rounded-md bg-muted p-4">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] border rounded-md bg-muted">
      <div className="p-4">
        {error ? (
          <div className="text-destructive">
            <p className="font-medium">Error:</p>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        ) : output ? (
          <div>
            <p className="font-medium text-muted-foreground mb-2">Output:</p>
            <pre className="text-sm whitespace-pre-wrap">{output}</pre>
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            Run your code to see the output here
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
