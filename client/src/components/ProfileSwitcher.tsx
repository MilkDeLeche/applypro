import { useState } from "react";
import { useProfiles, useCreateProfile, useDeleteProfile, useRenameProfile, useActivateProfile, useUsage } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, MoreVertical, Check, Pencil, Trash2, Crown } from "lucide-react";
import { Link } from "wouter";

const PREMIUM_UPGRADE_MSG = "You have premium features. Upgrade to unlock editing, cover letter, and more.";

export function ProfileSwitcher() {
  const { data: profilesData, isLoading } = useProfiles();
  const { data: usageData } = useUsage();
  const { toast } = useToast();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const renameProfile = useRenameProfile();
  const activateProfile = useActivateProfile();

  const [newProfileName, setNewProfileName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const tier = usageData?.tier || 'free';
  const isPremium = usageData?.isPremium ?? false;
  const canCreateMore = usageData?.profiles ? usageData.profiles.current < usageData.profiles.max : false;
  const isProTier = tier === 'pro';

  const handleCreate = () => {
    if (!newProfileName.trim()) return;
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    createProfile.mutate(newProfileName.trim(), {
      onSuccess: () => {
        setNewProfileName("");
        setCreateDialogOpen(false);
      }
    });
  };

  const handleActivate = (id: number) => {
    activateProfile.mutate(id);
  };

  const handleRename = (id: number) => {
    if (!editingName.trim()) return;
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    renameProfile.mutate({ id, name: editingName.trim() }, {
      onSuccess: () => {
        setEditingId(null);
        setEditingName("");
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!isPremium) {
      toast({ title: "Upgrade required", description: PREMIUM_UPGRADE_MSG, variant: "destructive" });
      return;
    }
    deleteProfile.mutate(id);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg shadow-black/5 border-border/50">
        <CardHeader className="bg-muted/50 border-b border-border/50">
          <CardTitle className="font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded-md" />
            <div className="h-12 bg-muted rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const profiles = profilesData?.profiles || [];
  const activeId = profilesData?.activeProfileId;

  return (
    <Card className="shadow-lg shadow-black/5 border-border/50" data-testid="card-profile-switcher">
      <CardHeader className="bg-muted/50 border-b border-border/50">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume Profiles
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {usageData?.profiles?.current || profiles.length} / {usageData?.profiles?.max || 1}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`flex items-center justify-between gap-2 p-3 rounded-md border transition-colors ${
              profile.id === activeId
                ? 'bg-primary/5 border-primary/30'
                : 'bg-background border-border/50 hover-elevate cursor-pointer'
            }`}
            onClick={() => profile.id !== activeId && handleActivate(profile.id)}
            data-testid={`profile-item-${profile.id}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {profile.id === activeId && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
              {editingId === profile.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(profile.id)}
                  onBlur={() => handleRename(profile.id)}
                  className="h-8"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  data-testid="input-rename-profile"
                />
              ) : (
                <span className={`truncate ${profile.id === activeId ? 'font-medium' : ''}`}>
                  {profile.name}
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button size="icon" variant="ghost" className="shrink-0" data-testid={`button-profile-menu-${profile.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(profile.id);
                    setEditingName(profile.name);
                  }}
                  data-testid="menu-rename-profile"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {profiles.length > 1 && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(profile.id);
                    }}
                    className="text-destructive"
                    data-testid="menu-delete-profile"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {canCreateMore ? (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2" data-testid="button-add-profile">
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Resume Profile</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Profile name (e.g., Tech Resume, Sales Resume)"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  data-testid="input-new-profile-name"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreate}
                  disabled={!newProfileName.trim() || createProfile.isPending}
                  data-testid="button-create-profile-confirm"
                >
                  {createProfile.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : !isProTier ? (
          <Link href="/pricing">
            <Button variant="outline" className="w-full mt-2 text-muted-foreground" data-testid="button-upgrade-for-profiles">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro for more profiles
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
