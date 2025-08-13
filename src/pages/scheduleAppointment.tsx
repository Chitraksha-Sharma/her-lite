import React from 'react'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
// import { Textarea } from '@/components/ui/textarea';
// import { Calendar } from "@/components/ui/calendar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon, Save, Camera, Upload, X, RotateCcw } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const ScheduleAppointment = () => {
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
      });
      const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      };
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Patient data submitted:", formData);
        // Send formData to your backend API
      };

   
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Schedule Appointment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
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
                    {/* <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                    /> */}
                    {/* <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                        </Button> */}
                </div>
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
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    />
                </div>
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
            <div className="space-y-2 md:col-span-2">
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
            </div>
          {/* Action Buttons */}
        <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Register Patient
            </Button>
        </div>
        </form>
      
    </div>
  )
}

export default ScheduleAppointment
