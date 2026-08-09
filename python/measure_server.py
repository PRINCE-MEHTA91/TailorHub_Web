"""
measure_server.py
=================
Lightweight Flask API server that exposes one endpoint:

    POST /measure
    Content-Type: multipart/form-data
    Fields:
        frontPhoto  — front-view image file
        sidePhoto   — side-view image file
        heightCm    — real height in cm (number)

    Response 200:
        {
          "chest":    92,
          "waist":    78,
          "hips":     96,
          "shoulder": 43,
          "sleeve":   60,
          "inseam":   80,
          "neck":     37
        }

    Response 400/500:
        { "error": "message" }

Run with:
    python measure_server.py
Server listens on http://localhost:5001
"""

import os
import tempfile
import traceback

from flask import Flask, request, jsonify
from flask_cors import CORS

from body_measure import measure_body

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001",
                   "https://tailorhub-web.onrender.com"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def _save_upload(file_storage) -> str:
    """Save a werkzeug FileStorage to a temp file and return its path."""
    _, ext = os.path.splitext(file_storage.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")
    tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
    file_storage.save(tmp.name)
    tmp.close()
    return tmp.name


@app.route("/health", methods=["GET"])
def health():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "service": "TailorHub Measurement Engine"})


@app.route("/measure", methods=["POST"])
def measure():
    front_path = None
    side_path  = None

    try:
        # ── Validate inputs ───────────────────────────────────────────────
        if "frontPhoto" not in request.files:
            return jsonify({"error": "frontPhoto is required"}), 400
        if "sidePhoto" not in request.files:
            return jsonify({"error": "sidePhoto is required"}), 400

        height_raw = request.form.get("heightCm", "")
        try:
            height_cm = float(height_raw)
        except (ValueError, TypeError):
            return jsonify({"error": "heightCm must be a number"}), 400

        if not (100 <= height_cm <= 250):
            return jsonify({"error": "heightCm must be between 100 and 250"}), 400

        # ── Save uploads to temp files ────────────────────────────────────
        front_path = _save_upload(request.files["frontPhoto"])
        side_path  = _save_upload(request.files["sidePhoto"])

        # ── Run measurement engine ────────────────────────────────────────
        result = measure_body(front_path, side_path, height_cm)

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 422

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Internal server error — check server logs"}), 500

    finally:
        # ── Clean up temp files ───────────────────────────────────────────
        for path in (front_path, side_path):
            if path and os.path.exists(path):
                try:
                    os.unlink(path)
                except OSError:
                    pass


if __name__ == "__main__":
    port = int(os.environ.get("MEASURE_PORT", 5001))
    print(f"\n{'='*55}")
    print(f"  TailorHub Measurement Engine")
    print(f"  Listening on http://localhost:{port}")
    print(f"  POST /measure  — analyse front + side photos")
    print(f"  GET  /health   — service health check")
    print(f"{'='*55}\n")
    app.run(host="0.0.0.0", port=port, debug=False)
