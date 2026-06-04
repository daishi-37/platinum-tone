# 掲示板 技術設計書

> 最終更新: 2026-06-04  
> 対応仕様書: [board-spec.md](board-spec.md)

---

## 1. DB設計

### board_posts（タイムライン投稿）

質問（生徒）と呼びかけ（講師）を1テーブルに統合。`type` で区別する。

```sql
CREATE TABLE board_posts (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    type       ENUM('question', 'announcement') NOT NULL DEFAULT 'question',
    body       TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### board_answers（Q&A回答）

`board_posts.type = 'question'` のレコードにのみ紐づく。

```sql
CREATE TABLE board_answers (
    id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id  BIGINT UNSIGNED NOT NULL,
    user_id  BIGINT UNSIGNED NOT NULL,
    body     TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (post_id)  REFERENCES board_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);
```

**カスケード削除**:
- 質問・呼びかけ削除 → 紐づく回答もすべて削除
- ユーザー削除 → そのユーザーの投稿・回答もすべて削除

---

## 2. モデル設計

### BoardPost

```php
class BoardPost extends Model
{
    protected $fillable = ['user_id', 'type', 'body'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(BoardAnswer::class, 'post_id')->with('user:id,name');
    }

    public function isQuestion(): bool
    {
        return $this->type === 'question';
    }

