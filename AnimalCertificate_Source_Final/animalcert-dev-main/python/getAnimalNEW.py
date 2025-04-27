# getAnimalNEW.py

import json
from web3 import Web3

def get_animal_data(id_parameter):
    try:
        # Setup Web3 connection and contract
        infura_url = "https://sepolia.infura.io/v3/6a3268b8e95340e1b07d6797dd77>
        contract_address = "0x5Bb451EeC632428Ded3e9d192f55d544442e8575"
        web3 = Web3(Web3.HTTPProvider(infura_url))
        if not web3.is_connected():
            raise ConnectionError("Failed to connect to Ethereum network.")

        # Load ABI data from a file
        with open('contract_abi3.json', 'r') as abi_definition:
            contract_abi = json.load(abi_definition)

        contract = web3.eth.contract(address=contract_address, abi=contract_abi)

        # Fetch animal data
        animal_result = contract.functions.getAnimal(int(id_parameter)).call()
        owner_result = contract.functions.ownerOf(int(id_parameter)).call()

        # Format the data
        data = {
            "Animal Data": animal_result,
            "Owner Address": owner_result
        }
        return data

    except FileNotFoundError:
        print("Error: ABI file not found. Please check the file path.")
        return None
    except json.JSONDecodeError:
        print("Error: Failed to decode ABI file. Ensure it's valid JSON.")
        return None
    except ConnectionError as e:
        print(f"Blockchain connection error: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

if __name__ == "__main__":
    animal_id = input('Enter Animal ID for fetching data: ')
    data = get_animal_data(animal_id)
    if data:
        print("Animal Data:", data["Animal Data"])
        print("Owner Address:", data["Owner Address"])
    else:
        print("No data retrieved.")
