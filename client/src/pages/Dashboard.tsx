import { useProfile, useUpdateProfile, useAddExperience, useDeleteExperience, useAddEducation, useDeleteEducation } from "@/hooks/use-profile";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Briefcase, GraduationCap, Link2, Linkedin, User as UserIcon, Mail, Phone, Calendar } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data, isLoading } = useProfile();
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

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
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{data.user.firstName || data.user.email || "there"}</span>
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
            
            <div className="w-full md:w-auto flex-shrink-0">
               <EditProfileDialog user={data.user} />
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
                      <a href={data.user.linkedin || "#"} target="_blank" className="truncate font-medium text-primary hover:underline block">
                        {data.user.linkedin || "Not set"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Portfolio</p>
                      <a href={data.user.portfolio || "#"} target="_blank" className="truncate font-medium text-primary hover:underline block">
                        {data.user.portfolio || "Not set"}
                      </a>
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
                <AddExperienceDialog />
              </div>
              
              <div className="space-y-4">
                {data.experience.length === 0 ? (
                  <EmptyState title="No experience added" description="Upload your resume or add manually." />
                ) : (
                  data.experience.map((exp) => (
                    <ExperienceCard key={exp.id} data={exp} />
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
                <AddEducationDialog />
              </div>
              
              <div className="space-y-4">
                {data.education.length === 0 ? (
                  <EmptyState title="No education added" description="Add your degrees and schools." />
                ) : (
                  data.education.map((edu) => (
                    <EducationCard key={edu.id} data={edu} />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ExperienceCard({ data }: { data: any }) {
  const { mutate: deleteExp, isPending } = useDeleteExperience();
  
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
            onClick={() => deleteExp(data.id)}
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

function EducationCard({ data }: { data: any }) {
  const { mutate: deleteEdu, isPending } = useDeleteEducation();

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">{data.school}</h3>
            <div className="text-primary font-medium">{data.degree} in {data.major}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
              <Calendar className="w-3 h-3" />
              Class of {data.gradYear}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteEdu(data.id)}
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

function EditProfileDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateProfile();
  const { register, handleSubmit } = useForm({
    defaultValues: user
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" {...register("linkedin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input id="portfolio" {...register("portfolio")} />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddExperienceDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddExperience();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
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

function AddEducationDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddEducation();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
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
