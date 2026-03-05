import { useProfile, useUpdateProfile, useAddExperience, useDeleteExperience, useAddEducation, useDeleteEducation, useClearProfileData, useUpdateCoverLetter, useUsage } from "@/hooks/use-profile";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Briefcase, GraduationCap, Link2, Linkedin, User as UserIcon, Mail, Phone, Calendar, RotateCcw, Globe, FileText, Crown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { SUPPORTED_COUNTRIES, type SupportedCountry } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const PREMIUM_UPGRADE_MSG = "You have premium features. Upgrade to unlock editing, cover letter, and more.";

export default function Dashboard() {
  const { data, isLoading } = useProfile();
  const { data: usageData } = useUsage();
  const isPremium = usageData?.isPremium ?? false;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data?.user) return null;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-background border-b border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground"
              >
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{data.user.firstName && data.user.lastName ? `${data.user.firstName} ${data.user.lastName}` : data.user.firstName || data.user.email || "there"}</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                Manage your profile data here. The Chrome extension will use this information to autofill job applications.
              </motion.p>
            </div>
            
            <div className="w-full md:w-auto flex-shrink-0 flex flex-col sm:flex-row gap-3">
               {!isPremium && (
                 <Link href="/pricing">
                   <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/30">
                     <Crown className="w-4 h-4" />
                     Upgrade to unlock editing
                   </Button>
                 </Link>
               )}
               <EditProfileDialog user={data.user} isPremium={isPremium} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profiles, Personal Info & Upload */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ProfileSwitcher />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg shadow-black/5 border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/50 border-b border-border/50">
                  <CardTitle className="font-display flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                      <p className="truncate font-medium">{data.user.email || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                      <p className="font-medium">{data.user.phone || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LinkedIn</p>
                      {data.user.linkedin ? (
                        <a href={data.user.linkedin} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-primary hover:underline block">
                          {data.user.linkedin}
                        </a>
                      ) : (
                        <p className="text-muted-foreground italic">Click "Edit Profile" to add</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Portfolio</p>
                      {data.user.portfolio ? (
                        <a href={data.user.portfolio} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-primary hover:underline block">
                          {data.user.portfolio}
                        </a>
                      ) : (
                        <p className="text-muted-foreground italic">Click "Edit Profile" to add</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ResumeUpload />
              <ClearResumeButton />
            </motion.div>

          </div>

          {/* Right Column: Experience & Education */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Experience
                </h2>
                <AddExperienceDialog isPremium={isPremium} />
              </div>
              
              <div className="space-y-4">
                {(!data.activeProfile?.experience || data.activeProfile.experience.length === 0) ? (
                  <EmptyState title="No experience added" description="Upload your resume or add manually." />
                ) : (
                  data.activeProfile.experience.map((exp: any) => (
                    <ExperienceCard key={exp.id} data={exp} isPremium={isPremium} />
                  ))
                )}
              </div>
            </motion.div>

            {/* Education Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Education
                </h2>
                <AddEducationDialog isPremium={isPremium} />
              </div>
              
              <div className="space-y-4">
                {(!data.activeProfile?.education || data.activeProfile.education.length === 0) ? (
                  <EmptyState title="No education added" description="Add your degrees and schools." />
                ) : (
                  data.activeProfile.education.map((edu: any) => (
                    <EducationCard key={edu.id} data={edu} isPremium={isPremium} />
                  ))
                )}
              </div>
            </motion.div>

            {/* Cover Letter Section */}
            {data.activeProfile && (
              <CoverLetterSection 
                profileId={data.activeProfile.profile.id} 
                coverLetter={data.activeProfile.profile.coverLetter || ''}
                isPremium={isPremium}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ExperienceCard({ data, isPremium }: { data: any; isPremium: boolean }) {
  const { mutate: deleteExp, isPending } = useDeleteExperience();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    deleteExp(data.id);
  };

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">{data.title}</h3>
            <div className="text-primary font-medium">{data.company}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Calendar className="w-3 h-3" />
              {data.startDate} — {data.endDate || "Present"}
            </div>
            {data.description && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">
                {data.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EducationCard({ data, isPremium }: { data: any; isPremium: boolean }) {
  const { mutate: deleteEdu, isPending } = useDeleteEducation();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    deleteEdu(data.id);
  };

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">{data.school}</h3>
            <div className="text-primary font-medium">{data.degree} in {data.major}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Calendar className="w-3 h-3" />
              {data.gradYear && !['present', 'current', 'ongoing', 'n/a'].includes(data.gradYear.toLowerCase()) 
                ? `Class of ${data.gradYear}` 
                : 'Currently attending'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string, description: string }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function CoverLetterSection({ profileId, coverLetter, isPremium }: { profileId: number; coverLetter: string; isPremium: boolean }) {
  const [text, setText] = useState(coverLetter);
  const [hasChanges, setHasChanges] = useState(false);
  const { mutate: updateCoverLetter, isPending } = useUpdateCoverLetter();
  const { toast } = useToast();

  useEffect(() => {
    setText(coverLetter);
    setHasChanges(false);
  }, [coverLetter, profileId]);

  const handleSave = () => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    updateCoverLetter({ id: profileId, coverLetter: text }, {
      onSuccess: () => setHasChanges(false)
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    setText(e.target.value);
    setHasChanges(e.target.value !== coverLetter);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Cover Letter
          {!isPremium && (
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Premium</span>
          )}
        </h2>
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            data-testid="button-save-cover-letter"
          >
            {isPending ? 'Saving...' : 'Save Cover Letter'}
          </Button>
        )}
      </div>
      
      <Card className="shadow-lg shadow-black/5 border-border/50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Paste your cover letter here. When you use the Chrome extension on job applications, 
            it will automatically fill cover letter fields with this content.
          </p>
          <Textarea
            placeholder={isPremium ? "Dear Hiring Manager,&#10;&#10;I am writing to express my interest in..." : "Upgrade to add your cover letter..."}
            value={text}
            onChange={handleChange}
            onFocus={!isPremium ? () => toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" }) : undefined}
            readOnly={!isPremium}
            className={`min-h-[300px] resize-y ${!isPremium ? "cursor-not-allowed bg-muted/50" : ""}`}
            data-testid="textarea-cover-letter"
          />
          {!isPremium && (
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <Crown className="w-4 h-4" />
                Upgrade to unlock
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditProfileDialog({ user, isPremium }: { user: any; isPremium: boolean }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateProfile();
  const { toast } = useToast();
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      ...user,
      country: user.country || 'us'
    }
  });

  const selectedCountry = watch("country") as SupportedCountry;
  const isLatam = selectedCountry === SUPPORTED_COUNTRIES.MX || selectedCountry === SUPPORTED_COUNTRIES.CL;
  const isMexico = selectedCountry === SUPPORTED_COUNTRIES.MX;
  const isChile = selectedCountry === SUPPORTED_COUNTRIES.CL;

  const onSubmit = (data: any) => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    mutate(data, {
      onSuccess: () => setOpen(false)
    });
  };

  const getCountryLabel = (code: string) => {
    switch(code) {
      case 'us': return 'United States';
      case 'mx': return 'Mexico';
      case 'cl': return 'Chile';
      case 'other': return 'Other';
      default: return 'Select country';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-edit-profile">
          {!isPremium && <Crown className="w-4 h-4 mr-2" />}
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Country</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || 'us'} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder="Select country">{getCountryLabel(field.value)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="mx">Mexico</SelectItem>
                      <SelectItem value="cl">Chile</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {isLatam && (
                <p className="text-xs text-muted-foreground">
                  LATAM mode enabled - additional fields for {isMexico ? 'Mexican' : 'Chilean'} CVs
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name / Nombre</Label>
              <Input id="firstName" {...register("firstName")} data-testid="input-firstName" />
            </div>

            {isLatam ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paternalLastName">Apellido Paterno</Label>
                  <Input id="paternalLastName" {...register("paternalLastName")} placeholder="Garcia" data-testid="input-paternalLastName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maternalLastName">Apellido Materno</Label>
                  <Input id="maternalLastName" {...register("maternalLastName")} placeholder="Lopez" data-testid="input-maternalLastName" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} data-testid="input-lastName" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} data-testid="input-email" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="phoneCountryCode">Code</Label>
                <Input 
                  id="phoneCountryCode" 
                  {...register("phoneCountryCode")} 
                  placeholder={isMexico ? "+52" : isChile ? "+56" : "+1"} 
                  data-testid="input-phoneCountryCode"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} data-testid="input-phone" />
              </div>
            </div>

            {isMexico && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input id="rfc" {...register("rfc")} placeholder="XXXX000000XXX" data-testid="input-rfc" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curp">CURP</Label>
                  <Input id="curp" {...register("curp")} placeholder="XXXX000000XXXXXX00" data-testid="input-curp" />
                </div>
              </div>
            )}

            {isChile && (
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input id="rut" {...register("rut")} placeholder="12.345.678-9" data-testid="input-rut" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" {...register("linkedin")} data-testid="input-linkedin" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" {...register("portfolio")} data-testid="input-portfolio" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{isMexico ? 'Calle y Numero' : isChile ? 'Direccion' : 'Street Address'}</Label>
              <Input id="address" {...register("address")} placeholder={isMexico ? "Av. Reforma 123" : "123 Main St"} data-testid="input-address" />
            </div>

            {isMexico && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colonia">Colonia</Label>
                  <Input id="colonia" {...register("colonia")} placeholder="Centro" data-testid="input-colonia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delegacion">Delegacion/Municipio</Label>
                  <Input id="delegacion" {...register("delegacion")} placeholder="Cuauhtemoc" data-testid="input-delegacion" />
                </div>
              </div>
            )}

            {isChile && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comuna">Comuna</Label>
                  <Input id="comuna" {...register("comuna")} placeholder="Las Condes" data-testid="input-comuna" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" {...register("region")} placeholder="Metropolitana" data-testid="input-region" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{isMexico ? 'Ciudad' : isChile ? 'Ciudad' : 'City'}</Label>
                <Input id="city" {...register("city")} data-testid="input-city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{isMexico ? 'Estado' : isChile ? 'Region' : 'State'}</Label>
                <Input id="state" {...register("state")} data-testid="input-state" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">{isMexico ? 'Codigo Postal' : isChile ? 'Codigo Postal' : 'ZIP Code'}</Label>
              <Input id="zip" {...register("zip")} data-testid="input-zip" />
            </div>

            <div className="flex justify-end pt-4 sticky bottom-0 bg-background">
              <Button type="submit" disabled={isPending} data-testid="button-save-profile">
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AddExperienceDialog({ isPremium }: { isPremium: boolean }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddExperience();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register("title", { required: true })} placeholder="Senior Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company", { required: true })} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" {...register("startDate")} placeholder="Jan 2022" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" {...register("endDate")} placeholder="Present" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="Key achievements..." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Experience"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddEducationDialog({ isPremium }: { isPremium: boolean }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddEducation();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Manual
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Education</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input id="school" {...register("school", { required: true })} placeholder="University of Tech" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" {...register("degree")} placeholder="B.S." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input id="major" {...register("major")} placeholder="Computer Science" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradYear">Graduation Year</Label>
            <Input id="gradYear" {...register("gradYear")} placeholder="2024" />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Education"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClearResumeButton() {
  const { mutate: clearData, isPending } = useClearProfileData();
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    clearData(undefined, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 text-muted-foreground"
          data-testid="button-clear-resume"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Resume Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Resume Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all experience, education, and personal info from your current profile. 
            Your account will remain active so you can upload a new resume.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClear} disabled={isPending}>
            {isPending ? "Clearing..." : "Clear Data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
