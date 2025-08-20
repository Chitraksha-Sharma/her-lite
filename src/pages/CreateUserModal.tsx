import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateUser from './CreateUser';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface CreateUserModalProps {
  onSuccess?: () => void; // Optional: callback after user is created
}

export default function CreateUserModal({ onSuccess }: CreateUserModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary/90 flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Create User
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUser
            onClose={() => setOpen(false)}
            onSuccess={onSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}