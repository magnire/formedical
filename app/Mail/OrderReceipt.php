<?php

namespace App\Mail;

use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Barryvdh\DomPDF\Facade\Pdf;


class OrderReceipt extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public readonly Order $order)
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order #{$this->order->id} Receipt",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-receipt',
            with: [
                'order' => $this->order,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // Generate PDF
        $pdf = Pdf::loadView('pdfs.order-receipt', ['order' => $this->order]);

        return [
            Attachment::fromData(
                fn () => $pdf->output(),
                "order-{$this->order->id}-receipt.pdf"
            )->withMime('application/pdf'),
        ];
    }
}
