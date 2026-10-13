import urllib.request
import json
import io
from PIL import Image, ImageDraw

def test(name, img, sensitivity="standard"):
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85)
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="{name}"\r\n'
        f'Content-Type: image/jpeg\r\n\r\n'
    ).encode() + buf.getvalue() + (
        f'\r\n--{boundary}\r\n'
        f'Content-Disposition: form-data; name="sensitivity"\r\n\r\n'
        f'{sensitivity}\r\n--{boundary}--\r\n'
    ).encode()
    req = urllib.request.Request(
        'http://localhost:8000/api/screen',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        print(f"=== {name} (Mode: {sensitivity}) ===")
        print(f"Type: {data['document_type']}")
        print(f"Risk: {data['risk_score']}%, Level: {data['risk_level']}")
        print(f"Status: {data['verification_status']}")
        print(f"Tampering: {data['tampering_detected']}")
        print(f"Metrics: {data['ela_metrics']}")
        print(f"Flags: {data['validation_flags']}")
        print()

# 1. Authentic Clean Document
auth = Image.new('RGB', (600, 380), color=(240, 240, 245))
d = ImageDraw.Draw(auth)
d.text((220, 50), 'GOVERNMENT OF INDIA', fill=(20, 20, 20))
d.text((220, 90), 'NAME: SHARMA, ARJUN', fill=(20, 20, 20))
d.text((220, 130), 'DOB: 15/08/1992', fill=(20, 20, 20))
d.text((220, 170), 'ID NO: 9283 1829 4819', fill=(20, 20, 20))
d.rectangle([(40, 50), (180, 220)], fill=(160, 170, 190), outline=(50, 50, 50))
test('clean_doc.jpg', auth, "standard")

# 2. Fake Document with SPECIMEN / SAMPLE / FAKE keyword or watermark
fake1 = auth.copy()
d_f1 = ImageDraw.Draw(fake1)
d_f1.text((150, 280), "SPECIMEN COPY - FORGERY", fill=(200, 20, 20))
test('user_fake_specimen.jpg', fake1, "standard")

# 3. User Fake with Spliced Face
fake2 = auth.copy()
p = Image.new('RGB', (140, 170), color=(40, 80, 150))
buf_p = io.BytesIO()
p.save(buf_p, 'JPEG', quality=99)
buf_p.seek(0)
fake2.paste(Image.open(buf_p), (40, 50))
test('user_spliced_photo.jpg', fake2, "high")
