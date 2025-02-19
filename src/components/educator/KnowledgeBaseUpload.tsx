
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const KnowledgeBaseUpload = () => {
  const [url, setUrl] = useState("");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement URL processing
    toast.success("URL added to knowledge base");
    setUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge base</CardTitle>
        <CardDescription>
          Provide domain-specific information to help the AI answer questions more accurately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Add URL to knowledge base"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit">Add URL</Button>
        </form>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Or upload a document</span>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            <label className="cursor-pointer">
              Add document
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
