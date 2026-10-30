import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { MembershipType } from '@/lib/auth-types';
import { getMembershipAmount } from '@/services/payment';
import { Info } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const signupParam = queryParams.get('signup');
  const membershipParam = queryParams.get('membership') as MembershipType | null;
  
  const [isLogin, setIsLogin] = useState(!signupParam);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'educator'>(
    signupParam === 'educator' ? 'educator' : 'student'
  );
  const [membershipType, setMembershipType] = useState<MembershipType>(
    membershipParam && ['basic', 'standard', 'premium'].includes(membershipParam) 
      ? membershipParam 
      : 'basic'
  );
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();

  // Log state changes
  useEffect(() => {
    if (userType === 'educator') {
      console.log('Educator selected with membership:', membershipType);
    }
  }, [userType, membershipType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Form submitted:', {
        isLogin,
        email,
        userType,
        membershipType: userType === 'educator' ? membershipType : undefined
      });

      if (isLogin) {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password, userType, userType === 'educator' ? membershipType : undefined);
        
        // If this is an educator signup with a paid membership type, redirect to payment page
        if (userType === 'educator' && membershipType !== 'basic' && result && 'needsPayment' in result && result.profileId) {
          navigate('/payment', { 
            state: { 
              profileId: result.profileId,
              membershipType,
              amount: getMembershipAmount(membershipType)
            }
          });
          return;
        } else if (userType === 'educator' && membershipType === 'basic') {
          // For basic (free) tier, redirect directly to dashboard
          navigate('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMembershipOption = (type: MembershipType, label: string, price: number) => (
    <div className="relative flex items-start p-4 border rounded-lg">
      <div className="flex items-center h-5">
        <RadioGroupItem value={type} id={type} />
      </div>
      <div className="ml-3 flex-grow">
        <Label htmlFor={type} className="font-medium">
          {label}
          <span className="ml-2 text-primary">${(price / 100).toFixed(2)}/month</span>
        </Label>
      </div>
    </div>
  );

  // Redirect if user is already logged in - moved after hooks.
  // If the user was sent here from a protected page, send them back there
  // instead of the homepage.
  if (user) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from || '/'} replace />;
  }

  return (
    <>
      <SEO
        title={isLogin ? 'Sign In - Skill Directory' : 'Create Account - Skill Directory'}
        description={
          isLogin
            ? 'Sign in to access your Skill Directory account. Connect with educators, manage your learning journey, or grow your teaching business.'
            : 'Join Skill Directory as a student or educator. Access quality education, connect with learners, and grow your teaching business.'
        }
        keywords={
          isLogin
            ? 'login, sign in, account access, educator login, student login'
            : 'create account, sign up, join as educator, join as student, teaching platform registration'
        }
      />
      <div className="min-h-screen bg-[#F2FCE2] flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to access your account'
                : 'Join our community of learners and educators'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label={isLogin ? 'Sign In Form' : 'Registration Form'}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                aria-label="Email Address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                aria-label="Password"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>I am a:</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as 'student' | 'educator')}
                  className="flex gap-4"
                  aria-label="User Type Selection"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="educator" id="educator" />
                    <Label htmlFor="educator">Educator</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {!isLogin && userType === 'educator' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label>Select Membership Type:</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="flex items-center gap-1 text-primary"
                    aria-label="View Pricing Details"
                  >
                    <Link to="/pricing">
                      <Info size={16} />
                      <span>View Pricing Details</span>
                    </Link>
                  </Button>
                </div>
                <RadioGroup
                  value={membershipType}
                  onValueChange={(value) => setMembershipType(value as MembershipType)}
                  className="flex flex-col gap-4"
                  aria-label="Membership Type Selection"
                >
                  {renderMembershipOption('basic', 'Basic', 0)}
                  {renderMembershipOption('standard', 'Standard', 1900)}
                  {renderMembershipOption('premium', 'Premium', 4900)}
                </RadioGroup>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
              disabled={isLoading}
              aria-label={isLogin ? 'Switch to Sign Up' : 'Switch to Sign In'}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
