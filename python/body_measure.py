"""
body_measure.py
===============
Core body measurement engine using MediaPipe Pose (Tasks API v1.0) + OpenCV.

MediaPipe 1.0.0 uses the Tasks API — mp.solutions is no longer available.
We use mediapipe.tasks.python.vision.PoseLandmarker with a bundled model.

Landmark index reference (MediaPipe 33-point BlazePose)
--------------------------------------------------------
0  NOSE          11 LEFT_SHOULDER   12 RIGHT_SHOULDER
13 LEFT_ELBOW    14 RIGHT_ELBOW     15 LEFT_WRIST     16 RIGHT_WRIST
23 LEFT_HIP      24 RIGHT_HIP       25 LEFT_KNEE      26 RIGHT_KNEE
27 LEFT_ANKLE    28 RIGHT_ANKLE
"""

import cv2
import mediapipe as mp
import numpy as np
import math
import urllib.request
import os

from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, RunningMode

# ── Download the pose model if not present ───────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker_heavy.task")
MODEL_URL  = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"

def _ensure_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Downloading pose model (~30MB)...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Model downloaded.")

_ensure_model()

# ── Pose landmarker options ───────────────────────────────────────────────────
_options = PoseLandmarkerOptions(
    base_options=mp_python.BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.IMAGE,
    num_poses=1,
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)

# ── Helper functions ─────────────────────────────────────────────────────────
def _load_image_cv(path: str) -> np.ndarray:
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Cannot load image: {path}")
    return img


def _get_landmarks(image_path: str):
    """
    Run PoseLandmarker on image and return list of NormalizedLandmark objects.
    Raises RuntimeError if no person detected.

    Uses OpenCV to load the image (more robust with temp paths), then converts
    the BGR numpy array to an RGB MediaPipe Image object.
    """
    # Load with OpenCV (handles any path, format, and encoding)
    bgr = cv2.imread(image_path)
    if bgr is None:
        # Try decoding via numpy in case of encoding issue
        raw = np.fromfile(image_path, dtype=np.uint8)
        bgr = cv2.imdecode(raw, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError(f"Cannot load image from: {image_path}")

    # MediaPipe expects RGB uint8
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    with PoseLandmarker.create_from_options(_options) as landmarker:
        result = landmarker.detect(mp_image)

    if not result.pose_landmarks or len(result.pose_landmarks) == 0:
        raise RuntimeError(
            "No person detected in the image. "
            "Please use a clear, full-body photo with good lighting."
        )
    return result.pose_landmarks[0]  # first person


def _px(lm, idx: int, w: int, h: int) -> tuple:
    return (int(lm[idx].x * w), int(lm[idx].y * h))


def _dist(p1: tuple, p2: tuple) -> float:
    return math.hypot(p2[0] - p1[0], p2[1] - p1[1])


def _midpoint(p1: tuple, p2: tuple) -> tuple:
    return ((p1[0] + p2[0]) // 2, (p1[1] + p2[1]) // 2)


def _chain_dist(*points) -> float:
    return sum(_dist(points[i], points[i + 1]) for i in range(len(points) - 1))


# ── Circumference correction factors ─────────────────────────────────────────
# Body cross-sections are approximately elliptical.
# width (front view) × factor ≈ circumference
CHEST_FACTOR = 2.73   # depth ≈ 0.65 × width
WAIST_FACTOR = 2.65
HIP_FACTOR   = 2.80   # depth ≈ 0.70 × width
NECK_FACTOR  = 2.95   # depth ≈ 0.85 × width


def measure_from_front(image_path: str, height_cm: float) -> dict:
    img        = _load_image_cv(image_path)
    h_px, w_px = img.shape[:2]
    lm         = _get_landmarks(image_path)

    def p(idx):
        return _px(lm, idx, w_px, h_px)

    # Scale reference: head-top to ankle midpoint
    nose      = p(0)
    l_ankle   = p(27)
    r_ankle   = p(28)
    ankle_mid = _midpoint(l_ankle, r_ankle)

    # Nose is ~87% of head height; estimate true top of head
    head_top_y = int(nose[1] - 0.13 * abs(ankle_mid[1] - nose[1]))
    body_px    = abs(ankle_mid[1] - head_top_y)

    if body_px < 50:
        raise RuntimeError(
            "Cannot determine body height from landmarks — "
            "please use a full-body photo."
        )

    px_per_cm = body_px / height_cm

    def cm(pixels: float) -> int:
        return max(1, round(pixels / px_per_cm))

    # Shoulder width
    l_shoulder  = p(11)
    r_shoulder  = p(12)
    shoulder_px = _dist(l_shoulder, r_shoulder)
    shoulder_cm = cm(shoulder_px)

    # Chest circumference (shoulder width × 0.92 × factor)
    chest_width_px = shoulder_px * 0.92
    chest_cm       = cm(chest_width_px * CHEST_FACTOR)

    # Waist circumference
    l_hip      = p(23)
    r_hip      = p(24)
    waist_x_l  = l_shoulder[0] + int((l_hip[0] - l_shoulder[0]) * 0.55)
    waist_x_r  = r_shoulder[0] + int((r_hip[0] - r_shoulder[0]) * 0.55)
    waist_width_px = abs(waist_x_r - waist_x_l)
    waist_cm       = cm(waist_width_px * WAIST_FACTOR)

    # Hip circumference
    hip_width_px = _dist(l_hip, r_hip) * 1.08
    hip_cm       = cm(hip_width_px * HIP_FACTOR)

    # Sleeve (right arm chain: shoulder → elbow → wrist)
    sleeve_px = _chain_dist(r_shoulder, p(14), p(16))
    sleeve_cm = cm(sleeve_px)

    # Inseam (hip midpoint → ankle midpoint)
    hip_mid   = _midpoint(l_hip, r_hip)
    inseam_px = _dist(hip_mid, ankle_mid)
    inseam_cm = cm(inseam_px)

    # Neck circumference (mouth width as proxy)
    l_mouth       = p(9)
    r_mouth       = p(10)
    neck_width_px = _dist(l_mouth, r_mouth) * 1.2
    neck_cm       = cm(neck_width_px * NECK_FACTOR)

    return {
        "chest":    chest_cm,
        "waist":    waist_cm,
        "hips":     hip_cm,
        "shoulder": shoulder_cm,
        "sleeve":   sleeve_cm,
        "inseam":   inseam_cm,
        "neck":     neck_cm,
    }


def measure_body(front_path: str, side_path: str, height_cm: float) -> dict:
    """Main entry — uses front photo for all measurements."""
    return measure_from_front(front_path, height_cm)
