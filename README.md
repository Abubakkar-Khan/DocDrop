# DocDrop: High-Doodly Secure Digital Signatures

DocDrop is a stylized, full-stack platform for authenticating and verifying the integrity of documents using industry-standard cryptographic primitives. It features a unique "Doodly" sketchbook aesthetic while maintaining enterprise-grade security using RSA-2048 for asymmetric encryption and SHA-256 for secure message hashing.

---

## 🎨 Visual Identity: The Doodly Style
DocDrop blends a professional cryptographic tool with a playful, hand-drawn sketchbook aesthetic.
- **Notebook Design System**: Custom ruled-paper backgrounds and margin lines.
- **Hand-Drawn UI**: Borders, buttons, and icons rendered with `Rough.js` for a sketchy, organic feel.
- **Dynamic Parallax**: Background doodles that move subtly as you interact with the dashboard.
- **Custom Typography**: Using curated handwriting fonts (Architects Daughter, Gochi Hand, Patrick Hand).

---

## 🛠️ Technical Stack

### Backend (Secure Node)
- **Framework**: Flask (Python) with SQLAlchemy ORM.
- **Cryptography**: `cryptography` library implementing **RSA-PKCS1v1.5** padding and **SHA-256** hashing.
- **Authentication**: Stateless JWT (JSON Web Tokens) with secure session restoration.
- **Database**: SQLite (Relational).

### Frontend (User Interface)
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS v4 + Vanilla CSS Design Tokens.
- **Animations**: Framer Motion (Parallax, micro-interactions, layout transitions).
- **Sketchy Rendering**: Rough.js (Canvas-based hand-drawn aesthetics).
- **Icons**: Custom DoodleIcon library powered by Rough.js.

---

## 🔐 Cryptographic Workflow

### 1. Registration & Key Generation
Upon registration, the system generates a 2048-bit RSA keypair for the user. The public key is stored for verification by others, while the private key is used to sign documents.

### 2. Document Signing (RSA-PSS)
1. **Hashing**: The system generates a **SHA-256** digest of the document content.
2. **Signing**: The digest is signed using the sender's **Private Key** with **PKCS1v1.5** padding, ensuring compatibility and deterministic verification.
3. **Packaging**: The signature is attached to the document metadata and sent to the receiver.

### 3. Verification & Integrity Check
1. **Re-Hashing**: The receiver generates a new SHA-256 digest from the received document.
2. **Decryption**: The original signature is decrypted using the sender's **Public Key**.
3. **Comparison**: If the hashes match, the document is verified as authentic and untampered.

---

## 🚀 Installation and Deployment

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup
1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Run the API server**:
   ```bash
   python app.py
   ```
   *The server will start on `http://localhost:5000`*

### Frontend Setup
1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The app will be available on `http://localhost:5173` (or `5174` if 5173 is busy)*

---

## 📂 Project Structure

```text
DocDrop/
├── backend/
│   ├── app.py              # Flask Application Factory
│   ├── config.py           # Environment & App Config
│   ├── models/             # Database Schemas (User, Document)
│   ├── routes/             # API Blueprints (Auth, Docs, Crypto)
│   ├── services/           # Logic (Crypto Engine, File Handling)
│   └── instance/           # Local SQLite Database
├── frontend/
│   ├── src/
│   │   ├── components/     # Rough.js Wrappers & Sidebar
│   │   ├── pages/          # View Layers (Login, Upload, Inbox)
│   │   ├── context/        # Auth & Global State
│   │   └── api/            # Axios Client & Interceptors
│   └── index.css           # Doodly Design Tokens
└── README.md               # You are here
```

---

## 🔒 Security Considerations
DocDrop is designed as an educational and demonstration platform for cryptographic principles. In a production environment, private keys should be managed via Hardware Security Modules (HSMs) or Secure Enclaves, and the system should be deployed using HTTPS with strict CORS policies.
