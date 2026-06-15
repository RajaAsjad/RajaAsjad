from PIL import Image, ImageDraw, ImageFont

w, h = 1024, 220
img = Image.new("RGBA", (w, h), (10, 14, 26, 255))
draw = ImageDraw.Draw(img)
draw.rounded_rectangle((8, 8, w - 8, h - 8), radius=18, outline=(124, 58, 237, 255), width=2)

for y, col in [(140, (155, 48, 255, 40)), (170, (0, 229, 255, 30))]:
    draw.line([(40, y), (w - 40, y - 20)], fill=col, width=1)

try:
    font_big = ImageFont.truetype("georgia.ttf", 64)
    font_q = ImageFont.truetype("segoeui.ttf", 22)
    font_a = ImageFont.truetype("segoeui.ttf", 18)
except OSError:
    font_big = ImageFont.load_default()
    font_q = ImageFont.load_default()
    font_a = ImageFont.load_default()

draw.text((70, 30), "\u201c", fill=(155, 48, 255, 200), font=font_big)
draw.text((w - 110, h - 80), "\u201d", fill=(155, 48, 255, 200), font=font_big)

quote = "Code is like humor. When you have to explain it, it's bad."
bbox = draw.textbbox((0, 0), quote, font=font_q)
tw = bbox[2] - bbox[0]
draw.text(((w - tw) // 2, 88), quote, fill=(230, 237, 243, 255), font=font_q)

author = "\u2014 Cory House"
bbox2 = draw.textbbox((0, 0), author, font=font_a)
tw2 = bbox2[2] - bbox2[0]
draw.text(((w - tw2) // 2, 130), author, fill=(0, 229, 255, 255), font=font_a)

out = r"E:\xampp\htdocs\RajaAsjad\assets\quote-banner.png"
img.save(out, "PNG")
print(f"Saved {out}")
