from flask import Flask, render_template, url_for, request
import psycopg2

app = Flask(__name__)

con=psycopg2.connect(database="profiledb_h2tv", user="nithish",password="o5hqAMhiQNe7RvYU2YO9yfKQLqU3gyjw",host="dpg-cqliosg8fa8c73avo4ag-a.oregon-postgres.render.com",port="5432")
cursor=con.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS profile(
    id SERIAL PRIMARY KEY ,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    country TEXT NOT NULL,
    mobile TEXT NOT NULL,
    message TEXT NOT NULL
    )''')
con.commit()

@app.route('/',methods=['GET', 'POST'])
def homepage():
    if request.method == "POST":
        name=request.form["fullname"]
        email=request.form["email"]
        country=request.form["country"]
        mobile=request.form["mobile"]
        message=request.form["message"]
        cursor.execute('''
        INSERT INTO profile (name, email,country,mobile,message)
            VALUES (%s, %s, %s, %s, %s)
        ''', (name, email,country,mobile,message))
        con.commit()
        return render_template('index.html',success=True)
    return render_template('index.html')

if __name__=="__main__":
    app.run(debug=True)
