from flask import Flask, render_template, url_for, request
import sqlite3

app = Flask(__name__)

con=sqlite3.connect(database="profile_connection.db", check_same_thread=False)
cursor=con.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS profile(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
    )''')
con.commit()

@app.route('/',methods=['GET', 'POST'])
def homepage():
    if request.method == "POST":
        name=request.form["fullname"]
        email=request.form["email"]
        message=request.form["message"]
        cursor.execute('''
        INSERT INTO profile (name, email,message)
            VALUES (?, ?, ?)
        ''', (name, email,message))
        con.commit()
        return render_template('index.html',success=True)
    return render_template('index.html')


