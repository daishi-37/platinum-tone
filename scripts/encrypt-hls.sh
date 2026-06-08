#!/bin/bash
#
# encrypt-hls.sh — 音声ファイルを「音声のみAES-128 HLS」に変換して zip にまとめる
#
# 入力は mp3 / m4a / wav など ffmpeg が読める音声なら何でも可。
#
# 使い方:
#   ./scripts/encrypt-hls.sh <入力音声> <slug>
#   例) ./scripts/encrypt-hls.sh ~/Desktop/ep01.m4a episode-01
#
# 出力:
#   dist/<slug>/            … 作業フォルダ（playlist.m3u8 / seg_*.ts / enc.key）
#   dist/<slug>.zip         … 管理画面からアップロードする zip
#
# 仕組み:
#   - ffmpeg で MP3 を AES-128 暗号化した HLS（音声のみ）に変換する
#   - m3u8 内の鍵URIは相対パス "key" にしてあるため、配信環境に依存しない
#     （サーバー側で /api/members/podcast/<slug>/key に解決される）
#   - .ts は暗号化済みなので公開保存してよい。enc.key だけは会員限定で配信される
#
# 必要: ffmpeg, openssl, zip（ローカルMacにインストール済みであること）

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "使い方: $0 <入力音声(mp3/m4a/wav等)> <slug>" >&2
  exit 1
fi

INPUT="$1"
SLUG="$2"

if [ ! -f "$INPUT" ]; then
  echo "入力ファイルが見つかりません: $INPUT" >&2
  exit 1
fi

if ! echo "$SLUG" | grep -qE '^[a-z0-9-]+$'; then
  echo "slug は半角英数字とハイフンのみ使用できます: $SLUG" >&2
  exit 1
fi

OUTDIR="dist/$SLUG"
rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

# 1. 復号鍵（16バイト）を生成
openssl rand 16 > "$OUTDIR/enc.key"

# 2. key_info ファイル
#    1行目: m3u8 に書き込む鍵URI（相対パス "key"）
#    2行目: 暗号化に使う鍵ファイルのパス
#    3行目: IV（初期化ベクトル）
cat > "$OUTDIR/key_info.txt" <<EOF
key
$OUTDIR/enc.key
$(openssl rand -hex 16)
EOF

# 3. ffmpeg で「音声のみ」AES-128 HLS に変換
ffmpeg -y -i "$INPUT" \
  -vn -c:a aac -b:a 128k \
  -hls_time 10 \
  -hls_key_info_file "$OUTDIR/key_info.txt" \
  -hls_playlist_type vod \
  -hls_segment_filename "$OUTDIR/seg_%03d.ts" \
  "$OUTDIR/playlist.m3u8"

# 4. zip 化（フォルダ内のファイルをフラットに固める。key_info.txt は不要なので除外）
rm -f "dist/$SLUG.zip"
( cd "$OUTDIR" && zip -q "../$SLUG.zip" playlist.m3u8 seg_*.ts enc.key )

echo ""
echo "✅ 完了: dist/$SLUG.zip"
echo "   このzipを管理画面のバックステージ編集画面からアップロードしてください。"
