
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  name: string;
  category: string;
  description: string;
  proficiency: number;
  className?: string;
}

export function SkillCard({ name, category, description, proficiency, className }: SkillCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-6">
        <div className="mb-4">
          <Badge variant="secondary" className="mb-2 text-xs font-medium">
            {category}
          </Badge>
          <h3 className="text-xl font-semibold tracking-tight mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-1">Proficiency</div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${proficiency}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
