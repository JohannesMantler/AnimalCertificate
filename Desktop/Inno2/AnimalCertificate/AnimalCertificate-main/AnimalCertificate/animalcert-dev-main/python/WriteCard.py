# WriteCard.py
import json
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from getAnimalNEW import get_animal_data  # Import the function

def write_nfc(data):
    writer = SimpleMFRC522()
    try:
        print("Place your NFC tag to write data.")
        data_string = json.dumps(data)  # Convert the dictionary to a JSON string
        writer.write(data_string)
        print("Write Successful")
    finally:
        GPIO.cleanup()

if __name__ == "__main__":
    animal_id = input('Enter Animal ID for fetching data: ')
    animal_data = get_animal_data(animal_id)
    if animal_data:
        write_nfc(animal_data)
    else:
        print("No data to write to NFC tag.")

