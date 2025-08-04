import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton"

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "Regal#2025New!";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (credentials.username === VALID_USERNAME && credentials.password === VALID_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true");

      toast({
          title: 'Login successful',
          description: 'Please select a location sector to continue',
        });
      setIsAuthenticated(true);
      navigate("/location");
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
    backgroundImage: `url('/wallpaper-login.jpg')`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }}>
      <Card className="w-full max-w-md shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
              <img src="/logo.png" alt="Logo" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">CurioMed EHR</CardTitle>
            <CardDescription className="text-gray-600">
              Secure Electronic Health Records System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="border-gray-300 focus:border-blue-500"
                required
              />
            </div>
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              text="Login"
            />
              
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;