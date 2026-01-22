import { BrainCircuit } from 'lucide-react';

export function Logo() {
  return (
    <div className="p-3 bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 backdrop-blur-sm border border-primary-foreground/10">
      <BrainCircuit className="h-8 w-8 text-primary-foreground" />
    </div>
  );
}
