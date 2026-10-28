import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, School, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StatsData {
  totalUsers: number;
  totalEducators: number;
  totalStudents: number;
  activeEducators: number;
}

interface ChartData {
  name: string;
  value: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalEducators: 0,
    totalStudents: 0,
    activeEducators: 0
  });
  const [signupTrend, setSignupTrend] = useState<ChartData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total educators
        const { data: educators, error: educatorsError } = await supabase
          .from('educator_profiles')
          .select('id, is_active');
        
        if (educatorsError) throw educatorsError;

        // Fetch total students
        const { data: students, error: studentsError } = await supabase
          .from('student_profiles')
          .select('id');
        
        if (studentsError) throw studentsError;

        const activeEducators = educators?.filter(e => e.is_active) || [];

        setStats({
          totalUsers: (educators?.length || 0) + (students?.length || 0),
          totalEducators: educators?.length || 0,
          totalStudents: students?.length || 0,
          activeEducators: activeEducators.length
        });

        // Fetch signup trend (last 7 days)
        const { data: signups, error: signupsError } = await supabase
          .from('educator_profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at');

        if (signupsError) throw signupsError;

        // Process signup data into daily counts
        const dailyCounts = signups?.reduce((acc: Record<string, number>, curr) => {
          const date = new Date(curr.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const trendData = Object.entries(dailyCounts || {}).map(([name, value]) => ({
          name,
          value
        }));

        setSignupTrend(trendData);

        // Fetch category distribution
        const { data: categories, error: categoriesError } = await supabase
          .from('educator_profiles')
          .select('categories');

        if (categoriesError) throw categoriesError;

        // Process category data
        const categoryCount: Record<string, number> = {};
        categories?.forEach(profile => {
          profile.categories?.forEach((category: string) => {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          });
        });

        const categoryData = Object.entries(categoryCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 categories

        setCategoryDistribution(categoryData);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalEducators} educators, {stats.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Educators</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEducators}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeEducators / stats.totalEducators) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active learners on platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Educator Sign-ups</CardTitle>
            <CardDescription>Daily new educator registrations</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most popular educator categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#88C440" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 