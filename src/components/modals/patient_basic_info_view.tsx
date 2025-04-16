"use client";

import type React from "react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Calendar, MapPin, Edit, Save, X, Heart, Globe, Home, BookOpen, Users} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Patient {
    patient_id: string;
    patient_id_provided: string;
    first_name: string;
    last_name: string;
    middle_initial?: string;
    date_of_birth: string;
    permanent_address?: string;
    contact_number?: string;
    civil_status?: string;
    religion?: string;
    birthplace?: string;
    nationality?: string;
    spouse_name?: string;
}

interface PatientBasicInfoViewProps {
    trigger: React.ReactNode;
    patient: Patient;
    onEdit?: () => void;
}

const supabase = createClient();

export function PatientBasicInfoView({
    trigger,
    patient,
    onEdit
}: PatientBasicInfoViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Patient>({
        patient_id: patient?.patient_id || "",
        patient_id_provided: patient?.patient_id_provided || "",
        first_name: patient?.first_name || "",
        last_name: patient?.last_name || "",
        middle_initial: patient?.middle_initial || "",
        date_of_birth: patient?.date_of_birth || "",
        permanent_address: patient?.permanent_address || "",
        contact_number: patient?.contact_number || "",
        civil_status: patient?.civil_status || "",
        religion: patient?.religion || "",
        birthplace: patient?.birthplace || "",
        nationality: patient?.nationality || "",
        spouse_name: patient?.spouse_name || "",
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                patient_id: patient.patient_id || "",
                patient_id_provided: patient.patient_id_provided || "",
                first_name: patient.first_name || "",
                last_name: patient.last_name || "",
                middle_initial: patient.middle_initial || "",
                date_of_birth: patient.date_of_birth || "",
                permanent_address: patient.permanent_address || "",
                contact_number: patient.contact_number || "",
                civil_status: patient.civil_status || "",
                religion: patient.religion || "",
                birthplace: patient.birthplace || "",
                nationality: patient.nationality || "",
                spouse_name: patient.spouse_name || "",
            });
        }
    }, [patient]);

    const calculateAge = (dateOfBirth: string) => {
        try {
            const birthDate = new Date(dateOfBirth);
            if (isNaN(birthDate.getTime())) return "N/A";

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            return age;
        } catch {
            return "N/A";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from("Patients")
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    middle_initial: formData.middle_initial,
                    date_of_birth: formData.date_of_birth,
                    permanent_address: formData.permanent_address,
                    contact_number: formData.contact_number,
                    civil_status: formData.civil_status,
                    religion: formData.religion,
                    birthplace: formData.birthplace,
                    nationality: formData.nationality,
                    spouse_name: formData.spouse_name,
                })
                .eq("patient_id", patient.patient_id)
                .select();

            if (error) {
                console.error("Error updating patient:", error);
                return;
            }

            console.log("Patient updated successfully:", data);
            setIsEditing(false);
            if (onEdit) onEdit();
        } catch (error) {
            console.error("Error in update operation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        if (patient) {
            setFormData({
                patient_id: patient.patient_id || "",
                patient_id_provided: patient.patient_id_provided || "",
                first_name: patient.first_name || "",
                last_name: patient.last_name || "",
                middle_initial: patient.middle_initial || "",
                date_of_birth: patient.date_of_birth || "",
                permanent_address: patient.permanent_address || "",
                contact_number: patient.contact_number || "",
                civil_status: patient.civil_status || "",
                religion: patient.religion || "",
                birthplace: patient.birthplace || "",
                nationality: patient.nationality || "",
                spouse_name: patient.spouse_name || "",
            });
        }
        setIsEditing(false);
    };

    const getStatusColor = (status?: string) => {
        if (!status) return "bg-gray-100";
        switch (status.toLowerCase()) {
            case "married":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "single":
                return "bg-sky-50 text-sky-700 border-sky-200";
            case "divorced":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "widowed":
                return "bg-purple-50 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
    };

    const slideUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 24,
                delay: 0.1
            } 
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent
                side="right"
                className="w-full max-w-md md:max-w-lg overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-6 rounded-l-xl border-l shadow-lg"
            >
                <SheetHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <motion.div 
                                className="mb-6"
                                variants={slideUp}
                            >
                                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary/10 to-primary/5">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    {formData.first_name} {formData.middle_initial ? `${formData.middle_initial}. ` : ''}{formData.last_name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.civil_status && (
                                                        <Badge variant="outline" className={cn("px-2 py-1 text-xs font-medium", getStatusColor(formData.civil_status))}>
                                                            {formData.civil_status}
                                                        </Badge>
                                                    )}
                                                    {formData.date_of_birth && (
                                                        <Badge variant="outline" className="px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 border-violet-200">
                                                            Age: {calculateAge(formData.date_of_birth)}
                                                        </Badge>
                                                    )}
                                                    {formData.nationality && (
                                                        <Badge variant="outline" className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                                                            {formData.nationality}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="px-3 py-1 text-xs font-medium bg-primary/5 text-primary border-primary/20">
                                                        ID: {formData.patient_id_provided}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </SheetTitle>   
                    </div>
                </SheetHeader>

                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="edit-form"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={fadeIn}
                            className="py-4"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    variants={slideUp}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-slate-700">First Name</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="last_name" className="text-slate-700">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="middle_initial" className="text-slate-700">Middle Initial</Label>
                                        <Input
                                            id="middle_initial"
                                            name="middle_initial"
                                            value={formData.middle_initial || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth" className="text-slate-700">Date of Birth</Label>
                                        <Input
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            type="date"
                                            value={formData.date_of_birth || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number" className="text-slate-700">Contact Number</Label>
                                        <Input
                                            id="contact_number"
                                            name="contact_number"
                                            value={formData.contact_number || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="civil_status" className="text-slate-700">Civil Status</Label>
                                        <Select
                                            value={formData.civil_status || ""}
                                            onValueChange={(value) =>
                                                handleSelectChange("civil_status", value)
                                            }
                                        >
                                            <SelectTrigger id="civil_status" className="w-full border-slate-200 focus:ring-primary/20">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Single">Single</SelectItem>
                                                <SelectItem value="Married">Married</SelectItem>
                                                <SelectItem value="Divorced">Divorced</SelectItem>
                                                <SelectItem value="Widowed">Widowed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="space-y-2"
                                    variants={slideUp}
                                >
                                    <Label htmlFor="permanent_address" className="text-slate-700">Permanent Address</Label>
                                    <Input
                                        id="permanent_address"
                                        name="permanent_address"
                                        value={formData.permanent_address || ""}
                                        onChange={handleChange}
                                        className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                    />
                                </motion.div>

                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    variants={slideUp}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="religion" className="text-slate-700">Religion</Label>
                                        <Input
                                            id="religion"
                                            name="religion"
                                            value={formData.religion || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birthplace" className="text-slate-700">Birthplace</Label>
                                        <Input
                                            id="birthplace"
                                            name="birthplace"
                                            value={formData.birthplace || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nationality" className="text-slate-700">Nationality</Label>
                                        <Input
                                            id="nationality"
                                            name="nationality"
                                            value={formData.nationality || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="spouse_name" className="text-slate-700">Spouse Name</Label>
                                        <Input
                                            id="spouse_name"
                                            name="spouse_name"
                                            value={formData.spouse_name || ""}
                                            onChange={handleChange}
                                            className="w-full border-slate-200 focus:border-primary focus:ring-primary/20"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="flex justify-between pt-6"
                                    variants={slideUp}
                                >
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={cancelEdit}
                                        className="border-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-primary hover:bg-primary/90 transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="view-mode"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={fadeIn}
                            className="py-4"
                        >

                            <div className="space-y-6">
                                <motion.div 
                                    className="space-y-4"
                                    variants={slideUp}
                                >
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Personal Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem 
                                            icon={<Calendar className="text-primary" />}
                                            label="Date of Birth"
                                            value={formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : "N/A"}
                                        />
                                        <InfoItem 
                                            icon={<Phone className="text-primary" />}
                                            label="Contact Number"
                                            value={formData.contact_number || "N/A"}
                                        />
                                        <InfoItem 
                                            icon={<Users className="text-primary" />}
                                            label="Civil Status"
                                            value={formData.civil_status || "N/A"}
                                        />
                                        <InfoItem 
                                            icon={<Heart className="text-primary" />}
                                            label="Spouse Name"
                                            value={formData.spouse_name || "N/A"}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="space-y-4"
                                    variants={slideUp}
                                >
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Location & Background</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoItem 
                                            icon={<Home className="text-primary" />}
                                            label="Permanent Address"
                                            value={formData.permanent_address || "N/A"}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoItem 
                                                icon={<MapPin className="text-primary" />}
                                                label="Birthplace"
                                                value={formData.birthplace || "N/A"}
                                            />
                                            <InfoItem 
                                                icon={<Globe className="text-primary" />}
                                                label="Nationality"
                                                value={formData.nationality || "N/A"}
                                            />
                                            <InfoItem 
                                                icon={<BookOpen className="text-primary" />}
                                                label="Religion"
                                                value={formData.religion || "N/A"}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="pt-6"
                                    variants={slideUp}
                                >
                                    <Button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full md:w-auto bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Information
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
    return (
        <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
            </div>
        </div>
    );
}
