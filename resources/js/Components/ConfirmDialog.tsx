import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = 'Hapus',
    cancelText = 'Batal'
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-6 border-none bg-card shadow-2xl rounded-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center w-full">{title}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-base mt-2 mb-6 text-muted-foreground text-center">
                        {description}
                    </DialogDescription>
                </div>
                <DialogFooter className="flex gap-2 sm:justify-center w-full">
                    <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                        onOpenChange(false);
                        onConfirm();
                    }}>
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
