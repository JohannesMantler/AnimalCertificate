import React, { Component } from 'react';
import * as AnimalMaps from '../constants';
import { Web3Context } from '../../Web3Context';
import RadialMenu from '../pages/bits/RadialMenu';
import { NFTStorage, File } from 'nft.storage';

// ✅ Put your NFT.Storage API key here as a string
const NFT_STORAGE_TOKEN = 'a04caecf.a66b3f99e54441f68d64a0829918aae2';

class MintAnimal extends Component {
  static contextType = Web3Context;

  constructor(props) {
    super(props);
    this.diseases = [];
    this.imageHash = '';
    this.state = {
      imagePreview: null,
    };
  }

  handleSelectChange = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions, option => parseInt(option.value));
    this.diseases = selectedValues;
  };

  handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

    try {
      const metadata = await client.store({
        name: 'Animal Image',
        description: 'Image for animal token',
        image: new File([file], file.name, { type: file.type }),
      });

      this.imageHash = metadata.data.image.href;
      this.setState({ imagePreview: this.imageHash });

      console.log("Image uploaded to IPFS:", this.imageHash);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  mint = (gender, species, name, birthdate, diseases, furColor, imageHash) => {
    const { contract, address } = this.context.web3data;
    contract.methods
      .mint(gender, species, name, birthdate, diseases, furColor, imageHash)
      .send({ from: address })
      .once('receipt', (receipt) => {
        console.log("Mint successful");
      });
  };

  render() {
    return (
      <main>
        <h1 className="page-heading">Issue Token</h1>
        <form onSubmit={(event) => {
          event.preventDefault();

          const unixTimestamp = Math.floor(new Date(this.birthdate.value).getTime() / 1000);

          this.mint(
            this.gender.value,
            this.species.value,
            this.name.value,
            unixTimestamp,
            this.diseases,
            this.furColor.value,
            this.imageHash
          );
        }} className='mx-10'>

          <input type='text' placeholder='Name' ref={(input) => { this.name = input }} required className='input-style' />
          <input type='text' placeholder='Species (0-8)' ref={(input) => { this.species = input }} required className='input-style' />
          <input type='text' placeholder='Gender (0 or 1)' ref={(input) => { this.gender = input }} required className='input-style' />
          <input type='date' ref={(input) => { this.birthdate = input }} required className='input-style' />

          <RadialMenu title={"lol"} name={"animal"} options={["o1", "a2", "d3"]} />

          <select multiple onChange={this.handleSelectChange} className='input-style'>
            <option disabled value="">Select diseases</option>
            {Object.entries(AnimalMaps.ANIMAL_DISEASES).map(([key, value]) => (
              key !== "99" && <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <input type='text' placeholder='Fur Color (0-5)' ref={(input) => { this.furColor = input }} required className='input-style' />

          {/* Upload Image Button */}
          <div className="mb-4">
          <label htmlFor="imageUpload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
            📷 Upload Animal Image
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={this.handleImageUpload}
            className="hidden"
          />
        </div>


          {/* Image Preview */}
          {this.state.imagePreview && (
            <div className="mt-4">
              <p>Image uploaded successfully:</p>
              <img src={this.state.imagePreview} alt="Animal" className="mt-2 rounded-lg w-64 border" />
            </div>
          )}

          <input type='submit' value='MINT' className='crypto-button-vanilla crypto-button-base mt-6' />
        </form>
      </main>
    );
  }
}

export default MintAnimal;
