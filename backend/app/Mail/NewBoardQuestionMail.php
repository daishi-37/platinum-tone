<?php

namespace App\Mail;

use App\Models\BoardPost;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBoardQuestionMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public BoardPost $post) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【tone 掲示板】新しい質問が届きました',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.board.new-question',
            with: [
                'authorName' => $this->post->user->name,
                'postedAt'   => $this->post->created_at,
                'body'       => $this->post->body,
                'boardUrl'   => rtrim((string) config('app.frontend_url', config('app.url')), '/') . '/board',
            ],
        );
    }
}
