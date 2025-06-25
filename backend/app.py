from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from rapidfuzz import fuzz

app = Flask(__name__)
CORS(app)

# Load datasets
urban = pd.read_csv('data/urban_dictionary.csv')
genz = pd.read_csv('data/gen_zz_words.csv')
slang_dataset = pd.read_csv('data/english_slang_dataset.csv')

# slang dictionary
slang_dict = {}

# Load 1st dictionary
for index, row in urban.iterrows():
    try:
        word = str(row['word']).lower().strip()
        meaning = str(row['definition']).strip()
        slang_dict[word] = meaning
    except:
        continue

# Load 2nd dictionary
for index, row in genz.iterrows():
    try:
        word = str(row['Word']).lower().strip()
        meaning = str(row['Definition']).strip()
        slang_dict[word] = meaning
    except:
        continue

# Load 3rd dictionary
for index, row in slang_dataset.iterrows():
    try:
        # Remove extra quotes
        word = str(row['Slang']).lower().strip().replace('"', '')
        meaning = str(row['Meaning']).strip().replace('"', '')
        slang_dict[word] = meaning
    except:
        continue

@app.route('/check_slang', methods=['POST'])
def check_slang():
    data = request.get_json()
    input_text = data.get('inputText', '').lower()

    detected_slangs = []

    # Clean input
    input_text_cleaned = ''.join(char if char.isalnum() or char.isspace() else ' ' for char in input_text)

    # Try to match full phrases first
    for slang_word in slang_dict.keys():
        score = fuzz.token_sort_ratio(input_text_cleaned, slang_word)
        if score > 70:
            detected_slangs.append({
                'word': slang_word,
                'meaning': slang_dict[slang_word]
            })

    # Also try matching individual words
    input_words = input_text_cleaned.split()

    for word in input_words:
        best_match = None
        best_score = 0

        for slang_word in slang_dict.keys():
            score = fuzz.ratio(word, slang_word)
            if score > best_score:
                best_score = score
                best_match = slang_word

        if best_score > 70:
            already_added = any(s['word'] == best_match for s in detected_slangs)
            if not already_added:
                detected_slangs.append({
                    'word': best_match,
                    'meaning': slang_dict[best_match]
                })

    return jsonify({'slang': detected_slangs})


if __name__ == '__main__':
    app.run(debug=True)
