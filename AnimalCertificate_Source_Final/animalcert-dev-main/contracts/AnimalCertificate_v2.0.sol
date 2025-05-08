// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AnimalCertificate is ERC721 {
    enum Species {
        Dog,
        Cat,
        Horse,
        Ferret,
        Hamster,
        GuineaPig,
        Rabbit,
        Turtle,
        Snail
    }

    enum Color {
        Black,
        White,
        Brown,
        Grey,
        Red,
        Orange
    }

    enum Gender {
        Female,
        Male
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
        uint id;
        uint mother;
        uint father;
        uint matePartner;
        bool pregnant;
        Species species;
        string name;
        Gender gender;
        uint[] diseases;
        uint256 dateOfBirth;
        uint256 dateOfDeath;
        Color furColor;
        string imageHash;
    }

    Animal[] public animals;

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

    uint256[] memory diseasesUint256 = new uint256[](_diseases.length);
    for (uint i = 0; i < _diseases.length; i++) {
        require(_diseases[i] <= uint8(Disease.Atopy), "Invalid disease ID");
        diseasesUint256[i] = uint256(_diseases[i]);
    }

    Animal memory animal = Animal({
        id: animals.length,
        mother: 0,
        father: 0,
        matePartner: animals.length, // default to self
        pregnant: false,
        species: Species(_species),
        name: _name,
        gender: Gender(_gender),
        diseases: diseasesUint256,
        dateOfBirth: _dateOfBirth,
        dateOfDeath: 0,
        furColor: Color(_furColor),
        imageHash: _imageHash
    });

    animals.push(animal);
    _mint(msg.sender, animal.id);
}



    function getAnimal(uint _id) public view returns (Animal memory) {
        require(_id < animals.length, "Invalid animal ID");
        return animals[_id];
    }

    function totalSupply() public view returns (uint) {
        return animals.length;
    }

    function addDisease(uint _tokenId, uint8 _disease) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_disease <= uint8(Disease.Atopy), "Invalid disease");

        Animal storage animal = animals[_tokenId];
        require(animal.dateOfDeath == 0, "Animal is deceased");

        for (uint i = 0; i < animal.diseases.length; i++) {
            require(animal.diseases[i] != _disease, "Already has this disease");
        }

        animal.diseases.push(_disease);
    }

    function removeDisease(uint _tokenId, uint8 _disease) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_disease <= uint8(Disease.Atopy), "Invalid disease");

        Animal storage animal = animals[_tokenId];
        require(animal.dateOfDeath == 0, "Animal is deceased");

        bool found = false;
        uint index;
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
