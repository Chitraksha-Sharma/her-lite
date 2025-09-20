import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Camera, Upload, X, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DayPicker, CaptionProps } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { submitPatient } from "@/api/patientApi";
// import { toast } from 'sonner'; 

// const getSessionToken = () => {
//   const session = localStorage.getItem("session");
//   return session ? JSON.parse(session).token : null;
// };

const PatientRegistration = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [abhaNumber, setAbhaNumber] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const emptyFormData = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    houseStreet: "",
    postalCode: "",
    gramPanchayat: "",
    tehsil: "",
    cityVillage: "",
    district: "",
    state: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    photo: "",
  };
  
  const [formData, setFormData] = useState(emptyFormData);
  
  // const [formData, setFormData] = useState({
  //   firstName: "",
  //   lastName: "",
  //   dateOfBirth: "",
  //   gender: "",
  //   phone: "",
  //   email: "",
  //   houseStreet: "",
  //   postalCode: "",
  //   gramPanchayat: "",
  //   tehsil: "",
  //   cityVillage: "",
  //   district: "",
  //   state: "",
  //   emergencyContact: "",
  //   emergencyPhone: "",
  //   bloodType: "",
  //   allergies: "",
  //   medicalHistory: "",
  //   photo: "" // store Base64 of captured/uploaded image
  // });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const relationshipTypes = [
    "Father",
    "Mother", 
    "Spouse",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Guardian",
    "Other"
  ];

  const visitTypes = [
    "OPD Visit",
    "Emergency Visit", 
    "Follow-up Visit",
    "Consultation",
    "Check-up"
  ];

  // Format Aadhaar input: 1234-5678-9012
  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 12);
    let formatted = cleaned;

    if (cleaned.length > 4) {
      formatted = cleaned.substring(0, 4) + "-" + cleaned.substring(4);
    }
    if (cleaned.length > 8) {
      formatted = formatted.substring(0, 9) + "-" + cleaned.substring(8);
    }

    return formatted;
  };

  const isValidAadhaar = (value: string) => {
    return /^\d{12}$/.test(value.replace(/-/g, ""));
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9]/g, "");
    const formatted = formatAadhaar(cleaned);
    setAadhaarNumber(formatted);
  };

  const isValidABHA = (value: string) => /^\d{14}$/.test(value.replace(/-/g, ""));

  const handleAbhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 14);
    const formatted = value.length > 10
      ? `${value.slice(0, 2)}-${value.slice(2, 6)}-${value.slice(6, 10)}-${value.slice(10)}`
      : value;
    setAbhaNumber(formatted);
  };


  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedEmergencyValue = formatEmergencyNumber(e.target.value);
    setFormData((prev) => ({ ...prev, emergencyPhone: formattedEmergencyValue }));
  };

  const formatEmergencyNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  // Phone number formatting with +91 country code
  const formatPhoneNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    return numericValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formattedValue }));
  };

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email }));

    if (email && !validateEmail(email)) {
      console.log("Invalid email format");
    }
  };

  //  // Relationship handlers
  //  const addRelationship = () => {
  //   setRelationships([...relationships, { type: "", nameOrId: "", tillDate: "" }]);
  // };

  // const removeRelationship = (index: number) => {
  //   if (relationships.length > 1) {
  //     setRelationships(relationships.filter((_, i) => i !== index));
  //   }
  // };

  // const updateRelationship = (index: number, field: string, value: string) => {
  //   const updated = relationships.map((rel, i) => 
  //     i === index ? { ...rel, [field]: value } : rel
  //   );
  //   setRelationships(updated);
  // };

  // const saveRelationships = () => {
  //   toast({
  //     title: "Success",
  //     description: "Relationships saved successfully!",
  //   });
  // };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit intercepted ✅, no navigation should happen.");
    setSubmitError(null);
    setIsSubmitting(true);
  
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender ||
        !formData.phone || !formData.cityVillage || !formData.district || !formData.state || !formData.postalCode) {
      setSubmitError("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

     // ✅ Validate birthdate is not in the future
     if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if(birthDate > today){
        toast({
          variant: "destructive",
          title: "Invalid Birthdate",
          description: "Birthdate cannot be in the future.",
        });
        return;
      }
    }
  
    const result = await submitPatient(formData, abhaNumber, aadhaarNumber);
  
    if (result.success) {
      toast({
        title: "Success",
        description: "Patient registered successfully!",
      });

      // ✅ Reset form
      setFormData(emptyFormData);
      setAadhaarNumber("");
      setAbhaNumber("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsCameraOn(false);
    } else {
      // Handle specific errors
      switch (result.error) {
        case "auth_token_missing":
        case "auth_token_invalid":
          // Only redirect to login if auth fails
          localStorage.setItem("redirectAfterLogin", "/patient-registration");
          navigate("/login");
          toast({
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          break;
  
        case "location_not_selected":
          // Redirect to location selection
          toast({
            title: "Location Required",
            description: "Please select a location first.",
            variant: "destructive",
          });
          navigate("/select-location"); // or wherever your location page is
          break;
  
        case "network_error":
          toast({
            title: "Network Error",
            description: "Check your connection or server status.",
            variant: "destructive",
          });
          break;
  
        default:
          toast({
            title: "Error",
            description: result.error || "Unknown error occurred.",
            variant: "destructive",
          });
          setSubmitError(result.error);
          break;
      }
    }
  
    setIsSubmitting(false);
  };

  // 📷 Start camera with improved device selection
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
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
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
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
          <h1 className="text-3xl font-bold text-black">Patient Registration</h1>
          <p className="text-muted-foreground">Register a new patient in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personal Information with Profile Image */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-black">Personal Information</CardTitle>
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
                    <Label htmlFor="AadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="aadhaar"
                      type="text"
                      inputMode="numeric"
                      value={aadhaarNumber}
                      onChange={handleAadhaarChange}
                      maxLength={14}
                      placeholder="Enter your aadhaar number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="AbhaNumber">ABHA Number</Label>
                    <Input
                      id="abha"
                      type="text"
                      inputMode="numeric"
                      value={abhaNumber}
                      onChange={handleAbhaChange}
                      placeholder="Enter your abha number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Date of Birth</label>
                    <Input
                        type='date'
                        name="dateofBirth"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value }) }
                    />
                  </div>

                  {/* <DOBPicker value={formData.dateOfBirth}onChange={(date) => setFormData((prev) => ({ ...prev, dateOfBirth: date }))}/> */}

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
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/60"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/60"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/60"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/60"></div>
                          </div>
                        </div>

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

                        <div className="flex items-center justify-center mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Live Preview
                          </div>
                        </div>
                      </div>
                    )}

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

                  {/* Action Buttons */}
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
              <CardTitle className="text-black">Contact Information</CardTitle>
              <CardDescription>Phone, email, and address details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="example@domain.com"
                  className={formData.email && !validateEmail(formData.email) ? "border-red-500" : ""}
                />
                {formData.email && !validateEmail(formData.email) && (
                  <p className="text-sm text-red-600">Please enter a valid email address.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-black">Address</CardTitle>
              <CardDescription>Address details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>House No. / Street</Label>
                <Input
                  id="houseStreet"
                  placeholder="Enter house number and street"
                  value={formData.houseStreet}
                  onChange={(e) => setFormData({ ...formData, houseStreet: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="Enter postal code"
                  value={formData.postalCode}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, postalCode: onlyDigits });
                  }}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gram Panchayat</Label>
                <Input
                  id="gramPanchayat"
                  placeholder="Enter Gram Panchayat"
                  value={formData.gramPanchayat}
                  onChange={(e) => setFormData({ ...formData, gramPanchayat: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Tehsil</Label>
                <Input
                  id="tehsil"
                  placeholder="Enter Tehsil"
                  value={formData.tehsil}
                  onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>City / Village *</Label>
                <Input
                  id="cityVillage"
                  placeholder="Enter City or Village"
                  value={formData.cityVillage}
                  onChange={(e) => setFormData({ ...formData, cityVillage: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>District *</Label>
                <Input
                  id="district"
                  placeholder="Enter District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  id="state"
                  placeholder="Enter State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input
                  id="country"
                  placeholder="India"
                  value="India"
                  disabled
                  className="border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-black">Emergency Contact</CardTitle>
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
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleEmergencyChange}
                    placeholder="Enter 10-digit number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-black">Medical Information</CardTitle>
              <CardDescription>Medical history and health details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
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
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Registering..." : "Register Patient"}
            </Button>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm text-center">
              {submitError}
            </div>
          )}
        </div>
      </form>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PatientRegistration;