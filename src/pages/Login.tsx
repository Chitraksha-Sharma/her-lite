import { useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react"; 
import AnimatedButton from "@/components/ui/AnimatedButton"
// import { loginWithOpenMRS } from "@/api/auth";
import { useAuth } from "../api/context/AuthContext";



const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login,session } = useAuth();
  useEffect(() => {
    if (session?.authenticated) {
      navigate("/location"); // or "/location" if you prefer
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const response = await login(credentials.username, credentials.password);
  
      if (response.success) {
        toast({
          title: "Login successful",
          description: "Please select a location sector to continue",
        });
        navigate("/location");
      } else {
        setError(response.error || "Login failed.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      backgroundImage: `url('/wallpaper-login.jpg')`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }}>
      <Card className="w-full max-w-md sm:max-w-lg  shadow-xl border-blue-200 rounded-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/EHR_Logo.jpeg" alt="Logo" className="h-24 w-24 rounded-xl" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">CurioMed EHR</CardTitle>
            <CardDescription className="text-gray-600">
              Secure Electronic Health Records System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {error && (
              <div className="flex items-center space-x-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="border-gray-300 focus:border-blue-500"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            <AnimatedButton
              variant="primary"
              size="lg"
              type="submit"
              className="w-full sm:w-1/2 mx-auto"
              disabled={isLoading || !credentials.username || !credentials.password}
              text={isLoading ? "Logging in..." : "Login"}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;