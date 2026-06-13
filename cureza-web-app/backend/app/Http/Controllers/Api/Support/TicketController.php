<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Ticket::with(['creator', 'messages']);

        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            $query->where('created_by_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('role') && ($user->role === 'admin' || $user->role === 'super_admin')) {
            $query->where('created_by_role', $request->role);
        }
        
        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string',
            'priority' => 'required|string|in:Low,Medium,High',
            'message' => 'required|string',
            'related_id' => 'nullable|integer',
            'related_type' => 'nullable|string', // e.g., 'order', 'product'
            'attachments.*' => 'nullable|file|max:10240', // 10MB max
        ]);

        $user = $request->user();

        $ticket = \App\Models\Ticket::create([
            'created_by_id' => $user->id,
            'created_by_role' => $user->role ?? 'customer', // Default to customer if not set
            'subject' => $request->subject,
            'category' => $request->category,
            'priority' => $request->priority,
            'status' => 'OPEN',
            'related_id' => $request->related_id,
            'related_type' => $request->related_type ? "App\\Models\\" . ucfirst($request->related_type) : null,
        ]);

        $message = $ticket->messages()->create([
            'sender_id' => $user->id,
            'sender_role' => $user->role ?? 'customer',
            'message' => $request->message,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('tickets/' . $ticket->id, 'local'); // Store safely
                
                $message->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Notify Admins
        $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->get();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewTicketNotification($ticket));

        return response()->json($ticket->load('messages.attachments'), 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $ticket = \App\Models\Ticket::with(['messages.attachments', 'messages.sender', 'creator'])->findOrFail($id);

        if ($user->role !== 'admin' && $user->role !== 'super_admin' && $ticket->created_by_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Mark messages as read:
        if ($user->role === 'admin' || $user->role === 'super_admin') {
            $ticket->messages()
                   ->whereNotIn('sender_role', ['admin', 'super_admin'])
                   ->where('is_read', false)
                   ->update(['is_read' => true]);
        } else {
            $ticket->messages()
                   ->whereIn('sender_role', ['admin', 'super_admin'])
                   ->where('is_read', false)
                   ->update(['is_read' => true]);
        }

        // Reload ticket with updated messages read status
        $ticket = \App\Models\Ticket::with(['messages.attachments', 'messages.sender', 'creator'])->findOrFail($id);

        return response()->json($ticket);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'attachments.*' => 'nullable|file|max:10240',
        ]);

        $user = $request->user();
        $ticket = \App\Models\Ticket::findOrFail($id);

        if ($user->role !== 'admin' && $user->role !== 'super_admin' && $ticket->created_by_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = $ticket->messages()->create([
            'sender_id' => $user->id,
            'sender_role' => $user->role ?? 'customer',
            'message' => $request->message,
            'is_internal_note' => $request->is_internal_note ?? false,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('tickets/' . $ticket->id, 'local');
                
                $message->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }
        
        // If user replies, ensure ticket status updates to OPEN so admin knows to reply
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
             $ticket->update(['status' => 'OPEN']);
             
             // Notify Admins
             $admins = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->get();
             \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\TicketReplyNotification($ticket, $user->role));
        }
        
        // If admin replies, change to WAITING_FOR_USER
         if (($user->role === 'admin' || $user->role === 'super_admin')) {
             if ($ticket->status === 'OPEN') {
                 $ticket->update(['status' => 'WAITING_FOR_USER']);
             }
             // Notify the user who created the ticket
             $creator = \App\Models\User::find($ticket->created_by_id);
             if ($creator) {
                 $creator->notify(new \App\Notifications\TicketReplyNotification($ticket, 'admin'));
             }
        }


        return response()->json($message->load('attachments', 'sender'));
    }
    
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $request->validate([
            'status' => 'required|in:OPEN,IN_PROGRESS,WAITING_FOR_USER,RESOLVED,CLOSED'
        ]);
        
        $ticket = \App\Models\Ticket::findOrFail($id);
        $ticket->update(['status' => $request->status]);
        
        return response()->json($ticket);
    }
    
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $ticket = \App\Models\Ticket::findOrFail($id);
        $ticket->delete();
        
        return response()->json(['message' => 'Ticket deleted successfully']);
    }

    public function downloadAttachment(Request $request, $ticketId, $attachmentId)
    {
        $user = $request->user();
        $ticket = \App\Models\Ticket::findOrFail($ticketId);

        if ($user->role !== 'admin' && $user->role !== 'super_admin' && $ticket->created_by_id !== $user->id) {
            abort(403);
        }

        $attachment = \App\Models\TicketAttachment::whereIn('ticket_message_id', function($query) use ($ticketId) {
            $query->select('id')->from('ticket_messages')->where('ticket_id', $ticketId);
        })->findOrFail($attachmentId);

        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($attachment->file_path)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->download($attachment->file_path, $attachment->file_name);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Ticket::query();

        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            $query->where('created_by_id', $user->id);
        }

        $tickets = $query->get();

        $total = $tickets->count();
        $active = $tickets->whereNotIn('status', ['RESOLVED', 'CLOSED'])->count();
        $resolved = $tickets->whereIn('status', ['RESOLVED', 'CLOSED'])->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'resolved' => $resolved
        ]);
    }
}
