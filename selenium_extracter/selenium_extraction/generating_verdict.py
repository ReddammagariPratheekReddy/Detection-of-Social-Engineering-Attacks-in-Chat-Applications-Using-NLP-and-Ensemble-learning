from pickle import load
from symspellpy.symspellpy import SymSpell, Verbosity
import math
from string import punctuation
import pandas as pd
import numpy as np
import re

# ✅ Correct paths (VERY IMPORTANT)
BASE_PATH = "selenium_extraction"

model_path = f"{BASE_PATH}/voting_classifier_model.pkl"

blacklist_words = open(f"{BASE_PATH}/topic_blacklist.txt", 'r').read().splitlines()
intention_words = open(f"{BASE_PATH}/intent_verbs.txt", 'r').read().splitlines()


# ✅ No WebRisk dependency
def check_safety_url(message):
    return 0, message


def correct_spellings_count_misspelled(message):
    def init_symspellpy():
        symspell_checker = SymSpell()
        dictionary_path = f"{BASE_PATH}/frequency_dictionary_en_82_765.txt"
        symspell_checker.load_dictionary(dictionary_path, 0, 1)
        return symspell_checker

    spell_checker = init_symspellpy()

    words = message.split()
    corrected_words = []
    count_misspelled = 0

    for word in words:
        suggestions = spell_checker.lookup(
            word,
            Verbosity.CLOSEST,
            max_edit_distance=2,
            ignore_token=r"\w*\d+"
        )
        if suggestions and word.lower() != suggestions[0].term:
            count_misspelled += 1
            corrected_words.append(suggestions[0].term)
        else:
            corrected_words.append(word)

    spell_score = 1 - math.e ** (-0.5 * count_misspelled)

    return spell_score, ' '.join(corrected_words)


def check_intent_score(message):
    message = re.sub(f"[{re.escape(punctuation)}]", "", message)

    def search(word):
        return 1 if word in message else 0

    count_b = sum([search(word) for word in blacklist_words])
    count_i = sum([search(word) for word in intention_words])

    x = 2 * count_b + count_i
    return 1 - math.e ** (-0.4 * x)


def load_model():
    with open(model_path, 'rb') as modelFile:
        return load(modelFile)


def predict_message(chatroom_id):
    messages_file = f'./messages_{chatroom_id}.txt'

    try:
        with open(messages_file, 'r') as f:
            string = f.read()
    except:
        return "No messages yet"

    # ✅ Feature extraction
    link_score, moded_string = check_safety_url(string)
    spelling_score, moded_corrected = correct_spellings_count_misspelled(moded_string)
    intent_score = check_intent_score(moded_corrected)

    # ✅ Prepare input
    input_values = pd.DataFrame({
        'intent': intent_score,
        'spelling': spelling_score,
        'link': link_score
    }, dtype=np.float32, index=[0])

    model = load_model()

    prediction = model.predict(input_values)[0]
    probability = model.predict_proba(input_values).max()

    if prediction == 1:
        return f"⚠ Suspicious (Confidence: {probability:.2f})"
    else:
        return "✅ Safe"