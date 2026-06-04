<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新しい質問が届きました</title>
</head>
<body style="margin:0; padding:0; background-color:#f7fbfa; font-family:'Noto Sans JP', 'Hiragino Sans', sans-serif; color:#2D4659;">
    <div style="max-width:560px; margin:0 auto; padding:24px;">
        <p style="font-size:14px; line-height:1.9; margin:0 0 16px;">
            tone 掲示板に新しい質問が投稿されました。
        </p>

        <div style="border-top:2px solid #97d3c3; border-bottom:2px solid #97d3c3; padding:16px 0; margin:16px 0;">
            <p style="font-size:13px; line-height:1.8; margin:0 0 4px; color:#6a8699;">
                投稿者: <strong style="color:#2D4659;">{{ $authorName }}</strong>
            </p>
            <p style="font-size:13px; line-height:1.8; margin:0 0 12px; color:#6a8699;">
                投稿日時: {{ $postedAt?->timezone('Asia/Tokyo')->format('Y年n月j日 H:i') }}
            </p>
            <p style="font-size:13px; line-height:1.8; margin:0 0 4px; color:#6a8699;">質問内容:</p>
            <p style="font-size:14px; line-height:1.9; margin:0; white-space:pre-wrap;">{{ $body }}</p>
        </div>

        <p style="font-size:14px; line-height:1.9; margin:16px 0 8px;">
            掲示板で確認・回答する:
        </p>
        <p style="margin:0;">
            <a href="{{ $boardUrl }}" style="color:#7bbfae; font-size:14px; word-break:break-all;">{{ $boardUrl }}</a>
        </p>
    </div>
</body>
</html>
