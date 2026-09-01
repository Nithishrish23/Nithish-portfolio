import os
from flask import Flask, render_template, request, jsonify
from urllib.request import Request, urlopen
from urllib.parse import urlencode

app = Flask(__name__)
GOOGLE_SHEET_WEBHOOK_URL = os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "").strip()


def submit_contact_to_sheet(data):
    if not GOOGLE_SHEET_WEBHOOK_URL:
        return False
    payload = urlencode({
        "fullname": data.get("fullname", ""),
        "email": data.get("email", ""),
        "country": data.get("country", ""),
        "mobile": data.get("mobile", ""),
        "message": data.get("message", ""),
    }).encode("utf-8")
    try:
        req = Request(
            GOOGLE_SHEET_WEBHOOK_URL,
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urlopen(req, timeout=10) as response:
            return 200 <= response.status < 300
    except Exception:
        app.logger.exception("Contact form submission failed")
        return False


@app.route("/", methods=["GET", "POST"])
def homepage():
    if request.method == "POST":
        data = request.form.to_dict()
        required = ["fullname", "email", "country", "mobile", "message"]
        if any(not data.get(key, "").strip() for key in required):
            return jsonify(success=False, message="Please complete all required fields."), 400
        if not submit_contact_to_sheet(data):
            return jsonify(success=False, message="Unable to save your message right now. Please email me directly."), 502
        return jsonify(success=True, message="Thanks! Your message has been received."), 200
    return render_template("index.html")


@app.route("/hello", methods=["GET"])
def home():
    return jsonify(message="Nithish Kumar P S")


if __name__ == "__main__":
    app.run(debug=True)