    public function isAnnouncement(): bool
    {
        return $this->type === 'announcement';
    }
}
```

### BoardAnswer

```php
class BoardAnswer extends Model
{
    protected $fillable = ['post_id', 'user_id', 'body'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(BoardPost::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## 3. API設計

### 3-1. タイムライン一覧 `GET /api/members/board`

質問・呼びかけを `created_at DESC` で返す。質問には `answers` と `answers_count`・`can_delete` を付与。

**レスポンス例**:
```json
[
  {
    "id": 42,
    "type": "question",
    "body": "発声練習をするとき、どのくらいの時間を毎日かければ効果が出ますか？",
    "created_at": "2026-06-04T14:32:00+09:00",
    "user": { "id": 10, "name": "田中さん" },
    "answers": [
      {
        "id": 7,
        "body": "毎日15分でも継続することが大切です。",
        "created_at": "2026-06-05T10:00:00+09:00",
        "user": { "id": 1, "name": "仙台エリ" }
      }
    ],
    "answers_count": 1,
    "can_delete": false
  },
  {
    "id": 41,
    "type": "announcement",
    "body": "皆さん、今週末にワークショップを開催します！",
    "created_at": "2026-06-04T10:00:00+09:00",
    "user": { "id": 1, "name": "仙台エリ" },
    "answers": null,
    "answers_count": null,
    "can_delete": false
  },
  {
    "id": 40,
    "type": "question",
    "body": "オーディションの前日にやるべき準備は何ですか？",
    "created_at": "2026-06-03T09:00:00+09:00",
    "user": { "id": 15, "name": "鈴木さん" },
    "answers": [],
    "answers_count": 0,
    "can_delete": true
  }
]
```

**`can_delete` の判定ロジック**:
- `type = 'question'` かつ 自分の投稿 かつ `answers_count = 0` → `true`
- 管理者の場合は常に `true`
- `type = 'announcement'` の場合は会員は常に `false`

**コントローラー実装**:
```php
public function index(Request $request): JsonResponse
{
    $user = $request->user();

    $posts = BoardPost::with(['user:id,name', 'answers.user:id,name'])
        ->latest()
        ->get()
        ->map(function ($post) use ($user) {
            $data = [
                'id'            => $post->id,
                'type'          => $post->type,
                'body'          => $post->body,
                'created_at'    => $post->created_at,
                'user'          => $post->user->only('id', 'name'),
                'answers'       => $post->isQuestion() ? $post->answers : null,
                'answers_count' => $post->isQuestion() ? $post->answers->count() : null,
                'can_delete'    => $this->canDelete($user, $post),
            ];
            return $data;
        });

    return response()->json($posts);
}

private function canDelete(User $user, BoardPost $post): bool
{
    if ($user->is_admin) return true;
    if ($post->type === 'announcement') return false;
    return $post->user_id === $user->id && $post->answers->isEmpty();
}
```

---

### 3-2. 質問投稿 `POST /api/members/board`

**リクエスト**:
```json
{ "body": "発声練習をするとき..." }
```

**バリデーション**:
```php
'body' => 'required|string|max:500'
```

**月次制限チェック**:
```php
$count = BoardPost::where('user_id', $user->id)
    ->where('type', 'question')
    ->whereYear('created_at', now()->year)
    ->whereMonth('created_at', now()->month)
    ->count();

if ($count >= 20) {
    return response()->json([
        'message'  => '今月の投稿上限（20件）に達しました。',
        'reset_at' => now()->startOfMonth()->addMonth()->toDateString(),
    ], 422);
}

$post = BoardPost::create([
    'user_id' => $user->id,
    'type'    => 'question',
    'body'    => $request->body,
]);
```

**成功レスポンス** `201`:
```json
{
  "id": 43,
  "type": "question",
  "body": "発声練習をするとき…",
  "created_at": "2026-06-04T15:00:00+09:00",
  "user": { "id": 10, "name": "田中さん" },
  "answers": [],
  "answers_count": 0,
  "can_delete": true
}
```

---

### 3-3. 呼びかけ投稿 `POST /api/admin/board/announce`

**リクエスト**:
```json
{ "body": "皆さん、今週末にワークショップを開催します！" }
```

**バリデーション**:
```php
'body' => 'required|string|max:500'
```

**成功レスポンス** `201`:
```json
{
  "id": 44,
  "type": "announcement",
  "body": "皆さん、今週末にワークショップを開催します！",
  "created_at": "2026-06-04T16:00:00+09:00",
  "user": { "id": 1, "name": "仙台エリ" },
  "answers": null,
  "answers_count": null,
  "can_delete": true
}
```

---

### 3-4. 残り投稿件数 `GET /api/members/board/remaining`

```json
{
  "used": 3,
  "limit": 20,
  "remaining": 17,
  "reset_at": "2026-07-01"
}
```

---

### 3-5. 質問削除 `DELETE /api/members/board/{id}`（会員）

**権限チェック**:
1. `type = 'question'` であることを確認（呼びかけは会員が削除不可）
2. 自分の投稿であることを確認（他人は `403`）
3. 回答が0件であることを確認（回答ありは `422`）

**エラーレスポンス**:
```json
{ "message": "この投稿を削除する権限がありません。" }     // 403
{ "message": "回答がついた質問は削除できません。" }        // 422
```

**成功レスポンス** `200`:
```json
{ "message": "質問を削除しました。" }
```

---

### 3-6. 回答投稿 `POST /api/admin/board/{id}/answers`（管理者）

**リクエスト**:
```json
{ "body": "毎日15分でも継続することが大切です。" }
```

**バリデーション**:
```php
'body' => 'required|string|max:2000'
```

**前提チェック**: `{id}` が `type = 'question'` の投稿であることを確認。

**成功レスポンス** `201`:
```json
{
  "id": 7,
  "body": "毎日15分でも継続することが大切です。",
  "created_at": "2026-06-05T10:00:00+09:00",
  "user": { "id": 1, "name": "仙台エリ" }
}
```

---

### 3-7. 投稿削除（管理者）`DELETE /api/admin/board/{id}`

- 質問・呼びかけどちらも削除可
- 回答はカスケード削除

---

### 3-8. 回答削除（管理者）`DELETE /api/admin/board/answers/{id}`

---

## 4. ルーティング

> **注意**: 固定パス（`/remaining`・`/announce`・`/answers/{id}`）はワイルドカード（`/{id}`）より**前**に定義する。

```php
// 会員向け
Route::middleware(['auth:sanctum', 'subscribed'])->prefix('members')->group(function () {
    Route::prefix('board')->group(function () {
        Route::get('/',           [BoardController::class, 'index']);
        Route::post('/',          [BoardController::class, 'store']);
        Route::get('/remaining',  [BoardController::class, 'remaining']); // /{id}より前
        Route::delete('/{id}',    [BoardController::class, 'destroy']);
    });
});

// 管理者向け
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::prefix('board')->group(function () {
        Route::get('/',                      [AdminBoardController::class, 'index']);
        Route::post('/announce',             [AdminBoardController::class, 'announce']);  // /{id}より前
        Route::delete('/answers/{answerId}', [AdminBoardController::class, 'destroyAnswer']); // /{id}より前
        Route::post('/{id}/answers',         [AdminBoardController::class, 'storeAnswer']);
        Route::delete('/{id}',               [AdminBoardController::class, 'destroyPost']);
    });
});
```

---

## 5. Slack通知設計

### 環境変数（`backend/.env`）
```
BOARD_SLACK_EMAIL=xxxxxxxxxx@tone-ac.slack.com
```

### `config/services.php`
```php
'slack' => [
    'board_email' => env('BOARD_SLACK_EMAIL'),
],
```

### Mailable
```php
class NewBoardQuestionMail extends Mailable
{
    public function __construct(public BoardPost $post) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '【tone 掲示板】新しい質問が届きました');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.board.new-question');
    }
}
```

### 送信タイミング（`BoardController@store` の末尾）
```php
// 質問投稿時のみ通知（呼びかけ・回答では通知しない）
Mail::to(config('services.slack.board_email'))
    ->send(new NewBoardQuestionMail($post));
```

---

## 6. フロントエンド設計

### コンポーネント構成

```
app/board/
├── page.tsx              # RequireMember でラップ
├── BoardClient.tsx       # メインコンポーネント（左右2ペイン管理・state管理）
├── Timeline.tsx          # 左パネル：タイムライン（質問＋呼びかけ混在）
├── PostBubble.tsx        # 吹き出し1件分（type='question'|'announcement' で見た目切替）
├── PostForm.tsx          # 投稿フォーム（会員:質問 / 管理者:呼びかけ で切替）
└── QAThread.tsx          # 右パネル：Q&Aスレッド（管理者時は回答フォームも表示）

app/admin/board/
└── page.tsx              # 管理者用：全投稿一覧・削除
```

---

### 型定義

```typescript
type BoardAnswer = {
  id: number
  body: string
  created_at: string
  user: { id: number; name: string }
}

type BoardPost = {
  id: number
  type: 'question' | 'announcement'
  body: string
  created_at: string
  user: { id: number; name: string }
  answers: BoardAnswer[] | null      // announcement の場合は null
  answers_count: number | null       // announcement の場合は null
  can_delete: boolean
}

type RemainingInfo = {
  used: number
  limit: number
  remaining: number
  reset_at: string
}
```

---

### 状態管理（`BoardClient.tsx`）

```typescript
const [posts, setPosts]           = useState<BoardPost[]>([])
const [selectedId, setSelectedId] = useState<number | null>(null)  // 選択中の質問ID
const [remaining, setRemaining]   = useState<RemainingInfo | null>(null)
const [loading, setLoading]       = useState(true)

// 選択中の質問（呼びかけを選んでも setSelectedId しない）
const selectedPost = posts.find(p => p.id === selectedId && p.type === 'question') ?? null
```

---

### 投稿・削除後のUI更新

| 操作 | state 更新内容 |
|------|--------------|
| 質問投稿成功 | `posts` の先頭に追加。`remaining.remaining` を -1 |
| 呼びかけ投稿成功 | `posts` の先頭に追加 |
| 質問削除成功 | `posts` から除外。選択中だった場合は `selectedId` を `null` に |
| 回答投稿成功 | 対象 post の `answers` 末尾に追加。`answers_count` を +1。`can_delete` を `false` に |
| 回答削除成功 | 対象 post の `answers` から除外。`answers_count` を -1。0件になったら `can_delete` を再評価 |

---

### `PostBubble.tsx` の表示切替

```tsx
// type='question' → 左寄せ、クリックでQ&Aスレッドを開く
// type='announcement' → 右寄せ、クリックしても何もしない

{post.type === 'question' && post.answers_count > 0 && (
  <span className="text-xs text-green-600 font-medium">✅ 回答あり</span>
)}
```

---

### `PostForm.tsx` の出し分け

```tsx
const { user } = useAuth()

if (isAdmin(user)) {
  // 呼びかけフォーム（POST /api/admin/board/announce）
} else {
  // 質問フォーム（POST /api/members/board）+ 残り件数表示
}
```

---

### `QAThread.tsx` の管理者回答フォーム

```tsx
{isAdmin(user) && (
  <div className="mt-6 border-t pt-4">
    <textarea
      value={answerBody}
      onChange={(e) => setAnswerBody(e.target.value)}
      maxLength={2000}
      placeholder="回答を入力してください"
      rows={4}
      className="w-full border rounded-lg p-3 text-sm resize-none"
    />
    <button
      onClick={handleAnswer}
      disabled={!answerBody.trim() || submitting}
      className="mt-2 bg-primary text-white px-4 py-2 rounded-lg text-sm"
    >
      回答する
    </button>
  </div>
)}
```

---

### レスポンシブ対応

| ブレークポイント | レイアウト |
|----------------|-----------|
| `md` 以上 | 左右2ペイン（左 `w-80` 固定・右 `flex-1`） |
| `md` 未満 | `selectedId === null` → タイムライン表示 / `selectedId !== null` → Q&Aスレッド表示 |

---

## 7. 既存ファイルへの追記

### 管理者サイドバー（`frontend/app/admin/layout.tsx`）

```typescript
// 既存の NAV_ITEMS 配列に追加
{ type: 'link', href: '/board', label: '掲示板を見る' },
```

管理者が `/board` にアクセスすると `RequireMember` をそのまま通過する（管理者も `isSubscribed` で `true` を返す）。

---

## 8. 実装ファイル一覧

### バックエンド

| ファイル | 役割 |
|---------|------|
| `app/Models/BoardPost.php` | 投稿モデル（質問・呼びかけ統合） |
| `app/Models/BoardAnswer.php` | 回答モデル |
| `app/Http/Controllers/BoardController.php` | 会員向けAPI |
| `app/Http/Controllers/AdminBoardController.php` | 管理者向けAPI |
| `app/Mail/NewBoardQuestionMail.php` | Slack通知メール |
| `resources/views/emails/board/new-question.blade.php` | メールテンプレート |
| `database/migrations/..._create_board_posts_table.php` | 投稿テーブル |
| `database/migrations/..._create_board_answers_table.php` | 回答テーブル |

### フロントエンド

| ファイル | 役割 |
|---------|------|
| `app/board/page.tsx` | エントリポイント |
| `app/board/BoardClient.tsx` | 状態管理・2ペイン制御 |
| `app/board/Timeline.tsx` | 左パネル：タイムライン |
| `app/board/PostBubble.tsx` | 吹き出し1件分 |
| `app/board/PostForm.tsx` | 投稿フォーム（会員/管理者で切替） |
| `app/board/QAThread.tsx` | 右パネル：Q&Aスレッド |
| `app/admin/board/page.tsx` | 管理画面：削除専用 |
