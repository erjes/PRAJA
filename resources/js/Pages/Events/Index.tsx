import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    division_id: number | null;
    division?: { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
}

interface Division {
    id: number;
    name: string;
    description: string | null;
}

interface EventsProps {
    events: Event[];
    divisions: Division[];
}

export default function Index({ events, divisions }: EventsProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isStaff = user.role === 'staff';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Form for creating event
    const createForm = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        division_id: user.role === 'super_admin' ? 'company' : String(user.division_id || ''),
    });

    // Form for editing event
    const editForm = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        division_id: '',
    });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week (0-6)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Shift first day of week: Sunday (0) to end of week, or adjust so Mon is index 0
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Fill leading empty slots
        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(null);
        }

        // Fill days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const monthDays = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventStart = new Date(event.start_time);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('events.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        editForm.put(route('events.update', selectedEvent.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedEvent(null);
                editForm.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            editForm.delete(route('events.destroy', id), {
                onSuccess: () => {
                    setIsDetailOpen(false);
                    setSelectedEvent(null);
                }
            });
        }
    };

    const openEdit = (event: Event) => {
        setSelectedEvent(event);
        editForm.setData({
            title: event.title,
            description: event.description,
            start_time: new Date(event.start_time).toISOString().slice(0, 16),
            end_time: new Date(event.end_time).toISOString().slice(0, 16),
            division_id: event.division_id ? String(event.division_id) : 'company',
        });
        setIsDetailOpen(false);
        setIsEditOpen(true);
    };

    const openDetail = (event: Event) => {
        setSelectedEvent(event);
        setIsDetailOpen(true);
    };

    return (
        <>
            <Head title="Jadwal Event BPA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Event & Kegiatan</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola dan lihat kalender kegiatan internal BPA.
                        </p>
                    </div>
                    {!isStaff && (
                        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Event
                        </Button>
                    )}
                </div>

                {/* Calendar Grid */}
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{monthName}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Days of week */}
                        <div className="grid grid-cols-7 border-b text-center text-xs font-semibold text-muted-foreground">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                <div key={day} className="py-3 border-r last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>
                        {/* Days matrix */}
                        <div className="grid grid-cols-7 grid-rows-5 bg-muted/20">
                            {monthDays.map((day, i) => {
                                const dayEvents = day ? getEventsForDate(day) : [];
                                const isToday = day && day.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[100px] border-r border-b p-2 transition-colors hover:bg-muted/10 flex flex-col justify-between last:border-r-0 ${
                                            !day ? 'bg-muted/5' : ''
                                        }`}
                                    >
                                        {day ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={`text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full ${
                                                            isToday
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-foreground'
                                                        }`}
                                                    >
                                                        {day.getDate()}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                                                    {dayEvents.map((event) => (
                                                        <button
                                                            key={event.id}
                                                            onClick={() => openDetail(event)}
                                                            className={`w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                                                event.division_id
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                                    : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                                            }`}
                                                        >
                                                            {event.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Event Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="create-title">Judul Kegiatan</Label>
                            <Input
                                id="create-title"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="create-desc">Deskripsi</Label>
                            <Textarea
                                id="create-desc"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="create-start">Waktu Mulai</Label>
                                <Input
                                    id="create-start"
                                    type="datetime-local"
                                    value={createForm.data.start_time}
                                    onChange={(e) => createForm.setData('start_time', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="create-end">Waktu Selesai</Label>
                                <Input
                                    id="create-end"
                                    type="datetime-local"
                                    value={createForm.data.end_time}
                                    onChange={(e) => createForm.setData('end_time', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {user.role === 'super_admin' && (
                            <div className="space-y-1">
                                <Label htmlFor="create-div">Kategori Event</Label>
                                <Select
                                    value={createForm.data.division_id}
                                    onValueChange={(val) => createForm.setData('division_id', val)}
                                >
                                    <SelectTrigger id="create-div">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Perusahaan (Company-wide)</SelectItem>
                                        {divisions.map((div) => (
                                            <SelectItem key={div.id} value={String(div.id)}>
                                                Divisi: {div.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Simpan Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Event Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                        selectedEvent.division_id
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                        {selectedEvent.division_id ? `Divisi: ${selectedEvent.division?.name}` : 'Company-wide Event'}
                                    </span>
                                </div>
                                <DialogTitle className="text-xl mt-1">{selectedEvent.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Deskripsi Kegiatan</Label>
                                    <p className="text-sm whitespace-pre-wrap mt-1">{selectedEvent.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Mulai</Label>
                                        <p className="text-sm mt-0.5 font-medium">{new Date(selectedEvent.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Selesai</Label>
                                        <p className="text-sm mt-0.5 font-medium">{new Date(selectedEvent.end_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground border-t pt-3 flex justify-between">
                                    <span>Dibuat oleh: {selectedEvent.creator?.name || 'Sistem'}</span>
                                </div>
                            </div>
                            <DialogFooter className="flex items-center justify-between gap-2 border-t pt-3">
                                {(!isStaff && (user.role === 'super_admin' || selectedEvent.division_id === user.division_id)) ? (
                                    <>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(selectedEvent.id)} className="mr-auto">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" onClick={() => openEdit(selectedEvent)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Event
                                        </Button>
                                    </>
                                ) : (
                                    <span />
                                )}
                                <Button type="button" onClick={() => setIsDetailOpen(false)}>
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Event Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-title">Judul Kegiatan</Label>
                            <Input
                                id="edit-title"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-desc">Deskripsi</Label>
                            <Textarea
                                id="edit-desc"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="edit-start">Waktu Mulai</Label>
                                <Input
                                    id="edit-start"
                                    type="datetime-local"
                                    value={editForm.data.start_time}
                                    onChange={(e) => editForm.setData('start_time', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-end">Waktu Selesai</Label>
                                <Input
                                    id="edit-end"
                                    type="datetime-local"
                                    value={editForm.data.end_time}
                                    onChange={(e) => editForm.setData('end_time', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {user.role === 'super_admin' && (
                            <div className="space-y-1">
                                <Label htmlFor="edit-div">Kategori Event</Label>
                                <Select
                                    value={editForm.data.division_id}
                                    onValueChange={(val) => editForm.setData('division_id', val)}
                                >
                                    <SelectTrigger id="edit-div">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">Perusahaan (Company-wide)</SelectItem>
                                        {divisions.map((div) => (
                                            <SelectItem key={div.id} value={String(div.id)}>
                                                Divisi: {div.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Events', href: '/events' }]}
    >
        {page}
    </AppSidebarLayout>
);
