import RPi.GPIO as gpio
from mfrc522 import SimpleMFRC522

def read_nfc():
    CardReader = SimpleMFRC522()
    try:
        print('Scanning for a card...')
        print('To cancel, press Ctrl+C')
        id, text = CardReader.read()
        print('NFC Tag ID:', id)
        print('NFC Tag Data:', text)
        return text
    except Exception as e:
        print('Error reading NFC tag:', str(e))
        return None
    finally:
        # Only clean up if GPIO has been set up
        if gpio.getmode() is not None:
            gpio.cleanup()

if __name__ == "__main__":
    tag_data = read_nfc()


