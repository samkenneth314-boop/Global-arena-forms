# app.py
import os, uuid, time, datetime
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, flash
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib import colors

# ----------------- CONFIG -----------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
TEMP_DIR = os.path.join(UPLOAD_DIR, 'temp')
PDF_DIR = os.path.join(UPLOAD_DIR, 'pdfs')

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

app = Flask(__name__, static_folder=STATIC_DIR, template_folder=TEMPLATES_DIR)
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # 8 MB
app.secret_key = 'supersecretkey123'

# ---------- Church details ----------
CHURCH_NAME = "Global Arena of Liberty Ministry"
CHURCH_BRANCH = "KASOA – OFAAKOR BRANCH"
CHURCH_ADDRESS = "P.O. Box 119, Bogoso, Ghana"
CHURCH_WEBSITE = "globalarenaoflibertyministry.com"
CHURCH_PHONE = "+233 548 534 024"

# ---------- Admin credentials ----------
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "liberty2025"

# ---------- Helper Functions ----------
def save_temp_photo(file_storage):
    """Save uploaded photo temporarily and return filename."""
    if not file_storage or file_storage.filename == "":
        return None
    filename = secure_filename(file_storage.filename)
    ext = os.path.splitext(filename)[1].lower()
    token = uuid.uuid4().hex
    saved_name = f"{token}{ext}"
    path = os.path.join(TEMP_DIR, saved_name)
    file_storage.save(path)
    return saved_name

