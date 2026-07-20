import { AppContent } from '@/Components/app-content';
import { AppShell } from '@/Components/app-shell';
import { AppSidebar } from '@/Components/app-sidebar';
import { AppSidebarHeader } from '@/Components/app-sidebar-header';
import type { AppLayoutProps } from '@/types/ui';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { flash } = usePage().props as any;
    const [alertData, setAlertData] = useState<{type: 'error'|'success', message: string} | null>(null);

    useEffect(() => {
        if (flash?.error) {
            setAlertData({ type: 'error', message: flash.error });
            flash.error = null;
        } else if (flash?.success) {
            setAlertData({ type: 'success', message: flash.success });
            flash.success = null;
        }
    }, [flash]);

    const closeAlert = () => setAlertData(null);

    return (
        <AppShell variant="sidebar">
            <Dialog open={alertData !== null} onOpenChange={(open) => !open && closeAlert()}>
                <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center p-8 border-none bg-card shadow-2xl rounded-2xl">
                    {alertData?.type === 'error' ? (
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                    )}
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center w-full">
                            {alertData?.type === 'error' ? 'Peringatan' : 'Berhasil'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-base text-muted-foreground">{alertData?.message}</p>
                    </div>
                    <DialogFooter className="w-full mt-4 flex justify-center sm:justify-center">
                        <Button 
                            className={`w-full max-w-[200px] text-white ${alertData?.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            onClick={closeAlert}
                        >
                            Mengerti
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden flex flex-col">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div key={usePage().url} className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out fill-mode-both flex-1 flex flex-col">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
