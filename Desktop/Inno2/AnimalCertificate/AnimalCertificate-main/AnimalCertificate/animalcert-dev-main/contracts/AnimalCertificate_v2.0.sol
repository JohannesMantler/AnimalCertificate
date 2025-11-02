// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AnimalCertificate is ERC721 {
    enum Species {
        Dog, Cat, Horse, Ferret, Hamster, GuineaPig, Rabbit, Turtle, Snail
    }

    enum Color {
        Black, White, Brown, Grey, Red, Orange
    }

    enum Gender {
        Female, Male
    }

    enum Disease {
        Arthritis,
        ChronicKidneyDisease,
        Hepatitis,
        DiabetesMellitus,
        CushingDisease,
        AddisonDisease,
        Cancer,
        Hyperthyroidism,
        Atopy
    }

    struct Animal {
        uint256 id;
        uint256 mother;
        uint256 father;
        uint256 matePartner;
        bool pregnant;
        Species species;
        string name;
        Gender gender;
        uint256[] diseases;
        uint256 dateOfBirth;
        uint256 dateOfDeath;
        Color furColor;
        string imageHash;
    }

    Animal[] public animals;

    event AnimalMinted(uint256 indexed id, address indexed owner, string name);

    constructor() ERC721("AnimalCertificate", "ANIMAL_CERTIFICATE") {}

    function mint(
        uint8 _gender,
        uint8 _species,
        string memory _name,
        uint256 _dateOfBirth,
        uint8[] memory _diseases,
        uint8 _furColor,
        string memory _imageHash
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_gender <= uint8(Gender.Male), "Invalid gender");
        require(_species <= uint8(Species.Snail), "Invalid species");
        require(_furColor <= uint8(Color.Orange), "Invalid color");

        // Validate and convert diseases to uint256[]
        uint256[] memory convertedDiseases = new uint256[](_diseases.length);
        for (uint i = 0; i < _diseases.length; i++) {
            require(_diseases[i] <= uint8(Disease.Atopy), "Invalid disease ID");
            convertedDiseases[i] = uint256(_diseases[i]);
        }

        uint256 newId = animals.length;

        Animal memory animal = Animal({
            id: newId,
            mother: 0,
            father: 0,
            matePartner: newId, // defaults to self
            pregnant: false,
            species: Species(_species),
            name: _name,
            gender: Gender(_gender),
            diseases: convertedDiseases,
            dateOfBirth: _dateOfBirth,
            dateOfDeath: 0,
            furColor: Color(_furColor),
            imageHash: _imageHash
        });

        animals.push(animal);
        _mint(msg.sender, newId);

        emit AnimalMinted(newId, msg.sender, _name);
    }

    function getAnimal(uint256 _id) public view returns (Animal memory) {
        require(_id < animals.length, "Invalid animal ID");
        return animals[_id];
    }

    function totalSupply() public view returns (uint256) {
        return animals.length;
    }

    function addDisease(uint256 _tokenId, uint8 _disease) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_disease <= uint8(Disease.Atopy), "Invalid disease");

        Animal storage animal = animals[_tokenId];
        require(animal.dateOfDeath == 0, "Animal is deceased");

        for (uint i = 0; i < animal.diseases.length; i++) {
            require(animal.diseases[i] != _disease, "Already has this disease");
        }

        animal.diseases.push(_disease);
    }

    function removeDisease(uint256 _tokenId, uint8 _disease) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_disease <= uint8(Disease.Atopy), "Invalid disease");

        Animal storage animal = animals[_tokenId];
        require(animal.dateOfDeath == 0, "Animal is deceased");

        bool found = false;
        uint index = 0;
        for (uint i = 0; i < animal.diseases.length; i++) {
            if (animal.diseases[i] == _disease) {
                found = true;
                index = i;
                break;
            }
        }

        require(found, "Disease not found");

        for (uint i = index; i < animal.diseases.length - 1; i++) {
            animal.diseases[i] = animal.diseases[i + 1];
        }
        animal.diseases.pop();
    }
}
