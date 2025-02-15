
import { useState } from "react";
import { SkillCard } from "@/components/SkillCard";
import { CategoryFilter } from "@/components/CategoryFilter";

// Sample data - in a real app, this would come from a backend
const skills = [
  {
    id: 1,
    name: "React Development",
    category: "Frontend",
    description: "Building modern web applications with React and its ecosystem",
    proficiency: 90,
  },
  {
    id: 2,
    name: "Node.js",
    category: "Backend",
    description: "Server-side JavaScript runtime environment and API development",
    proficiency: 85,
  },
  {
    id: 3,
    name: "UI/UX Design",
    category: "Design",
    description: "Creating intuitive and beautiful user interfaces",
    proficiency: 75,
  },
  {
    id: 4,
    name: "TypeScript",
    category: "Frontend",
    description: "Strongly typed programming for JavaScript applications",
    proficiency: 88,
  },
  {
    id: 5,
    name: "Python",
    category: "Backend",
    description: "Versatile programming language for various applications",
    proficiency: 82,
  },
  {
    id: 6,
    name: "Figma",
    category: "Design",
    description: "Collaborative interface design tool",
    proficiency: 70,
  },
];

const categories = Array.from(new Set(skills.map((skill) => skill.category)));

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSkills = selectedCategory
    ? skills.filter((skill) => skill.category === selectedCategory)
    : skills;

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-16 mx-auto">
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Discover Professional Skills
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore a curated collection of professional skills across various domains.
            Filter by category to find exactly what you're looking for.
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.id}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              className="animate-fadeIn opacity-0"
            >
              <SkillCard
                name={skill.name}
                category={skill.category}
                description={skill.description}
                proficiency={skill.proficiency}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