def create_pdf(data: dict, temp_photo_filename: str) -> str:
    """Create and save a membership PDF file."""
    safe_name = secure_filename(f"{data.get('first_name','')} {data.get('last_name','')}".strip()) or "member"
    timestamp = time.strftime("%Y%m%d%H%M%S")
    pdf_filename = f"{safe_name.replace(' ', '_')}_{timestamp}.pdf"
    pdf_path = os.path.join(PDF_DIR, pdf_filename)

    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()
    normal = styles['Normal']
    heading = styles['Heading1']

    # ---------- Header (Logo + Title Block) ----------
    header_table_data = []

    logo_path = os.path.join(STATIC_DIR, 'church_logo.png')
    if os.path.exists(logo_path):
        logo = RLImage(logo_path, width=1.5*inch, height=1.5*inch)
        logo.hAlign = 'CENTER'
    else:
        logo = ""

    header_text = f"""
    <b>{CHURCH_NAME}</b><br/>
    {CHURCH_BRANCH}<br/>
    {CHURCH_ADDRESS}<br/>
    {CHURCH_WEBSITE} • {CHURCH_PHONE}
    """

    header_table_data.append([logo, Paragraph(header_text, normal)])
    header_table = Table(header_table_data, colWidths=[1.8*inch, 4.5*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(header_table)
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b><font size=14>Membership Form Submission</font></b>", heading))
    story.append(Spacer(1, 12))

    # ---------- Member Photo (optional) ----------
    if temp_photo_filename:
        photo_path = os.path.join(TEMP_DIR, temp_photo_filename)
        if os.path.exists(photo_path):
            try:
                p = RLImage(photo_path, width=2*inch, height=2*inch)
                p.hAlign = 'CENTER'
                story.append(p)
                story.append(Spacer(1, 12))
            except Exception:
                pass

    # ---------- Member Info ----------
    fields = [
        ('First Name', data.get('first_name','')),
        ('Last Name', data.get('last_name','')),
        ('Gender', data.get('gender','')),
        ('Marital Status', data.get('marital_status','')),
        ('Date of Birth', data.get('dob','')),
        ('Age', data.get('age','')),
        ('Email', data.get('email','')),
        ('Phone', data.get('phone','')),
        ('Address', data.get('address','')),
        ('Residence', data.get('residence','')),
        ('Landmark', data.get('landmark','')),
        ('Home Town', data.get('home_town','')),
        ('Region', data.get('region','')),
        ('Occupation', data.get('occupation','')),
        ("Mother's Name", data.get('mother','')),
        ("Father's Name", data.get('father','')),
        ('Date Joining the Church', data.get('join_date','')),
    ]

    for label, value in fields:
        story.append(Paragraph(f"<b>{label}:</b> {value}", normal))
        story.append(Spacer(1, 6))

    doc.build(story)
    return pdf_filename

# ---------- Form Routes ----------
@app.route('/', methods=['GET'])
def form():
    pre = {k: request.args.get(k, '') for k in (
        'first_name','last_name','gender','dob','age','email','phone','address','born_again',
        'marital_status','residence','landmark','home_town','region','occupation',
        'mother','father','join_date','temp_photo')}
    return render_template('form.html', pre=pre,
                           church_name=CHURCH_NAME, church_address=CHURCH_ADDRESS,
                           church_website=CHURCH_WEBSITE, church_phone=CHURCH_PHONE)

@app.route('/preview', methods=['POST'])
def preview():
    temp_photo = None
    existing_temp = request.form.get('temp_photo', '')
    file_photo = request.files.get('photo')

    if file_photo and file_photo.filename:
        temp_photo = save_temp_photo(file_photo)
    else:
        temp_photo = existing_temp if existing_temp else None

    # Get form data
    data = {k: request.form.get(k,'').strip() for k in (
        'first_name','last_name','gender','dob','age','email','phone','address','born_again',
        'marital_status','residence','landmark','home_town','region','occupation',
        'mother','father','join_date')}

    # Auto-calculate age if DOB is filled and age not provided
    if data.get('dob') and not data.get('age'):
        try:
            dob = datetime.datetime.strptime(data['dob'], "%Y-%m-%d").date()
            today = datetime.date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            data['age'] = str(age)
        except Exception:
            data['age'] = ''

    return render_template('preview.html', data=data, temp_photo=temp_photo,
                           church_name=CHURCH_NAME, church_address=CHURCH_ADDRESS,
                           church_website=CHURCH_WEBSITE, church_phone=CHURCH_PHONE)

@app.route('/edit', methods=['POST'])
def edit():
    data = {k: request.form.get(k,'') for k in (
        'first_name','last_name','gender','dob','age','email','phone','address','born_again',
        'marital_status','residence','landmark','home_town','region','occupation',
        'mother','father','join_date')}
    data['temp_photo'] = request.form.get('temp_photo','')
    return redirect(url_for('form', **data))

@app.route('/submit', methods=['POST'])
def submit():
    temp_photo = request.form.get('temp_photo', None)
    data = {k: request.form.get(k,'').strip() for k in (
        'first_name','last_name','gender','dob','age','email','phone','address','born_again',
        'marital_status','residence','landmark','home_town','region','occupation',
        'mother','father','join_date')}

    pdf_filename = create_pdf(data, temp_photo)
    if temp_photo:
        try:
            os.remove(os.path.join(TEMP_DIR, temp_photo))
        except Exception:
            pass

    return render_template('success.html', pdf_filename=pdf_filename,
                           church_name=CHURCH_NAME, church_address=CHURCH_ADDRESS,
                           church_website=CHURCH_WEBSITE, church_phone=CHURCH_PHONE)

@app.route('/download/<path:filename>')
def download(filename):
    return send_from_directory(PDF_DIR, filename, as_attachment=True)

@app.route('/uploads/temp/<path:filename>')
def temp_images(filename):
    return send_from_directory(TEMP_DIR, filename)

# ---------- Admin Routes ----------
@app.route('/admin/login', methods=['GET','POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username','')
        password = request.form.get('password','')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'danger')
            return redirect(url_for('admin_login'))
    return render_template('admin_login.html')

@app.route('/admin/remove/<path:filename>', methods=['POST'])
def admin_remove(filename):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))

    pdf_path = os.path.join(PDF_DIR, filename)
    try:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            flash(f"'{filename}' removed successfully.", "success")
        else:
            flash(f"File '{filename}' not found.", "warning")
    except Exception as e:
        flash(f"Error removing {filename}: {e}", "danger")

    return redirect(url_for('admin_dashboard'))


@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    pdf_files = sorted(os.listdir(PDF_DIR), reverse=True)
    return render_template('admin_dashboard.html', pdf_files=pdf_files)

@app.route('/admin/download/<path:filename>')
def admin_download(filename):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    return send_from_directory(PDF_DIR, filename, as_attachment=True)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

# ---------- Run ----------
if __name__ == '__main__':
    app.run(debug=True)
