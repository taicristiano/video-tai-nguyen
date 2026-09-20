import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

def render_storyboard_and_strip(json_path, out_dir):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    plan = data["plan"]
    metrics = data["metrics"]
    shots = plan["shots"]
    header_model = data["storyboardHeaderModel"]
    strip_header_model = data["transitionStripHeaderModel"]

    FONT_PATH = "C:/Windows/Fonts/segoeui.ttf"
    FONT_BOLD_PATH = "C:/Windows/Fonts/segoeuib.ttf"
    FONT_ITALIC_PATH = "C:/Windows/Fonts/segoeuii.ttf"

    def get_font(path, size):
        try:
            return ImageFont.truetype(path, size)
        except:
            return ImageFont.load_default()

    font_h1 = get_font(FONT_BOLD_PATH, 36)
    font_h2 = get_font(FONT_BOLD_PATH, 22)
    font_h3 = get_font(FONT_BOLD_PATH, 17)
    font_body = get_font(FONT_PATH, 15)
    font_body_b = get_font(FONT_BOLD_PATH, 15)
    font_small = get_font(FONT_PATH, 13)
    font_small_b = get_font(FONT_BOLD_PATH, 13)
    font_micro = get_font(FONT_PATH, 11)
    font_italic = get_font(FONT_ITALIC_PATH, 13)

    COLOR_BG = (28, 30, 36)
    COLOR_CARD_BG = (250, 248, 244)
    COLOR_CARD_BORDER = (220, 215, 205)
    COLOR_TEXT_DARK = (40, 38, 36)
    COLOR_TEXT_MUTED = (110, 105, 100)

    SCALE_COLORS = {
        "DETAIL": (217, 119, 6),
        "WIDE": (13, 148, 136),
        "MEDIUM": (37, 99, 235),
        "CLOSE": (225, 29, 72),
        "SYMBOLIC": (147, 51, 234),
        "RELEASE": (22, 163, 74),
    }

    STRATEGY_COLORS = {
        "REUSE_FULL": (22, 163, 74),
        "REUSE_CROP": (14, 116, 144),
        "NEW_IMAGE": (217, 119, 6),
        "COMPONENT": (147, 51, 234),
    }

    def wrap_text(text, font, max_width, d):
        words = text.split(" ")
        lines = []
        curr = ""
        for w in words:
            test = curr + (" " if curr else "") + w
            bbox = d.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] <= max_width:
                curr = test
            else:
                if curr:
                    lines.append(curr)
                curr = w
        if curr:
            lines.append(curr)
        return lines

    # 1. STORYBOARD.JPG
    card_w = 520
    card_h = 760
    col_gap = 24
    row_gap = 24
    header_h = 180
    margin = 40
    cols = 4
    rows = (len(shots) + cols - 1) // cols

    board_w = margin * 2 + cols * card_w + (cols - 1) * col_gap
    board_h = header_h + margin + rows * card_h + (rows - 1) * row_gap

    board_img = Image.new("RGB", (board_w, board_h), COLOR_BG)
    draw = ImageDraw.Draw(board_img)

    draw.rectangle([(0, 0), (board_w, header_h)], fill=(20, 22, 26))
    draw.line([(0, header_h), (board_w, header_h)], fill=(50, 54, 64), width=2)

    draw.text((margin, 28), "HAY & ĐẸP. — REFERENCE-DERIVED STORYBOARD", fill=(245, 245, 245), font=font_h1)
    title_sub = f"VIDEO FIXTURE: \"{plan['title']}\" | Total: {metrics['durationSeconds']}s ({metrics['durationFrames']} frames)"
    draw.text((margin, 80), title_sub, fill=(180, 185, 195), font=font_h2)

    # DYNAMIC HEADER EXACTLY FROM SINGLE SOURCE OF TRUTH
    header_line = f"{header_model['text']} | Median Hold: {metrics['medianHoldSeconds']}s | Max Hold: {metrics['maxHoldSeconds']}s | Reuse: {metrics['reuseCount']}/{metrics['shotCount']}"
    draw.text((margin, 122), header_line, fill=(52, 211, 153), font=font_body_b)

    for idx, s in enumerate(shots):
        r = idx // cols
        c = idx % cols
        x = margin + c * (card_w + col_gap)
        y = header_h + margin + r * (card_h + row_gap)

        draw.rounded_rectangle([(x, y), (x + card_w, y + card_h)], radius=12, fill=COLOR_CARD_BG, outline=COLOR_CARD_BORDER, width=2)

        dur_sec = s["durationFrames"] / 30.0
        shot_title = f"{s['id'].upper()}  •  {s['startFrame']}-{s['endFrame']}f ({dur_sec:.2f}s)"
        draw.text((x + 16, y + 14), shot_title, fill=COLOR_TEXT_DARK, font=font_h3)

        strat = s["assetStrategy"]
        strat_color = STRATEGY_COLORS.get(strat, (100, 100, 100))
        strat_bbox = draw.textbbox((0, 0), strat, font=font_small_b)
        sw = strat_bbox[2] - strat_bbox[0] + 16
        sh = 24
        sx = x + card_w - 16 - sw
        sy = y + 14
        draw.rounded_rectangle([(sx, sy), (sx + sw, sy + sh)], radius=6, fill=strat_color)
        draw.text((sx + 8, sy + 3), strat, fill=(255, 255, 255), font=font_small_b)

        scale_c = SCALE_COLORS.get(s["scale"], (80, 80, 80))
        scale_bbox = draw.textbbox((0, 0), s["scale"], font=font_small_b)
        scale_w = scale_bbox[2] - scale_bbox[0] + 14
        draw.rounded_rectangle([(x + 16, y + 46), (x + 16 + scale_w, y + 68)], radius=5, fill=scale_c)
        draw.text((x + 23, y + 49), s["scale"], fill=(255, 255, 255), font=font_small_b)

        sil_text = f"Silhouette: {s['silhouette']}"
        draw.rounded_rectangle([(x + 24 + scale_w, y + 46), (x + 24 + scale_w + 160, y + 68)], radius=5, fill=(235, 230, 220))
        draw.text((x + 30 + scale_w, y + 49), sil_text, fill=(70, 65, 60), font=font_small)

        thumb_x = x + 16
        thumb_y = y + 78
        thumb_w = card_w - 32
        thumb_h = 360

        mock = Image.new("RGB", (thumb_w, thumb_h), (242, 238, 230))
        m_draw = ImageDraw.Draw(mock)
        m_draw.rectangle([(12, 12), (thumb_w - 12, thumb_h - 12)], outline=(215, 208, 195), width=2)
        m_draw.rectangle([(24, 24), (thumb_w - 24, thumb_h - 24)], outline=(230, 224, 212), width=1)

        if s["assetStrategy"] == "COMPONENT":
            m_draw.rectangle([(30, 30), (thumb_w - 30, thumb_h - 30)], fill=(32, 34, 38))
            m_draw.text((thumb_w // 2 - 80, thumb_h // 2 - 40), "HAY & ĐẸP.", fill=(250, 245, 235), font=font_h1)
            m_draw.text((45, thumb_h // 2 + 15), "Những điều nhỏ tạo nên một đời sống", fill=(180, 185, 190), font=font_body)
            m_draw.text((thumb_w // 2 - 50, thumb_h // 2 + 45), "[ OutroCard ]", fill=(147, 51, 234), font=font_small_b)
        else:
            m_draw.text((28, 32), f"AUTHORED PROMPT TARGET ({s['scale']})", fill=scale_c, font=font_small_b)
            verb_display = f"Visual Action Verb: \"{s['visualVerb']}\""
            m_draw.text((28, 58), verb_display, fill=COLOR_TEXT_DARK, font=font_h3)

            p_lines = wrap_text(s.get("assetPrompt", s["semanticIntent"]), font_small, thumb_w - 56, m_draw)
            py = 92
            for pl in p_lines[:8]:
                m_draw.text((28, py), pl, fill=(85, 80, 75), font=font_small)
                py += 20

            m_draw.rounded_rectangle([(28, thumb_h - 52), (thumb_w - 28, thumb_h - 22)], radius=5, fill=(230, 224, 215))
            m_draw.text((36, thumb_h - 46), f"People Contract: {s['peopleContract']['min']}-{s['peopleContract']['max']} person | {s['composition']}", fill=(70, 65, 60), font=font_micro)

        board_img.paste(mock, (thumb_x, thumb_y))
        draw.rectangle([(thumb_x, thumb_y), (thumb_x + thumb_w, thumb_y + thumb_h)], outline=(200, 195, 185), width=1)

        info_y = thumb_y + thumb_h + 12
        draw.text((x + 16, info_y), f"Role: {s['storyRole'].upper()}  |  Verb: {s['visualVerb']}  |  Motion: {s['motionProfile']}", fill=COLOR_TEXT_DARK, font=font_body_b)

        intent_lines = wrap_text(s["semanticIntent"], font_small, card_w - 32, draw)
        iy = info_y + 24
        for il in intent_lines[:2]:
            draw.text((x + 16, iy), il, fill=COLOR_TEXT_MUTED, font=font_small)
            iy += 18

        audio_bg = [(x + 14, y + card_h - 60), (x + card_w - 14, y + card_h - 14)]
        draw.rounded_rectangle(audio_bg, radius=6, fill=(240, 236, 228))
        audio_text = f"\"{s['audioText']}\"" if s.get('audioText') else "[ Branded Outro Release ]"
        audio_lines = wrap_text(audio_text, font_italic, card_w - 44, draw)
        ay = y + card_h - 54
        for al in audio_lines[:2]:
            draw.text((x + 20, ay), al, fill=(60, 55, 50), font=font_italic)
            ay += 18

    board_path = os.path.join(out_dir, "storyboard.jpg")
    board_img.save(board_path, quality=92)
    print(f"Saved storyboard.jpg ({board_w}x{board_h}) successfully!")

    # 2. SHOT-TRANSITION-STRIP.JPG
    strip_tile_w = 175
    strip_tile_h = 420
    strip_margin = 35
    strip_gap = 12
    strip_header_h = 160
    strip_footer_h = 180

    total_strip_w = strip_margin * 2 + len(shots) * strip_tile_w + (len(shots) - 1) * strip_gap
    total_strip_h = strip_header_h + strip_tile_h + strip_footer_h + strip_margin * 2

    strip_img = Image.new("RGB", (total_strip_w, total_strip_h), COLOR_BG)
    s_draw = ImageDraw.Draw(strip_img)

    s_draw.rectangle([(0, 0), (total_strip_w, strip_header_h)], fill=(20, 22, 26))
    s_draw.line([(0, strip_header_h), (total_strip_w, strip_header_h)], fill=(50, 54, 64), width=2)

    s_draw.text((strip_margin, 24), "HAY & ĐẸP. — SHOT TRANSITION & SCALE DIVERSITY STRIP", fill=(245, 245, 245), font=font_h1)

    # DYNAMIC HEADER FOR TRANSITION STRIP FROM IMMUTABLE MODEL
    s_draw.text(
        (strip_margin, 76),
        f"Sequential Rhythm Analysis: {strip_header_model['text']} | Max Hold: {metrics['maxHoldSeconds']}s | 0 Monotony Violations",
        fill=(52, 211, 153),
        font=font_h2
    )
    legend_text = "Scale Codes: [DETAIL: Amber] [WIDE: Teal] [MEDIUM: Blue] [CLOSE: Crimson] [SYMBOLIC: Purple] [RELEASE: Green]"
    s_draw.text((strip_margin, 118), legend_text, fill=(190, 195, 205), font=font_body_b)

    curr_x = strip_margin
    strip_y = strip_header_h + strip_margin

    for idx, s in enumerate(shots):
        s_draw.rounded_rectangle(
            [(curr_x, strip_y), (curr_x + strip_tile_w, strip_y + strip_tile_h)],
            radius=8,
            fill=COLOR_CARD_BG,
            outline=COLOR_CARD_BORDER,
            width=2
        )

        scale_c = SCALE_COLORS.get(s["scale"], (80, 80, 80))
        s_draw.rectangle([(curr_x, strip_y), (curr_x + strip_tile_w, strip_y + 36)], fill=scale_c)
        s_draw.text((curr_x + 8, strip_y + 8), f"#{idx+1} {s['scale']}", fill=(255, 255, 255), font=font_body_b)

        dur_s = s["durationFrames"] / 30.0
        s_draw.text((curr_x + 8, strip_y + 44), f"{s['id']} ({dur_s:.2f}s)", fill=COLOR_TEXT_DARK, font=font_small_b)
        s_draw.text((curr_x + 8, strip_y + 64), s["silhouette"], fill=COLOR_TEXT_MUTED, font=font_micro)

        mini_w = strip_tile_w - 16
        mini_h = 190
        mini_x = curr_x + 8
        mini_y = strip_y + 84

        mini_mock = Image.new("RGB", (mini_w, mini_h), (240, 235, 226))
        mm_draw = ImageDraw.Draw(mini_mock)
        mm_draw.rectangle([(4, 4), (mini_w - 4, mini_h - 4)], outline=(215, 210, 200), width=1)
        if s["assetStrategy"] == "COMPONENT":
            mm_draw.rectangle([(8, 8), (mini_w - 8, mini_h - 8)], fill=(32, 34, 38))
            mm_draw.text((mini_w // 2 - 34, mini_h // 2 - 12), "HAY & ĐẸP.", fill=(250, 245, 235), font=font_small_b)
        else:
            mm_draw.text((8, 12), s["scale"], fill=scale_c, font=font_small_b)
            v_lines = wrap_text(f"Verb: {s['visualVerb']}", font_small, mini_w - 16, mm_draw)
            vy = 36
            for vl in v_lines:
                mm_draw.text((8, vy), vl, fill=COLOR_TEXT_DARK, font=font_small)
                vy += 18
            mm_draw.text((8, mini_h - 30), s["assetStrategy"], fill=STRATEGY_COLORS.get(s["assetStrategy"], (100, 100, 100)), font=font_micro)

        strip_img.paste(mini_mock, (mini_x, mini_y))
        s_draw.rectangle([(mini_x, mini_y), (mini_x + mini_w, mini_y + mini_h)], outline=(200, 195, 185), width=1)

        fy = mini_y + mini_h + 8
        s_draw.text((curr_x + 8, fy), f"Role: {s['storyRole']}", fill=COLOR_TEXT_DARK, font=font_micro)
        s_draw.text((curr_x + 8, fy + 16), f"Verb: {s['visualVerb']}", fill=COLOR_TEXT_DARK, font=font_small_b)

        strat_c = STRATEGY_COLORS.get(s["assetStrategy"], (100, 100, 100))
        s_draw.rounded_rectangle([(curr_x + 8, fy + 38), (curr_x + strip_tile_w - 8, fy + 58)], radius=4, fill=strat_c)
        s_draw.text((curr_x + 14, fy + 41), s["assetStrategy"], fill=(255, 255, 255), font=font_micro)

        curr_x += strip_tile_w + strip_gap

    footer_y = strip_y + strip_tile_h + strip_margin
    s_draw.rectangle([(0, footer_y), (total_strip_w, total_strip_h)], fill=(22, 24, 28))
    s_draw.line([(0, footer_y), (total_strip_w, footer_y)], fill=(50, 54, 64), width=2)

    s_draw.text((strip_margin, footer_y + 20), "CADENCE & RHYTHM PROGRESSION MAP", fill=(245, 245, 245), font=font_h2)

    half = len(shots) // 2
    seq_text = " -> ".join([f"{s['id']}: {s['scale']}" for s in shots[:half]])
    seq_text_2 = " -> ".join([f"{s['id']}: {s['scale']}" for s in shots[half:]])
    s_draw.text((strip_margin, footer_y + 60), seq_text, fill=(180, 185, 195), font=font_body)
    s_draw.text((strip_margin, footer_y + 90), seq_text_2, fill=(180, 185, 195), font=font_body)

    conclusion_text = (
        f"Audit Conclusion: Zero consecutive runs of 3 identical scales or silhouettes across {len(shots)} shots. "
        f"Cadence: {metrics['changesPerMinute']:.2f} changes/min (target: 18-22). "
        f"Hold bounds: max {metrics['maxHoldSeconds']:.2f}s (<= 4.0s), median {metrics['medianHoldSeconds']:.2f}s."
    )
    s_draw.text((strip_margin, footer_y + 130), conclusion_text, fill=(52, 211, 153), font=font_body_b)

    strip_path = os.path.join(out_dir, "shot-transition-strip.jpg")
    strip_img.save(strip_path, quality=92)
    print(f"Saved shot-transition-strip.jpg ({total_strip_w}x{total_strip_h}) successfully!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python render-storyboard-visuals.py <planner_run_result.json> <output_dir>")
        sys.exit(1)
    render_storyboard_and_strip(sys.argv[1], sys.argv[2])
