import os
import json
import time
import logging
from kafka import KafkaConsumer, KafkaProducer
# import google.generativeai as genai
from groq import Groq

client = Groq(api_key=os.environ['GROQ_API_KEY'])
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

# --- Configuration from environment variables ---
KAFKA_BOOTSTRAP    = os.environ['KAFKA_BOOTSTRAP_SERVERS']
# GEMINI_API_KEY     = os.environ['GEMINI_API_KEY']
INPUT_TOPIC        = 'dms.documents.uploaded'
OUTPUT_TOPIC       = 'dms.documents.translated'
CONSUMER_GROUP     = 'translator-service'
TARGET_LANGUAGE    = os.getenv('TARGET_LANGUAGE', 'French')

# --- Gemini setup ---
# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel('gemini-2.0-flash')

# --- Kafka Producer ---
producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: str(k).encode('utf-8'),
    acks='all',                  # wait for all replicas to confirm
    retries=3,
)

# --- Kafka Consumer (manual commit) ---
consumer = KafkaConsumer(
    INPUT_TOPIC,
    bootstrap_servers=KAFKA_BOOTSTRAP,
    group_id=CONSUMER_GROUP,
    auto_offset_reset='earliest',     # process all missed messages on restart
    enable_auto_commit=False,         # MANUAL commit
    value_deserializer=lambda b: json.loads(b.decode('utf-8')),
)

# def translate_title(title: str) -> str:
#     """Call Gemini to translate the document title."""
#     prompt = f"Translate the following document title to {TARGET_LANGUAGE}. Reply with only the translation, nothing else.\n\nTitle: {title}"
    
#     max_retries = 3
#     for attempt in range(max_retries):
#         try:
#             response = model.generate_content(prompt)
#             return response.text.strip()
#         except Exception as e:
#             log.warning(f"Gemini call failed (attempt {attempt + 1}/{max_retries}): {e}")
#             if attempt < max_retries - 1:
#                 time.sleep(2 ** attempt)   # exponential backoff: 1s, 2s, 4s
#             else:
#                 raise   # fail loudly after all retries exhausted

def translate_title(title: str) -> str:
    prompt = f"Translate the following document title to {TARGET_LANGUAGE}. Reply with only the translation, nothing else.\n\nTitle: {title}"
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            log.warning(f"Groq call failed (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise
# def process_message(event: dict) -> dict:
#     """Build the translated event payload."""
#     document_id = event.get('documentId')
#     title       = event.get('title', '')
    
#     log.info(f"Translating document {document_id}: '{title}'")
#     translated_title = translate_title(title)
#     log.info(f"Translated to {TARGET_LANGUAGE}: '{translated_title}'")
    
#     return {
#         'documentId':      document_id,
#         'originalTitle':   title,
#         'translatedTitle': translated_title,
#         'targetLanguage':  TARGET_LANGUAGE,
#         'fileName':        event.get('fileName'),
#         'contentType':     event.get('contentType'),
#         'translatedAt':    time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
#     }
def process_message(event: dict) -> dict:
    document_id = event.get('documentId')
    title       = event.get('title', '')
    description = event.get('description', '')

    log.info(f"Translating document {document_id}: '{title}'")
    translated_title = translate_title(title)
    log.info(f"Translated title: '{translated_title}'")

    translated_description = ''
    if description:
        translated_description = translate_title(description)
        log.info(f"Translated description: '{translated_description}'")

    return {
        'documentId':            document_id,
        'originalTitle':         title,
        'translatedTitle':       translated_title,
        'originalDescription':   description,
        'translatedDescription': translated_description,
        'targetLanguage':        TARGET_LANGUAGE,
        'fileName':              event.get('fileName'),
        'contentType':           event.get('contentType'),
        'translatedAt':          time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }

log.info(f"Translator service started. Listening on '{INPUT_TOPIC}'...")

for message in consumer:
    event = message.value
    log.info(f"Received event: {event}")
    
    try:
        # 1. Call Gemini
        translated_event = process_message(event)
        
        # 2. Publish result to output topic
        producer.send(
            OUTPUT_TOPIC,
            key=str(event.get('documentId')),
            value=translated_event
        )
        producer.flush()
        log.info(f"Published translated event for document {event.get('documentId')}")
        
        # 3. Commit offset ONLY after successful publish
        consumer.commit()
        
    except Exception as e:
        # Fail loudly — do NOT commit offset so message is reprocessed on restart
        log.error(f"Failed to process message: {e}")
        raise