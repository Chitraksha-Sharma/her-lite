import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Save, Camera, Upload, X, RotateCcw } from "lucide-react";
import { format } from "date-fns";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    photo: "" // store Base64 of captured/uploaded image
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

   // Phone number formatting with +91 country code
   const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "");
    const limitedValue = numericValue.slice(0, 10);
    
    if (limitedValue.length > 0) {
      return `+91 ${limitedValue}`;
    }
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formattedValue }));
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    // Optional: Add real-time validation feedback
    if (email && !validateEmail(email)) {
      console.log("Invalid email format");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Patient data submitted:", formData);
    // Send formData to your backend API
  };

  // 📷 Start camera with improved device selection
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" // Prefer front camera
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or not available. Please check your camera permissions.");
    }
  };

  // 📸 Capture photo from video
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG for smaller file size
        console.log("Captured image data length:", imageData.length);
        setFormData((prev) => ({ ...prev, photo: imageData }));
        stopCamera();
      }
    } else {
      console.error("Video not ready or no dimensions available");
      alert("Please wait for the camera to fully load before capturing.");
    }
  };

  // 🛑 Stop camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOn(false);
  };

  // 📤 Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear photo
  const clearPhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Save className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">Patient Registration</h1>
          <p className="text-muted-foreground">Register a new patient in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personal Information with Profile Image */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Personal Information</CardTitle>
              <CardDescription>Basic patient details and profile photo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Personal Info Fields - Takes 2/3 of the space */}
                <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dateOfBirth}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Profile Image Section - Takes 1/3 of the space */}
                <div className="md:col-span-1 flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium">Profile Photo</Label>
                  </div>

                  {/* Image Display Area */}
                  <div className="relative">
                    {!formData.photo && !isCameraOn && (
                      <div className="w-32 h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">No photo</p>
                      </div>
                    )}

                    {/* Camera Active - Improved UI */}
                    {isCameraOn && !formData.photo && (
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-black">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-48 h-48 object-cover"
                            onLoadedMetadata={() => {
                              console.log("Video metadata loaded");
                              if (videoRef.current) {
                                console.log("Video dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
                              }
                            }}
                          />
                          {/* Camera overlay UI */}
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/60"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/60"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/60"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/60"></div>
                          </div>
                        </div>
                        
                        {/* Camera Controls */}
                        <div className="flex justify-center items-center gap-3 mt-4">
                          <Button 
                            size="lg" 
                            onClick={capturePhoto}
                            className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 p-0 shadow-lg"
                            type="button"
                          >
                            <Camera className="h-5 w-5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={stopCamera}
                            type="button"
                            className="rounded-full"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                        
                        {/* Live preview indicator */}
                        <div className="flex items-center justify-center mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Live Preview
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show captured/uploaded photo - Enhanced */}
                    {formData.photo && !isCameraOn && (
                      <div className="relative group">
                        <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 shadow-md">
                          <img 
                            src={formData.photo} 
                            alt="Patient Profile" 
                            className="w-48 h-48 object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              console.error("Image load error:", e);
                              console.log("Image src:", formData.photo.substring(0, 50) + "...");
                            }}
                            onLoad={() => console.log("Image loaded successfully")}
                          />
                          {/* Photo overlay on hover */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-sm font-medium">Profile Photo</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 shadow-lg"
                          onClick={clearPhoto}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Enhanced UI */}
                  {!formData.photo && !isCameraOn && (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">Add a profile photo</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={startCamera}
                          className="flex-1 h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                          <Camera className="h-5 w-5 mr-2 text-primary" /> 
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                        >
                          <Upload className="h-5 w-5 mr-2 text-primary" />
                          Upload
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  {formData.photo && !isCameraOn && (
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearPhoto}
                        className="w-full h-10 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Retake Photo
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="flex-1 text-sm"
                        >
                          <Camera className="mr-1 h-4 w-4" /> Camera
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 text-sm"
                        >
                          <Upload className="mr-1 h-4 w-4" /> Upload
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Contact Information</CardTitle>
              <CardDescription>Phone, email, and address details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter full address"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Emergency Contact</CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Medical Information</CardTitle>
              <CardDescription>Medical history and health details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select onValueChange={(value) => handleInputChange("bloodType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="List any known allergies"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  placeholder="Enter relevant medical history"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Register Patient
            </Button>
          </div>
        </div>
      </form>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PatientRegistration;