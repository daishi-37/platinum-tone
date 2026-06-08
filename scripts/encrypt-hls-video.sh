#!/bin/bash
#
# encrypt-hls-video.sh — 動画ファイルを「映像+音声のAES-128 HLS」に変換して zip にまとめる
#
# 入力は mp4 / mov / mkv など ffmpeg が読める動画なら何でも可。
#
# 使い方:
#   ./scripts/encrypt-hls-video.sh <入力動画> <slug>
#   例) ./scripts/encrypt-hls-video.sh ~/Desktop/lesson01.mp4 lesson-01
#
# 出力:
#   dist/<slug>/            … 作業フォルダ（playlist.m3u8 / seg_*.ts / enc.key）
#   dist/<slug>.zip         … 管理画面からアップロードする zip
#
# 仕組み:
#   - ffmpeg で動画を AES-128 暗号化した HLS（映像+音声）に変換する
#   - m3u8 内の鍵URIは相対パス "key" にしてあるため、配信環境に依存しない
#     （サーバー側で /api/members/lessons/<slug>/key に解決される）
#   - .ts は暗号化済みなので公開保存してよい。enc.key だけは会員限定で配信される
#
# 必要: ffmpeg, openssl, zip（ローカルMacにインストール済みであること）

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "使い方: $0 <入力動画(mp4/mov等)> <slug>" >&2
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

# 3. ffmpeg で「映像+音声」AES-128 HLS に変換
#    - 映像は H.264 / 音声は AAC に再エンコード（互換性重視）
#    - キーフレーム間隔をセグメント長に合わせて分割を安定化
ffmpeg -y -i "$INPUT" \
  -c:v libx264 -profile:v main -level 4.0 -preset medium -crf 21 \
  -c:a aac -b:a 128k -ac 2 \
  -g 48 -keyint_min 48 -sc_threshold 0 \
  -hls_time 6 \
  -hls_key_info_file "$OUTDIR/key_info.txt" \
  -hls_playlist_type vod \
  -hls_segment_filename "$OUTDIR/seg_%03d.ts" \
  "$OUTDIR/playlist.m3u8"

# 4. zip 化（フォルダ内のファイルをフラットに固める。key_info.txt は不要なので除外）
rm -f "dist/$SLUG.zip"
( cd "$OUTDIR" && zip -q "../$SLUG.zip" playlist.m3u8 seg_*.ts enc.key )

echo ""
echo "✅ 完了: dist/$SLUG.zip"
echo "   このzipを管理画面のレッスン編集画面からアップロードしてください。"
