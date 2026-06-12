import api from '@/lib/api';

export interface Ticket {
    id: number;
    subject: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    created_by_id: number;
    created_by_role: string;
    related_id?: number | null;
    related_type?: string | null;
    messages?: TicketMessage[];
    creator?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

export interface TicketMessage {
    id: number;
    sender_id: number;
    sender_role: string;
    message: string;
    created_at: string;
    is_internal_note?: boolean;
    is_read?: number | boolean;
    attachments?: TicketAttachment[];
    sender?: {
        id: number;
        name: string;
        profile_image_url?: string;
    };
}

export interface TicketAttachment {
    id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
}

export const ticketService = {
    // Fetch all tickets with optional filters
    getTickets: async (filters: { status?: string; priority?: string; role?: string; page?: number } = {}) => {
        const query = new URLSearchParams(filters as any).toString();
        const response = await api.get(`/tickets?${query}`);
        return response.data;
    },

    // Fetch a single ticket details
    getTicket: async (id: number) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    // Create a new ticket
    createTicket: async (data: FormData) => {
        // FormData is needed for file uploads
        const response = await api.post('/tickets', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Reply to a ticket
    replyTicket: async (id: number, data: FormData) => {
        const response = await api.post(`/tickets/${id}/reply`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update ticket status (Admin only)
    updateStatus: async (id: number, status: string) => {
        const response = await api.put(`/tickets/${id}/status`, { status });
        return response.data;
    },

    // Delete ticket (Admin only)
    deleteTicket: async (id: number) => {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },
    downloadAttachment: async (ticketId: number, attachmentId: number, fileName: string) => {
        try {
            const response = await api.get(`/tickets/${ticketId}/attachments/${attachmentId}`, {
                responseType: 'blob',
            });

            // Create a blob link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Use the original file name
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed', error);
            throw error;
        }
    }
};
