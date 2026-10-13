# AI-Based Identity Document Screening System (Problem ID: 26188)
### Border Security Checkpoint Platform — Ministry of Home Affairs (SSB, Police II Division)

An enterprise-grade, containerized AI document screening and fraud detection pipeline designed for high-throughput border checkpoints.

---

## 📌 Executive Summary & Architecture

At international border checkpoints (such as those monitored by **Sashastra Seema Bal**), officers process thousands of travel credentials daily. Traditional inspection is manual, vulnerable to advanced digital forgery, photo replacement, date manipulation, and impersonation.

This solution provides a decoupled, resilient architecture:
- **FastAPI Core Backend (`:8000`)**: Computer Vision pipeline executing **Error Level Analysis (ELA)**, facial landmark detection, regex-backed OCR parsing with PaddleOCR integration, deterministic risk scoring, and JSON + Heatmap streaming.
- **React (Vite + Tailwind CSS) SOC Dashboard (`:3000`)**: Security Operations Center interface featuring dual-pane original vs. heatmap visualizer, automated risk level assessment (Low / Secondary / Critical Alert), and structured biometric/credential extraction cards.
- **Docker & Docker Compose**: 1-command reproducible deployment with healthchecks and network bridging.

```
                    ┌───────────────────────────────────────────────┐
                    │  Border Control Station / Officer Dashboard   │
                    │         React 18 + Tailwind CSS (Port 3000)   │
                    └───────────────────────┬───────────────────────┘
                                            │ HTTP POST /api/screen
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │         FastAPI Screening Microservice        │
                    │                   (Port 8000)                 │
                    ├───────────────────────────────────────────────┤
                    │ 1. Document Preprocessing & EXIF Sanity       │
                    │ 2. Error Level Analysis (ELA at 90% Quality)  │
                    │ 3. ELA Heatmap Synthesis & Color Mapping      │
                    │ 4. Face Presence Detection (Haar / CV)        │
                    │ 5. OCR & Regex Parser (PaddleOCR + Fallback)  │
                    │ 6. Validation Rules & Deterministic Scoring   │
                    └───────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended Production Setup)

From the `id-screening-system` root folder:

```bash
docker-compose up --build
```

- **Frontend SOC Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Option 2: Running Locally Without Docker

#### 1. Backend Setup (Python 3.10+)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔬 Core AI & Computer Vision Algorithms

### 1. Error Level Analysis (ELA) for Tampering Detection
When an image is repeatedly saved or edited (e.g., photo replacement or date manipulation), spliced portions exhibit significantly distinct compression error levels compared to original pixels.
- The system resaves the uploaded image at a standardized **90% JPEG quality**.
- Subtracts resaved pixel values from the original:
  $$\Delta(x, y) = |I_{orig}(x, y) - I_{resaved}(x, y)|$$
- Scales brightness by an amplification factor ($15\times$) to accentuate localized inconsistencies.
- Computes mean, variance, and high-intensity anomaly clusters.
- Generates a JET/Inferno color heatmap base64 encoded for visual verification in the dashboard.

### 2. Document & Biometric Validation Engine
- **Field Extraction**: Extracts Full Name, Document Type (Passport, Driving License, National ID, Visa), Document Number, DOB, and Expiry Date.
- **Rule Verification**:
  - Expiry date verification against real-time checkpoint timestamps.
  - Checksum and regex validation for travel document standards (ICAO Doc 9303 compliant patterns).
  - Face presence check: verifies biometric photograph existence and flags absence or multiple face anomalies.

### 3. Risk Scoring Rubric
| Score Range | Classification | Status Badge | Operational Recommendation |
| :--- | :--- | :--- | :--- |
| **0% - 25%** | Low Risk | `VERIFIED / CLEAR` | Proceed with normal immigration clearance |
| **26% - 59%** | Moderate Risk | `SECONDARY INSPECTION` | Route to secondary booth for physical inspection |
| **60% - 100%** | High / Critical | `TAMPERING DETECTED` | Suspected fraud; freeze credentials and detain |

---

## 📂 Project Structure

```
id-screening-system/
├── backend/
│   ├── main.py              # FastAPI pipeline, ELA engine, OCR & Face detector
│   ├── requirements.txt     # Python backend dependencies
│   └── Dockerfile           # Optimized Python 3.10-slim image with OpenCV runtime
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # SOC Dark-mode Border Control Interface
│   │   ├── main.jsx         # Vite entrypoint
│   │   └── index.css        # Tailwind styling & radar glow animations
│   ├── index.html           # HTML5 semantic host
│   ├── package.json         # React 18, Lucide icons, Vite
│   ├── vite.config.js       # Vite configuration with proxy
│   ├── tailwind.config.js   # Tailwind custom design tokens
│   ├── postcss.config.js    # PostCSS plugins
│   ├── nginx.conf           # Production Nginx reverse-proxy / SPA server
│   └── Dockerfile           # Multi-stage Node builder + Nginx Alpine
├── docker-compose.yml       # Multi-container orchestration
└── README.md                # Project documentation
```
