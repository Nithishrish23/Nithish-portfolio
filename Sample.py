from flask import Flask, render_template, url_for, request,jsonify

app = Flask(__name__)

@app.route('/',methods=['GET', 'POST'])
def homepage():
   
    return render_template('index.html')

@app.route('/hello',methods=['GET', 'POST'])
def home():
    return jsonify(message="RajakumariExim")

if __name__=="__main__":
    app.run(debug=True)
