// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Shield, Home } from 'lucide-react';

// const AccessDenied: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-background">
//       <div className="text-center space-y-4">
//         <div className="flex justify-center">
//           <Shield className="h-16 w-16 text-red-500" />
//         </div>
//         <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
//         <p className="text-muted-foreground max-w-md">
//           You don't have permission to access this page. Please contact your administrator if you believe this is an error.
//         </p>
//         <Button onClick={() => navigate('/dashboard')}>
//           <Home className="mr-2 h-4 w-4" />
//           Go to Dashboard
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AccessDenied;